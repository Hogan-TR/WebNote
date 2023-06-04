function sendMessage(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!/^(chrome|edge)/.test(tabs[0]["url"])) {
      chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
        if (callback) callback(response);
      });
    }
  });
}

let switch_box = document.getElementById("switch-input");
switch_box.previousElementSibling.innerText =
  chrome.i18n.getMessage("function_switch");
switch_box.onchange = function () {
  sendMessage({ type: "change", mark: switch_box.checked });
};

let clear_button = document.getElementById("clear-button");
clear_button.innerText = chrome.i18n.getMessage("clear_notes");
clear_button.onclick = function () {
  switch_box.checked = false;
  sendMessage({ type: "clear" });
};

window.onload = () => {
  sendMessage({ type: "inquire" }, function (response) {
    switch_box.checked = response;
  });
};
