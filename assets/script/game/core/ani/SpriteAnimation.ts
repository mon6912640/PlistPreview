import { CCFloat, CCInteger, Enum, game, Sprite, SpriteAtlas, _decorator, log } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode, menu, disallowMultiple, executionOrder } = _decorator;

export enum ActionType {
    Idle,
    Run,
    Attack,
}
Enum(ActionType);

export let Action_Complete = 'Event_Complete';

@ccclass('SpriteAnimation')
@menu("SpriteAnimation")
@disallowMultiple(true)
@executionOrder(-1)
@executeInEditMode(true)
export class SpriteAnimation extends Sprite {

    @property
    playOnLoad: boolean = true;

    @property
    get playInEditor() {
        return this._editorPlaying;
    }

    set playInEditor(v) {
        this._editorPlaying = v;
        if (this._editorPlaying) {
            this.play();
        } else {
            this.stop()
        }
    }

    @property({ type: ActionType, tooltip: "默认动作" })
    defaultAct = ActionType.Idle;

    //加上property装饰器后，带下划线的私有变量不会出现在编辑器中，但会保存setter设置的值
    @property
    private _myatlas: SpriteAtlas = null;
    @property({ type: SpriteAtlas, tooltip: "设置plist，会自动更新spriteAtlas和spriteFrame属性" })
    public get myatlas(): SpriteAtlas {
        return this._myatlas;
    }
    public set myatlas(value: SpriteAtlas) {
        let t = this;
        t._myatlas = value;
        t.spriteAtlas = value;
        t.initByAtlas(value);
        if (value) {
            let t_frameKeys = t._actionKeysMap.get(t.defaultAct);
            if (t_frameKeys) {
                t.spriteFrame = t.spriteAtlas.getSpriteFrame(t_frameKeys[0]);
            }
            else {
                t.defaultAct = ActionType.Idle;
                t_frameKeys = t._actionKeysMap.get(t.defaultAct);
                t.spriteFrame = t.spriteAtlas.getSpriteFrame(t_frameKeys[0]);
            }
            t.play();
        }
        else {
            t.spriteFrame = null;
            t.stop();
        }
    }

    @property
    /** 帧间隔（s） */
    private _frameInterval = 0.1;
    @property({ type: CCFloat, tooltip: "帧间隔（s）" })
    get frameInterval() {
        return this._frameInterval;
    }
    set frameInterval(value: number) {
        let t = this;
        if (t._frameInterval != value) {
            t._frameInterval = value;
            if (t._playFlag) {
                t.stop();
                t.play();
            }
        }
    }

    /** 重复次数 */
    @property({ type: CCInteger, tooltip: "重复次数" })
    repeat = 0;

    /** 当前帧 */
    private _curFrame = 0;

    private _editorPlaying = false;

    private _playFlag = false;

    onLoad() {
        let t = this;
        t.sizeMode = Sprite.SizeMode.RAW;
        t.trim = false;
    }

    start() {
        let t = this;
        t.trim = false;
        if (t.playOnLoad && !EDITOR) {
            if (t.spriteAtlas)
                t.initByAtlas(t.spriteAtlas);
            t.play();
        }
    }

    private _actionKeysMap: Map<ActionType, string[]> = new Map<ActionType, string[]>();
    /**
     * 从plist中初始化动作数据
     * @param data 
     */
    private initByAtlas(data: SpriteAtlas) {
        let t = this;
        t._actionKeysMap.clear();
        if (data) {
            let t_idles = [];
            let t_attacks = [];
            let t_runs = [];
            for (let k in data.spriteFrames) {
                // let v = data.spriteFrames[k];
                log(k);
                if (isNaN(<any>k)) {
                    if (k.startsWith("attack")) {
                        t_attacks.push(k);
                    }
                    else if (k.startsWith("run")) {
                        t_runs.push(k);
                    }
                    else if (k.startsWith("stand")) {
                        t_idles.push(k);
                    }
                    else {
                        t_idles.push(k);
                    }
                }
                else {
                    t_idles.push(k);
                }
            }
            if (t_idles.length) {
                t_idles.sort(); //FreeTexturePacker输出的图集是无序的，需要排序
                t._actionKeysMap.set(ActionType.Idle, t_idles);
            }
            if (t_runs.length) {
                t_runs.sort(); //FreeTexturePacker输出的图集是无序的，需要排序
                t._actionKeysMap.set(ActionType.Run, t_runs);
            }
            if (t_attacks.length) {
                t_attacks.sort(); //FreeTexturePacker输出的图集是无序的，需要排序
                t._actionKeysMap.set(ActionType.Attack, t_attacks);
            }
        }
    }

