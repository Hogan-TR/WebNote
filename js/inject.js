function iacMsg(buttonType, state) {
    window.postMessage({ wn_msg: buttonType, switch: state });
}
