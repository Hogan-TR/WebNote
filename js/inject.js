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
        }
    }
});
