/* global variable */
const uri = window.location.href.replace(window.location.hash, "");
let mark = false;

/**
 * capture and response to mouseup
 * @param {object} event mouse-event
 * @returns directly return when don't need inject new bar
 */
function mouseCapture(event) {
    const sel = window.getSelection();
    if (!sel.toString().length) {
        erasebar();
        return;
    } else if (isOnItem(event, "note-bar")) {
        // click bar to note
        return;
    }
    const range = sel.getRangeAt(0);
    let state = stateJudge(range);
    erasebar();
    injectbar(range, state);
    window.postMessage({ task: "click listener" });
}

/**
 * response to notebar button click
 * @param {string} data.wn_msg describe button type
 * @param {string} data.switch the status of button
 */
function respButton(data) {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);

    if (data["switch"] === "false") {
        const id = uuid(data["wn_msg"][0].toUpperCase(), 10, 16);
        let structItem = structureNode(range);
        // temporary code to fine-tune storage structure
        if (data["wn_msg"] === "hl") {
            structItem["data"] = "rgb(251, 243, 219)";
        } else {
            structItem["data"] = null;
        }

        saveSync(structItem, id, "new");
        let nodes = dfsNodes(range);
        markRender(id, data["wn_msg"], nodes);
    } else {
        let id = null,
            id_list = range.startContainer.parentElement
                .getAttribute("wn_id")
                .split(" ");
        for (id of id_list) {
            if (id[0] === data["wn_msg"][0].toUpperCase()) {
                break;
            }
        }
        let structItem = structureNode(range);
        // temporary code to fine-tune storage structure
        if (data["wn_msg"] === "hl") {
            structItem["data"] = "rgb(251, 243, 219)";
        } else {
            structItem["data"] = null;
        }

        let tp_id = "{0}{1}".format(id[0], uuid("", 10, 16));
        saveSync(structItem, id, "change", tp_id);
        let nodes = dfsNodes(range);
        unmarkRender(id, data["wn_msg"], nodes);
    }
    erasebar();
}

/**
 * render page when reload
 */
function pageRender() {
    const pre_trans = {
        H: "hl",
        B: "bold",
        I: "italicize",
        U: "underline",
        S: "strike_through",
    };

    chrome.storage.sync.get(uri, (items) => {
        if (JSON.stringify(items) !== "{}" && items[uri]["mark"]) {
            mark = items[uri]["mark"];
            const data = items[uri]["notes"];
            for (let id in data) {
                const type = pre_trans[id[0]];
                const item = data[id];
                let start = antiNode(item["startContainer"]);
                let end = antiNode(item["endContainer"]);
                const range = {
                    startContainer: start["node"],
                    endContainer: end["node"],
                    startOffset: start["offset"],
                    endOffset: end["offset"],
                };
                const nodes = dfsNodes(range);
                markRender(id, type, nodes);
            }
        }
    });
}

/**
 * structure storage data with range
 * @param {object} range include container and offset
 * @returns {object} include startContainer and endContainer
 */
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

/**
 * deserialize nodes
 * @param {string} object.tagName tag name of node
 * @param {number} object.index index of node in "document"
 * @param {number} object.offset offset value of textnode
 * @returns {object} return "range" object
 */
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

/**
 * storage data to 'chrome.storage'
 * @param {object} data data that need to be storaged
 * @param {string} id unique identifier
 * @param {string} option different saving function
 * @param {string} tp_id partly used
 */
function saveSync(data, id, option, tp_id) {
    chrome.storage.sync.get(uri, (items) => {
        switch (option) {
            case "new":
                if (JSON.stringify(items) !== "{}") {
                    items[uri]["notes"][id] = data;
                    chrome.storage.sync.set(items, () => {
                        chrome.storage.sync.get(null, (items) => {
                            console.log("save note(new item): " + items);
                        });
                    });
                } else {
                    // no previous record
                    let iData = new Object(),
                        temp = new Object();
                    temp[id] = data;
                    iData[uri] = { mark: true, notes: temp };
                    chrome.storage.sync.set(iData, () => {
                        chrome.storage.sync.get(null, (items) => {
                            console.log("save note(new web): " + items);
                        });
                    });
                }
                break;
            case "change":
                const item = items[uri]["notes"][id];
                if (deepCompare(item, data)) {
                    delete items[uri]["notes"][id];
                } else if (
                    deepCompare(item["startContainer"], data["startContainer"])
                ) {
                    item["startContainer"] = data["endContainer"];
                } else if (
                    deepCompare(item["endContainer"], data["endContainer"])
                ) {
                    item["endContainer"] = data["startContainer"];
                } else {
                    let item_cp = JSON.parse(JSON.stringify(item));
                    item["endContainer"] = data["startContainer"];
                    item_cp["startContainer"] = data["endContainer"];
                    items[uri]["notes"][tp_id] = item_cp;
                }
                chrome.storage.sync.set(items, () => {
                    chrome.storage.sync.get(null, (items) => {
                        console.log("modify note: " + items);
                    });
                });
                break;
        }
    });
}

