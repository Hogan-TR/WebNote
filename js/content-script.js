// 向页面注入 JS
// function injectCustomJs(jsPath) {
//     jsPath = jsPath || 'js/inject.js';
//     console.log(jsPath);
//     var temp = document.createElement('script');
//     temp.setAttribute('type', 'text/javascript');
//     // temp.src = chrome.extension.getURL(jsPath);
//     console.log(document.head)
//     document.getElementsByTagName('head')
// }

// injectCustomJs()

function test(){
    console.log('Test from content-js');
}
test()