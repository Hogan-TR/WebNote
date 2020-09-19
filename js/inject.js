function iacMsg(buttonType, state, value) {
    window.postMessage({ wn_msg: buttonType, switch: state, data: value });
}

window.addEventListener("message", (event) => {
    let data = event.data;
    if (data.hasOwnProperty("task")) {
        switch (data["task"]) {
            case "note-bar": {
                let btns = document.getElementsByClassName("wn-btn");
                for (let i = 0; i < btns.length; i++) {
                    btns[i].onclick = () => {
                        iacMsg(
                            btns[i].value,
                            btns[i].getAttribute("switch"),
                            btns[i].value === "hl" ? "#FBF3DB" : undefined
                        );
                    };
                }
                break;
            }
            case "color-bar": {
                let btns = document.getElementsByClassName("color-item");
                for (let i = 0; i < btns.length; i++) {
                    btns[i].onclick = () => {
                        iacMsg("hl", "false", btns[i].value);
                    };
                }
                break;
            }
            case "comment-click": {
                let cmts = document.getElementsByClassName("wn_comment");
                [...cmts].forEach((cmt) => {
                    cmt.onclick = () => {
                        let id = cmt.getAttribute("wn_id").match(/C\w{10}/g)[0];
                        window.postMessage({ wn_id: id });
                    }
                });
                break;
            }
            case "comment-buttons": {
                let send = document.getElementsByClassName("wn-sboard")[0];
                let dl = document.getElementsByClassName("wn-dboard")[0];
                let id = send.parentElement.getAttribute("wn_id");
                send.onclick = () => {
                    let text = document.getElementsByClassName('wn-inputboard')[0].innerText;
                    window.postMessage({ wn_scmt: 'wn_comment', id: id, data: text });
                }
                if (dl) {
                    dl.onclick = () => {
                        window.postMessage({ wn_dcmt: 'wn_comment', id: id });
                    }
                }
                break;
            }
        }
    }
});
