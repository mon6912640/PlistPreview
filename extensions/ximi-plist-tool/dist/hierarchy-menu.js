"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onCreateMenu = void 0;
/** 点击创建+按钮 */
function onCreateMenu() {
    return [
        {
            label: 'fucyou',
            click() {
                // if (!assetInfo) {
                // 	console.log('get create command from header menu');
                // } else {
                // 	console.log('get create command, the detail of diretory asset is:');
                // 	console.log(assetInfo);
                // }
                console.log("hello world");
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
// /** 点击具体的资源 */
// export function onAssetMenu(assetInfo: AssetInfo) {
// 	console.log(assetInfo);
// 	return [
// 		{
// 			label: 'fucyou',
// 			click() {
// 				// if (!assetInfo) {
// 				// 	console.log('get create command from header menu');
// 				// } else {
// 				// 	console.log('get create command, the detail of diretory asset is:');
// 				// 	console.log(assetInfo);
// 				// }
// 				console.log("hello world");
// 			},
// 		},
// 	];
// };
// /** 点击根目录 */
// export function onDBMenu(assetInfo: AssetInfo) {
// 	return [
// 		{
// 			label: "ximi-点击根目录的菜单",
// 			click() {
// 				console.log("点击根目录", assetInfo);
// 			},
// 		},
// 	];
// }
/** 点击空白地方 */
function onPanelMenu() {
    return [
        {
            label: 'fuckfuck',
            click() {
                // if (!assetInfo) {
                // 	console.log('get create command from header menu');
                // } else {
                // 	console.log('get create command, the detail of diretory asset is:');
                // 	console.log(assetInfo);
                // }
                console.log("hello world");
            },
        },
    ];
}
exports.onPanelMenu = onPanelMenu;
;
