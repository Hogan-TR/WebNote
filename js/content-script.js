function selectText() {
    // save all nodes that between 'start'
    // and 'end' node(contain two endpoints)
    let selNodes = [];
    const sel = window.getSelection();
    // Block accidental clicks
    if (sel.toString().length === 0) {
        return;
    }

    // 'range' contain 'start' and 'end'
    // node of data that we have selected
    const range = sel.getRangeAt(0);
    const start = {
        node: range.startContainer,
        offset: range.startOffset,
        type: "startNode",
    };
    selNodes.push(split(start.node, start.offset, start.type));
    const end = {
        node: range.endContainer,
        offset: range.endOffset,
        type: "endNode",
    };
    selNodes.push(split(end.node, end.offset, end.type));

    console.log(selNodes);
}

function split(node, offset, type) {
    if (type === "startNode") {
        if (node.nodeType === 3) {
            node.splitText(offset);
            return node.nextSibling;
        }
    } else if (type === "endNode") {
        if (node.nodeType === 3) {
            node.splitText(offset);
            return node;
        }
    }
}
document.onmouseup = () => {
    selectText();
};