    /** 渲染帧（通过计时器） */
    private renderFrame() {
        let t = this;
        let t_frameKeys = t._actionKeysMap.get(t.defaultAct);
        if (t_frameKeys && t_frameKeys.length) {
            let t_endFrame = t_frameKeys.length - 1;
            t.spriteFrame = t.spriteAtlas.getSpriteFrame(t_frameKeys[t._curFrame]);
            t._curFrame++;
            if (t._curFrame > t_endFrame)
                t._curFrame = 0;
        }
    }

    /** 渲染帧（通过update） */
    private renderFrame2(pCount: number) {
        let t = this;
        let t_frameKeys = t._actionKeysMap.get(t.defaultAct);
        if (t_frameKeys && t_frameKeys.length) {
            let t_index = (pCount % t_frameKeys.length);
            t_index = t_index < 0 ? t_frameKeys.length + t_index : t_index;
            t.spriteFrame = t.spriteAtlas.getSpriteFrame(t_frameKeys[t_index]);
            // let t_rect = t.spriteFrame.rect;
            // console.log(t_frameKeys[t_index], t_rect, t.spriteFrame.width, t.spriteFrame.height);

            if (t.repeat > 0) {
                //到达循环次数，停止播放
                let t_reCnt = ~~(pCount / t_frameKeys.length);
                if (t_reCnt >= t.repeat) {
                    t.stop();
                    t.node.emit(Action_Complete, t.defaultAct);
                }
            }
        }
    }

    private _startTs = 0;
    private _pauseTs = 0;
    /** 记录上次执行帧后剩余的时间 */
    private _remainTime = 0;
    play() {
        let t = this;
        t._playFlag = true;
        t._startTs = game.totalTime;
        // this.schedule(this.renderFrame, this._frameInterval);
    }

    private _pauseFlag = false;
    private _pauseTime = 0;
    pause() {
        let t = this;
        if (t._pauseFlag)
            return;
        t._pauseFlag = true;
        //暂停
        t._pauseTs = game.totalTime;
    }

    resume() {
        let t = this;
        if (!t._pauseFlag)
            return;
        t._pauseFlag = false;
        //恢复
        t._pauseTime += game.totalTime - t._pauseTs;
        t._pauseTs = 0;
    }

    stop() {
        let t = this;
        t._playFlag = false;
        t._pauseTs = 0;
        t._pauseFlag = false;
        t._remainTime = 0;
        // this.unschedule(this.renderFrame);
    }

    get isPlaying() {
        return this._playFlag;
    }

    get isPaused() {
        return this._pauseFlag;
    }

    update(dt: number) {
        let t = this;
        if (t._playFlag && t._startTs > 0 && !t._pauseFlag) {
            // t.renderFrame();
            // let t_totalFrames = director.getTotalFrames();
            let t_now = game.totalTime;

            let t_pass = t_now - t._remainTime - t._pauseTime - t._startTs;
            let t_interval = t._frameInterval * 1000;
            let t_count = ~~(t_pass / t_interval);
            let t_remain = t_pass % t_interval;
            t._remainTime = t_remain;
            t.renderFrame2(t_count);
        }
        else {
        }
    }
}

