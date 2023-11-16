"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponent = exports.unload = exports.load = exports.methods = void 0;
const assets_menu_1 = require("./assets-menu");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /** 场景初始化后调用 */
    initData() {
        console.log("===========================场景已初始化，加载plist配置");
        (0, assets_menu_1.callSceneScript)('initMcCfg', []);
    },
    async onMenu1() {
        //获取当前选中类型
        let t_curSelectType = Editor.Selection.getLastSelectedType();
        // console.log(t_curSelectType);
        if (t_curSelectType == 'node') {
            //当前选中的是节点
            let t_uuid = Editor.Selection.getSelected(t_curSelectType);
            // console.log(t_uuid);
            // Editor.Message.request('scene', 'query-node', t_uuid).then((data) => {
            // 	console.log(data);
            // 	let t_com = getComponent(data, "cc.UITransform");
            // 	console.log(t_com);
            // 	console.log(t_com.value.anchorPoint);
            // });
            (0, assets_menu_1.callSceneScript)('saveMcCfg', [t_uuid]);
        }
        else if (t_curSelectType == 'asset') {
            //当前选中的是资源
        }
    },
    async onMenu2() {
        //获取当前选中类型
        let t_curSelectType = Editor.Selection.getLastSelectedType();
        if (t_curSelectType == 'node') {
            //当前选中的是节点
            let t_uuid = Editor.Selection.getSelected(t_curSelectType);
            //隐藏选中节点外的其他节点
            (0, assets_menu_1.callSceneScript)('hideOtherNode', [t_uuid]);
        }
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
//======================== 自定义方法 ===============================
function getComponent(pNode, pComponentName) {
    let t_coms = pNode.__comps__;
    if (t_coms) {
        for (let v of t_coms) {
            if (v.type == pComponentName) {
                return v;
            }
        }
    }
    return null;
}
exports.getComponent = getComponent;