/**
 * structurally locate the "parent" element
 * @param {object} textNode TextNode object of DOM
 * @returns {object} include node, tagName and index
 */
function parentNode(textNode) {
    let node = textNode;
    while (
        node.parentElement.tagName === "SPAN" &&
        node.parentElement.getAttribute("wn_id")
    ) {
        node = node.parentElement;
    }
    node = node.parentElement;

    const root = window.document;
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

/**
 * transfer with "global" offset
 * @param {object} parentNode
 * @param {object} textNode
 * @returns {number} offset in parent
 */
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

/**
 * rational slicing of the nodes
 * @param {object} range
 * @returns {object[]} array of splited nodes
 */
function dfsNodes(range) {
    // extract data of S & E
    const startNode = range.startContainer;
    const startOffset = range.startOffset;
    const endNode = range.endContainer;
    const endOffset = range.endOffset;

    // just one node
    if (startNode === endNode && startNode.nodeType === 3) {
        if (startNode.length === endOffset - startOffset) {
            // complete overlap, no need to split
            return [startNode];
        } else if (!startOffset) {
            // cut the first part
            return [startNode.splitText(endOffset).previousSibling];
        } else if (startNode.length === endOffset) {
            // cut the next part
            return [startNode.splitText(startOffset)];
        }
        // cut the middle part
        startNode.splitText(startOffset);
        let nextNode = startNode.nextSibling;
        nextNode.splitText(endOffset - startOffset);
        return [nextNode];
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
        if (curNode === startNode && curNode.nodeType === 3) {
            if (!startOffset) {
                // no need to split
                resNodes.push(curNode);
            } else if (startOffset !== curNode.length) {
                curNode.splitText(startOffset);
                // get the part after offset
                resNodes.push(curNode.nextSibling);
            }
            // start record
            withS = true;
        } else if (curNode === endNode && curNode.nodeType === 3) {
            if (endNode.length !== endOffset) {
                curNode.splitText(endOffset);
            }
            // get the part before offset
            resNodes.push(curNode);
            // end record
            break;
        } else if (withS && curNode.nodeType === 3) {
            // start push node into resNodes
            resNodes.push(curNode);
        }
    }
    return resNodes;
}

/* just depth first traversal dom, find intermediate nodes */
function dfsWithoutSplit(range) {
    let nodeList = [];
    let resNodes = [];
    let curNode = null;
    let withS = false;
    let root = window.document;

    const startNode = range.startContainer;
    const endNode = range.endContainer;

    if (startNode === endNode) {
        if (startNode.nodeType === 3) {
            resNodes.push(startNode.parentNode);
        }
    } else {
        nodeList.push(root);
        while ((curNode = nodeList.pop())) {
            const children = curNode.childNodes;
            for (let i = children.length - 1; i >= 0; i--) {
                nodeList.push(children[i]);
            }
            if (curNode === startNode) {
                if (curNode.nodeType === 3) {
                    resNodes.push(curNode.parentNode);
                }
                withS = true;
            } else if (curNode === endNode) {
                if (curNode.nodeType === 3) {
                    resNodes.push(curNode.parentNode);
                }
                break;
            } else if (withS && curNode.nodeType === 3) {
                resNodes.push(curNode.parentNode);
            }
        }
    }
    return resNodes;
}

/**
 * determine what attributes the selected nodes have
 * @param {object} range
 * @returns {object} return 'property' which records the various attributes
 */
function stateJudge(range) {
    const resNodes = dfsWithoutSplit(range);
    const types = ["hl", "bold", "italicize", "underline", "strike_through"];
    let property = {
        hl: true,
        bold: true,
        italicize: true,
        underline: true,
        strike_through: true,
    };

    function isMatch(data) {
        return data.every((each) => {
            return types.includes(each);
        });
    }
    for (let node of resNodes) {
        const data = node.className.split(" ");
        if (node.tagName !== "SPAN" || !isMatch(data)) {
            return {
                hl: false,
                bold: false,
                italicize: false,
                underline: false,
                strike_through: false,
            };
        }
        types.map((each) => {
            if (!data.includes(each)) {
                property[each] = false;
            }
        });
    }
    return property;
}

/**
 * control running of plugin
 */
function changeMark() {
    chrome.storage.sync.get(uri, (items) => {
        if (JSON.stringify(items) !== "{}") {
            items[uri]["mark"] = mark;
            chrome.storage.sync.set(items, () => {
                location.reload();
                console.log("change mark: " + mark);
            });
        }
    });
}

/**
 * dom mark-renderer
 * @param {string} id item's unique tag
 * @param {string} type property of nodes
 * @param {object[]} nodes nodes need to deal with
 */
function markRender(id, type, nodes) {
    const pre_style = {
        hl: "background: rgb(251, 243, 219);",
        bold: "font-weight:600;",
        italicize: "font-style:italic;",
        underline:
            "color:inherit;border-bottom:0.05em solid;word-wrap:break-word;",
        strike_through: "text-decoration:line-through;",
    };

    nodes.forEach((node) => {
        let pe = node.parentElement;
        if (pe.tagName === "SPAN" && pe.getAttribute("wn_id")) {
            // wrapped node
            if (pe.childNodes.length === 1) {
                // full span node
                pe.className += " {0}".format(type);
                pe.setAttribute(
                    "wn_id",
                    pe.getAttribute("wn_id") + " {0}".format(id)
                );
                pe.setAttribute(
                    "style",
                    pe.getAttribute("style") + " {0}".format(pre_style[type])
                );
            } else {
                // split span nodes
                pe.childNodes.forEach((child) => {
                    const wrap = pe.cloneNode(false);
                    wrap.appendChild(child.cloneNode(false));
                    if (node === child) {
                        wrap.className += " {0}".format(type);
                        wrap.setAttribute(
                            "wn_id",
                            wrap.getAttribute("wn_id") + " {0}".format(id)
                        );
                        wrap.setAttribute(
                            "style",
                            wrap.getAttribute("style") +
                                " {0}".format(pre_style[type])
                        );
                    }
                    pe.parentElement.insertBefore(wrap, pe);
                });
                pe.parentElement.removeChild(pe);
            }
        } else {
            // new splited-node need to wrapper
            const wrap = document.createElement("span");
            wrap.setAttribute("wn_id", id);
            wrap.setAttribute("class", type);
            wrap.setAttribute("style", pre_style[type]);
            wrap.appendChild(node.cloneNode(false));
            pe.replaceChild(wrap, node);
        }
    });
}

/**
 * dom unmark-renderer
 * @param {string} id item's unique tag
 * @param {string} type property of nodes
 * @param {object[]} nodes nodes need to unmark
 */
function unmarkRender(id, type, nodes) {
    const pre_style = {
        hl: "background: rgb(251, 243, 219);",
        bold: "font-weight:600;",
        italicize: "font-style:italic;",
        underline:
            "color:inherit;border-bottom:0.05em solid;word-wrap:break-word;",
        strike_through: "text-decoration:line-through;",
    };

    /* check if there are other properties to decide dom-operation */
    function hasOtherProperty(node) {
        let id_list = node.getAttribute("wn_id").split(" ");
        return id_list.length !== 1;
    }

    /* modify properties of span element */
    function updateSpan(pe) {
        let ids = pe.getAttribute("wn_id").split(" ");
        let cl = pe.className.split(" ");
        let st = pe.getAttribute("style");

        let ids_new = ids.filter((x) => {
            return x !== id;
        });
        let cl_new = cl.filter((x) => {
            return x !== type;
        });
        pe.setAttribute("wn_id", ids_new.join(" "));
        pe.setAttribute("class", cl_new.join(" "));
        pe.setAttribute("style", st.replace(pre_style[type], ""));
    }

    nodes.forEach((node) => {
        let pe = node.parentElement;
        if (pe.childNodes.length === 1) {
            if (hasOtherProperty(pe)) {
                updateSpan(pe);
            } else {
                pe.parentElement.replaceChild(node, pe);
            }
        } else {
            pe.childNodes.forEach((child) => {
                let wrap = pe.cloneNode(false);
                wrap.appendChild(child.cloneNode(false));
                if (node === child) {
                    if (hasOtherProperty(wrap)) {
                        updateSpan(wrap);
                    } else {
                        wrap = node.cloneNode(false);
                    }
                }
                pe.parentElement.insertBefore(wrap, pe);
            });
            pe.parentElement.removeChild(pe);
        }
    });
}

/**
 * determine the range of mouse clicks
 * @param {object} event event object
 * @param {string} className className used to position element
 * @returns {boolean} is or not in range
 */
function isOnItem(event, className) {
    const items = document.getElementsByClassName(className);
    if (!items.length) return false;
    const mouse_x = event.clientX;
    const mouse_y = event.clientY;
    const scope_item = items[0].getBoundingClientRect();
    if (
        mouse_x >= scope_item.left &&
        mouse_x <= scope_item.right &&
        mouse_y >= scope_item.top &&
        mouse_y <= scope_item.bottom
    )
        return true;
    else return false;
}

/**
 * render and pop up note-bar
 * @param {object} ragne use to positioning note-bar
 * @param {object} state show attributes of selected text
 */
function injectbar(range, state) {
    let data = range.getBoundingClientRect();
    // outmost shell
    const container = document.createElement("div");
    container.setAttribute("class", "note-bar");
    container.setAttribute(
        "style",
        "position: absolute; left: {0}px; top: {1}px;".format(
            data.left + window.scrollX,
            data.top + window.scrollY - 32 - 8 < 0
                ? data.bottom + window.scrollY + 8
                : data.top + window.scrollY - 32 - 8
        )
    );
    const btn_list = [];
    const msg = ["hl", "bold", "italicize", "underline", "strike_through"];
    const svg_code = [
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-brightness-high-fill" fill="{0}" xmlns="http://www.w3.org/2000/svg"><path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><path fill-rule="evenodd" d="M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>'.format(
            state["hl"] ? "rgb(46 170 220)" : "currentColor"
        ),
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-type-bold" fill="{0}" xmlns="http://www.w3.org/2000/svg"><path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/></svg>'.format(
            state["bold"] ? "rgb(46 170 220)" : "currentColor"
        ),
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-type-italic" fill="{0}" xmlns="http://www.w3.org/2000/svg"><path d="M7.991 11.674L9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/></svg>'.format(
            state["italicize"] ? "rgb(46 170 220)" : "currentColor"
        ),
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-type-underline" fill="{0}" xmlns="http://www.w3.org/2000/svg"><path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136z"/><path fill-rule="evenodd" d="M12.5 15h-9v-1h9v1z"/></svg>'.format(
            state["underline"] ? "rgb(46 170 220)" : "currentColor"
        ),
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-type-strikethrough" fill="{0}" xmlns="http://www.w3.org/2000/svg"><path d="M8.527 13.164c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5h3.45c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967zM6.602 6.5H5.167a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607 0 .31.083.581.27.814z"/><path fill-rule="evenodd" d="M15 8.5H1v-1h14v1z"/></svg>'.format(
            state["strike_through"] ? "rgb(46 170 220)" : "currentColor"
        ),
    ];
    for (let i = 0; i < 5; i++) {
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.setAttribute("class", "wn-btn");
        btn.setAttribute("switch", state[msg[i]]);
        btn.setAttribute("value", msg[i]);
        btn.insertAdjacentHTML("beforeend", svg_code[i]);
        btn_list.push(btn);
        container.appendChild(btn);
    }
    document.getElementsByTagName("body")[0].appendChild(container);
}

/**
 * erase note-bar from page
 */
function erasebar() {
    const self = document.getElementsByClassName("note-bar")[0];
    if (self) {
        const parent = self.parentElement;
        parent.removeChild(self);
    }
}

/**
 * inject js file
 */
function injectjs(jsPath) {
    jsPath = jsPath || "js/inject.js";
    const temp = document.createElement("script");
    temp.setAttribute("type", "text/javascript");
    temp.src = chrome.extension.getURL(jsPath);
    document.head.appendChild(temp);
}

document.onmouseup = (event) => {
    if (mark) {
        mouseCapture(event);
    }
};

window.onload = () => {
    injectjs();
    pageRender();
};

// communication between content-script and popup-script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "change") {
        mark = request.mark;
        changeMark();
        sendResponse("success");
    } else if (request.type === "inquire") {
        sendResponse(mark);
    }
});

// communication between content-script and inject-script
window.addEventListener("message", (event) => {
    let data = event.data;
    if (data.hasOwnProperty("wn_msg")) {
        // Ex.data => {wn_msg: 'bold', switch: 'false'}
        respButton(data);
    }
});
