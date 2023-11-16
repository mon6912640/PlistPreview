"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callSceneScript = exports.onPanelMenu = exports.onDBMenu = exports.onAssetMenu = exports.onCreateMenu = void 0;
/** 点击创建+按钮 */
function onCreateMenu(assetInfo) {
    // return [
    // 	{
    // 		label: 'i18n:extend-assets-demo.menu.createAsset',
    // 		click() {
    // 			if (!assetInfo) {
    // 				console.log('get create command from header menu');
    // 			} else {
    // 				console.log('get create command, the detail of diretory asset is:');
    // 				console.log(assetInfo);
    // 			}
    // 		},
    // 	},
    // ];
}
exports.onCreateMenu = onCreateMenu;
;
/** 点击具体的资源 */
function onAssetMenu(assetInfo) {
    // console.log(assetInfo);
    switch (assetInfo.type) {
        case "cc.SpriteAtlas":
            //点击了plist文件
            return [
                {
                    label: 'ximi-创建序列帧节点',
                    click() {
                        // console.log(assetInfo.file, assetInfo.name);
                        //把资源的uuid传过去
                        callSceneScript('createNodeWithPlist', [assetInfo.uuid, assetInfo.name]);
                    },
                }
            ];
    }
    // return [
    // 	{
    // 		label: 'ximi-创建序列帧节点',
    // 		submenu: [
    // 			{
    // 				label: 'i18n:extend-assets-demo.menu.assetCommand1',
    // 				enabled: assetInfo.isDirectory,
    // 				click() {
    // 					console.log('get it');
    // 					console.log(assetInfo);
    // 				},
    // 			},
    // 			{
    // 				label: 'i18n:extend-assets-demo.menu.assetCommand2',
    // 				enabled: !assetInfo.isDirectory,
    // 				click() {
    // 					console.log('yes, you clicked');
    // 					console.log(assetInfo);
    // 				},
    // 			},
    // 		],
    // 	},
    // ];
}
exports.onAssetMenu = onAssetMenu;
;
/** 点击根目录 */
function onDBMenu(assetInfo) {
    return [
        {
            label: "ximi-点击根目录的菜单",
            click() {
                console.log("点击根目录", assetInfo);
            },
        },
    ];
}
exports.onDBMenu = onDBMenu;
/** 点击空白地方 */
function onPanelMenu(assetInfo) {
    // return [
    // 	{
    // 		label: "ximi-点击空白地方的菜单",
    // 		click() {
    // 			console.log("点击空白地方", assetInfo);
    // 		},
    // 	},
    // ];
}
exports.onPanelMenu = onPanelMenu;
//======================== 自定义方法 ===============================
/**
 * 调用scene.ts的方法
 * @param pFuncStr
 * @param pArgs
 */
async function callSceneScript(pFuncStr, pArgs) {
    const options = {
        name: 'ximi-plist-tool',
        method: pFuncStr,
        args: pArgs, //把资源的uuid传过去
    };
    //执行scene.ts中的方法，scene可以调用cc引擎脚本
    return await Editor.Message.request('scene', 'execute-scene-script', options);
}
exports.callSceneScript = callSceneScript;
