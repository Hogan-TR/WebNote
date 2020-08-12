function iacMsg(buttonType, state) {
    window.postMessage({ wn_msg: buttonType, switch: state });
}

window.addEventListener("message", (event) => {
    let data = event.data;
    if (data.hasOwnProperty("task")) {
        let btns = document.getElementsByClassName("wn-btn");
        for (let i = 0; i < btns.length; i++) {
            btns[i].onclick = () => {
                iacMsg(btns[i].value, btns[i].getAttribute("switch"));
            };
        }
    }
});
