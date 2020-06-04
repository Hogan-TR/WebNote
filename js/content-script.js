function gRange() {
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
    let resNodes = dfsNodes(range);
    hightlight(resNodes);
}

document.onmouseup = () => {
    gRange();
};

function dfsNodes(range) {
    // extract data of S&E
    const startNode = range.startContainer;
    const startOffset = range.startOffset;
    const endNode = range.endContainer;
    const endOffset = range.endOffset;

    // JUST one node
    if (startNode === endNode) {
        if (startNode.nodeType === 3) {
            startNode.splitText(startOffset);
            let nextNode = startNode.nextSibling;
            nextNode.splitText(endOffset - startOffset);
            return [nextNode];
        }
    }

    let nodeList = []; // Stack Traversed
    let resNodes = []; // List recored
    let curNode = null;
    let withS = false; // Tag that means whether record node to resNodes
    let root = window.document; // Root node of the page
    nodeList.push(root);
    // Deep first
    while ((curNode = nodeList.pop())) {
        const children = curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeList.push(children[i]);
        }

        if (curNode === startNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(startOffset);
                resNodes.push(curNode.nextSibling);
            }
            // start record
            console.log("start traverse");
            withS = true;
        } else if (curNode === endNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(endOffset);
                resNodes.push(curNode);
            }
            // end record
            console.log("end traverse");
            break;
        } else if (withS && curNode.nodeType === 3) {
            resNodes.push(curNode);
        }
    }
    return resNodes;
}

function hightlight(nodes) {
    nodes.forEach((node) => {
        const wrap = document.createElement("span");
        wrap.setAttribute("class", "test");
        wrap.appendChild(node.cloneNode(false));
        node.parentNode.replaceChild(wrap, node);
    });
}
