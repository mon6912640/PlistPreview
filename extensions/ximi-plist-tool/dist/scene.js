"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNode = exports.getNodeByUuid = exports.loadMcCfg = exports.getUid = exports.uid = exports.methods = exports.unload = exports.load = void 0;
//加入引擎脚本的搜索路径
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
//cc的类一定要在module后导入，否则会运行时识别不了scene的脚本
const cc_1 = require("cc");
const fs = __importStar(require("fs"));
/** 模块加载的时候触发的函数 */
function load() {
}
exports.load = load;
;
/** 模块卸载的时候触发的函数 */
function unload() {
}
exports.unload = unload;
;
/** 模块内定义的方法，可用于响应外部消息 */
exports.methods = {
    initMcCfg() {
        loadMcCfg();
    },
    async createNodeWithPlist(pUUID, pPlistName) {
        var _a;
        // const { director } = require('cc');
        // console.log("excuting createNodeWithPlist", pPlistName);
        let t_name = pPlistName.split('.')[0];
        let t_canvas = (_a = cc_1.director.getScene()) === null || _a === void 0 ? void 0 : _a.getChildByName("Canvas");
        // console.log(t_canvas);
        if (t_canvas) {
            let t_comList = t_canvas.getComponentsInChildren('SpriteAnimation');
            if (t_comList) {
                for (let t_com of t_comList) {
                    if (t_com.node.name == t_name) {
                        //高亮重名节点
                        Editor.Message.broadcast('ui-kit:touch-node', t_com.node.uuid);
                        console.warn('不允许创建同名节点，已存在名为' + t_name + '的节点，创建节点失败');
                        return;
                    }
                }
            }
            let t_nodeuuid = await createNode(t_canvas.uuid, t_name);
            // console.log(t_nodeuuid);
            let t_node = t_canvas.getChildByUuid(t_nodeuuid);
            let t_red = t_canvas.getChildByName('red');
            if (t_red) {
                //原点在最上层
                let t_index = t_red.getSiblingIndex();
                t_node.setSiblingIndex(t_index);
            }
            // console.log(t_node);
            let t_sp = t_node === null || t_node === void 0 ? void 0 : t_node.addComponent('SpriteAnimation'); //添加自定义组件
            // let t_plist: SpriteAtlas = <any>assetManager.assets.get(pUUID);
            cc_1.assetManager.loadAny({ uuid: pUUID }, (err, asset) => {
                if (!err) {
                    console.log('SpriteAnimation节点创建成功');
                    t_sp['myatlas'] = asset;
                    //如果存在配置，则设置为配置的值
                    let t_obj = saveObj[t_name];
                    if (t_obj) {
                        t_node.getComponent(cc_1.UITransform).setAnchorPoint(t_obj.anchors[0], t_obj.anchors[1]);
                        t_sp['frameInterval'] = t_obj.frameInterval;
                    }
                }
            });
        }
    },
    getNodeAnchorPoint(pUUID) {
        var _a;
        console.log("excuting getNodeAnchorPoint", pUUID);
        let t_node = getNodeByUuid(pUUID);
        // console.log(t_node);
        let t_anchorpoint = (_a = t_node === null || t_node === void 0 ? void 0 : t_node.getComponent(cc_1.UITransform)) === null || _a === void 0 ? void 0 : _a.anchorPoint;
        // console.log(t_anchorpoint);
        return t_anchorpoint;
    },
    /** 保存mc配置 */
    async saveMcCfg() {
        var _a, _b;
        //遍历所有含有SpriteAnimation组件的节点，把其anchorPoint保存到配置文件中
        //递归遍历场景树
        let t_comList = (_a = cc_1.director.getScene()) === null || _a === void 0 ? void 0 : _a.getComponentsInChildren('SpriteAnimation');
        if (t_comList) {
            for (let i = 0; i < t_comList.length; i++) {
                let t_com = t_comList[i];
                let t_uuid = t_com.node.uuid;
                let t_name = t_com.node.name;
                let t_frameInterval = t_com["frameInterval"];
                let t_anchorpoint = (_b = t_com.node.getComponent(cc_1.UITransform)) === null || _b === void 0 ? void 0 : _b.anchorPoint;
                let t_obj = {};
                t_obj.anchors = [t_anchorpoint.x, t_anchorpoint.y];
                t_obj.frameInterval = t_frameInterval;
                let t_maxWHMap = {};
                let t_hasWH = false;
                let t_actionKeysMap = t_com["_actionKeysMap"];
                if (t_actionKeysMap) {
                    if (t_actionKeysMap.size == 0) {
                        if (t_com["_myatlas"]) {
                            t_com["initByAtlas"](t_com["_myatlas"]);
                        }
                    }
                    if (t_actionKeysMap.size > 0 && t_com.spriteAtlas) {
                        t_actionKeysMap.forEach((p_value, p_key) => {
                            for (let v of p_value) {
                                let t_sf = t_com.spriteAtlas.getSpriteFrame(v);
                                let t_rect = t_sf.rect;
                                let t_maxWH = t_maxWHMap[p_key];
                                if (!t_maxWH) {
                                    t_maxWH = { w: t_rect.width, h: t_rect.height };
                                    t_maxWHMap[p_key] = t_maxWH;
                                }
                                else {
                                    if (t_maxWH.w < t_rect.width) {
                                        t_maxWH.w = t_rect.width;
                                    }
                                    if (t_maxWH.h < t_rect.height) {
                                        t_maxWH.h = t_rect.height;
                                    }
                                }
                            }
                        });
                        t_hasWH = true;
                    }
                }
                if (t_hasWH) {
                    t_obj.whMap = t_maxWHMap;
                }
                // if (t_saveObj[t_name]) {
                // 	console.warn(t_name, "存在同名节点，同名节点数据会被覆盖，请检查");
                // }
                //只输出不是默认值的配置
                if (t_anchorpoint.x != 0.5
                    || t_anchorpoint.y != 0.5
                    || t_obj.frameInterval != 0.1
                    || t_hasWH) {
                    saveObj[t_name] = t_obj;
                }
            }
        }
        //写入配置文件
        fs.writeFile(cfgPath, JSON.stringify(saveObj), (err) => {
            if (!err) {
                console.log('写入成功');
            }
            else {
                console.log('写入失败', cfgPath);
                console.error(err);
            }
        });
    },
    async hideOtherNode(pUUID) {
        var _a;
        let t_node = getNodeByUuid(pUUID);
        if (!t_node.getComponent('SpriteAnimation')) {
            console.warn("该节点没有SpriteAnimation组件");
            return;
        }
        let t_canvas = (_a = cc_1.director.getScene()) === null || _a === void 0 ? void 0 : _a.getChildByName("Canvas");
        if (t_canvas) {
            let t_comList = t_canvas.getComponentsInChildren('SpriteAnimation');
            if (t_comList) {
                for (let i = 0; i < t_comList.length; i++) {
                    let t_com = t_comList[i];
                    if (t_com.node.uuid != pUUID) {
                        t_com.node.active = false;
                    }
                    else {
                        t_com.node.active = true;
                    }
                }
            }
        }
        //调用刷新场景，更新节点的显示状态
        Editor.Message.request('scene', 'soft-reload');
    },
};
exports.uid = 0;
function getUid() {
    exports.uid++;
    return exports.uid;
}
exports.getUid = getUid;
var cfgPath = '';
var saveObj = {};
/** 加载mc_cfg.json配置 */
function loadMcCfg() {
    if (!cfgPath) {
        let t_projectPath = Editor.Project.path;
        let t_cfgPath = t_projectPath + '/mc_cfg.json';
        cfgPath = t_cfgPath;
    }
    try {
        fs.accessSync(cfgPath, fs.constants.F_OK);
        //读取配置文件
        let t_cfg = fs.readFileSync(cfgPath, 'utf-8');
        saveObj = JSON.parse(t_cfg);
        console.log('加载mc_cfg.json配置成功');
    }
    catch (error) {
    }
}
exports.loadMcCfg = loadMcCfg;
/**
 * 通过uuid获取节点
 * @param pUUID
 * @returns
 */
function getNodeByUuid(pUUID) {
    // cce的说明 https://forum.cocos.org/t/topic/132061
    return cce.Node.query(pUUID);
}
exports.getNodeByUuid = getNodeByUuid;
/**
 * 创建节点
 * @param pParentUUID 父节点uuid
 * @param pName 节点名称
 * @returns
 */
async function createNode(pParentUUID, pName) {
    let options = {
        parent: pParentUUID,
        components: ['cc.UITransform'],
        name: pName,
    };
    return await Editor.Message.request('scene', 'create-node', options);
}
exports.createNode = createNode;
