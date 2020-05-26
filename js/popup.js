let button = document.getElementById('change');

button.onclick = function (element) {
    chrome.browserAction.setIcon({
        path: "images/eating.ico"
    });
}

//let winidow = chrome.extension.getBackgroundPage()