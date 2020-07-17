function sendMessage(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

let switch_box = document.getElementById("switch-input");
switch_box.onchange = function () {
    sendMessage({ type: "change", mark: switch_box.checked });
};

window.onload = () => {
    sendMessage({ type: "inquire" }, function (response) {
        switch_box.checked = response;
    });
};
