chrome.contextMenus.create({
    title: "测试右键菜单",
    onclick: function () { alert('您点击了右键菜单！'); }
});

chrome.browserAction.setBadgeText({text: 'new'});
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});