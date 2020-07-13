function mouseCapture() {
    const uri = window.location.href.replace(window.location.hash, "");
    const sel = window.getSelection();
    if (sel.toString().length === 0) {
        return;
    }
    const range = sel.getRangeAt(0);
    // structure range
    data = structureNode(range);
    saveSync(uri, data);
    const nodes = dfsNodes(range);
    highlight(nodes);
}

function pageRender() {
    const uri = window.location.href.replace(window.location.hash, "");
    chrome.storage.sync.get(uri, (items) => {
        if (JSON.stringify(items) !== "{}") {
            const data = items[uri];
            data.forEach((item) => {
                let start = antiNode(item["startContainer"]);
                let end = antiNode(item["endContainer"]);
                const range = {
                    startContainer: start["node"],
                    endContainer: end["node"],
                    startOffset: start["offset"],
                    endOffset: end["offset"],
                };
                const nodes = dfsNodes(range);
                highlight(nodes);
            });
        }
    });
}

function structureNode(range) {
    // extract data of start & end nodes
    const startNode = range.startContainer;
    const startOffset = range.startOffset;
    const endNode = range.endContainer;
    const endOffset = range.endOffset;

    // s_offset & e_offset are the overall offset of the selected text in parent node
    let startParent = parentNode(startNode);
    let s_offset = getBroadoffset(startParent["node"], startNode) + startOffset;

    let endParent = parentNode(endNode);
    let e_offset = getBroadoffset(endParent["node"], endNode) + endOffset;

    return {
        startContainer: {
            tagName: startParent["tagName"],
            index: startParent["index"],
            offset: s_offset,
        },
        endContainer: {
            tagName: endParent["tagName"],
            index: endParent["index"],
            offset: e_offset,
        },
    };
}

function antiNode({ tagName, index, offset }) {
    const root = window.document;
    const parent = root.getElementsByTagName(tagName)[index];
    const nodeStack = [parent];
    let curNode = null;
    let startOffset = 0;
    let curOffset = 0;

    while ((curNode = nodeStack.pop())) {
        const children = curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        if (curNode.nodeType === 3) {
            startOffset = offset - curOffset;
            curOffset += curNode.textContent.length;
            if (curOffset >= offset) {
                break;
            }
        }
    }
    if (!curNode) {
        curNode = parent;
    }
    return { node: curNode, offset: startOffset };
}

function saveSync(uri, data) {
    chrome.storage.sync.get(uri, (items) => {
        if (JSON.stringify(items) !== "{}") {
            items[uri].push(data);
            chrome.storage.sync.set(items, () => {
                chrome.storage.sync.get(null, (items) => {
                    console.log(items);
                });
            });
        } else {
            let iData = new Object();
            iData[uri] = new Array(data);
            chrome.storage.sync.set(iData, () => {
                chrome.storage.sync.get(null, (items) => {
                    console.log(items);
                });
            });
        }
    });
}

function parentNode(textNode) {
    const root = window.document;
    const node = textNode.parentElement;
    const tagName = node.tagName;
    const tagList = root.getElementsByTagName(tagName);

    // get index of parentNode in 'document'
    for (let index = 0; index < tagList.length; index++) {
        if (node === tagList[index]) {
            return { node, tagName, index };
        }
    }
    return { node, tagName, index: -1 };
}

function getBroadoffset(parentNode, textNode) {
    const nodeStack = [parentNode];
    let curNode = null;
    let offset = 0;

    while ((curNode = nodeStack.pop())) {
        const children = curNode.childNodes;
        // push childNodes into nodeStack for "stack"
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        // type of node is textnode and not the selected node
        if (curNode.nodeType === 3 && curNode != textNode) {
            offset += curNode.textContent.length;
        } else if (curNode.nodeType === 3) {
            // terminate when the selected node is reached
            break;
        }
    }
    return offset;
}

function dfsNodes(range) {
    // extract data of S & E
    const startNode = range.startContainer;
    const startOffset = range.startOffset;
    const endNode = range.endContainer;
    const endOffset = range.endOffset;

    // just one node
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
        // stack => push node into nodeList with reverse order
        // nodeList => use to temporarily save nodes
        // traverse through nodes begining with 'root'
        for (let i = children.length - 1; i >= 0; i--) {
            nodeList.push(children[i]);
        }

        // node.splitText => rawNode + newNode
        // (..rawNode..|..newNode..)
        // rawNode -> first part
        // newNode -> latter part
        if (curNode === startNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(startOffset);
                // get the part after offset
                resNodes.push(curNode.nextSibling);
            }
            // start record
            withS = true;
        } else if (curNode === endNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(endOffset);
                // get the part before offset
                resNodes.push(curNode);
            }
            // end record
            break;
        } else if (withS && curNode.nodeType === 3) {
            // start push node into resNodes
            resNodes.push(curNode);
        }
    }
    return resNodes; // return "Array"
}

function highlight(nodes) {
    nodes.forEach((node) => {
        if (!node) {
            return null;
        }
        const wrap = document.createElement("span");
        wrap.setAttribute("class", "test");
        wrap.appendChild(node.cloneNode(false));
        node.parentNode.replaceChild(wrap, node);
    });
}

document.onmouseup = () => {
    mouseCapture();
};

window.onload = () => {
    pageRender();
};

// chrome.storage.sync.clear();
