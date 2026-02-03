window.editor = {
    docEdit: {
        width: 256,
        height: 240
    },

    popup: document.getElementById("popupContent"),
    popupTitle: document.getElementById("popupTitle"),

    language: {},

    modal: class {
        constructor(name, contents, hasClose) {
            this.background = document.createElement("div");
            this.background.className = "modal-background";
            this.background.style.pointerEvents = "all";

            this.window = document.createElement("div");
            this.window.className = "popup";

            this.taskbar = document.createElement("div");
            this.taskbar.className = "popup-top";

            this.content = document.createElement("div");
            this.content.className = "popup-content";

            this.title = document.createElement("p");
            this.title.className = "popup-title";
            this.title.innerText = name;

            this.background.appendChild(this.window);
            this.window.appendChild(this.taskbar);
            this.taskbar.appendChild(this.title);
            this.window.appendChild(this.content);

            document.body.appendChild(this.background);
            
            this.background.style.setProperty("--modal-opacity", "100%");
            
            if (hasClose) {
                this.closeButton = document.createElement("button");
                this.closeButton.className = "popup-close";
                this.closeButton.onclick = () => {
                    this.close();
                }
                
                fetch("site/images/close.svg").then(res => res.text()).then(text => {
                    if (this.closeButton) {
                        this.closeButton.appendChild(artimus.elementFromString(text));
                        this.closeButton.children[0].style.width = "100%";
                        this.closeButton.children[0].style.height = "100%";
                    }
                })

                this.taskbar.appendChild(this.closeButton);
            }

            switch (typeof contents) {
                case "function": contents(this.content, this); break;
                case "string": this.content.innerHTML = contents; break;
                case "object": this.content.appendChild(contents); break;

                default:
                    break;
            }
        }
    }
};

fetch("lang/english.json").then(result => result.text()).then(text => {
    //Parse the language file.
    editor.language = JSON.parse(text);

    editor.workspace = artimus.inject(document.getElementById("workspace-area"));
    editor.workspace.resize(0, 0);
    artimus.globalRefreshTools();
})

editor.openModal = (name, contents, hasClose) => {
    hasClose = hasClose == true;

    editor.popup.innerHTML = "";
    switch (typeof contents) {
        case "function": contents(editor.popup); break;
        case "string": editor.popup.innerHTML = contents; break;
        case "object": editor.popup.appendChild(CUGI.createList(contents)); break;
    
        default:
            break;
    }

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");

    editor.popupTitle.innerText = name || "popup";
}

editor.closeModal = () => {
    document.body.style.setProperty("--modal-interaction", "none");
    document.body.style.setProperty("--modal-opacity", "0%");
}

editor.fileResize = (newFile) => {
    editor.docEdit = {
        width: 256,
        height: 240
    };

    editor.popup.innerHTML = "";
    editor.popup.appendChild(CUGI.createList([
        { type: "header", text: (newFile) ? "New File" : "Resize" },
        { type: "int", text: "width", key: "width", target: editor.docEdit},
        { type: "int", text: "height", key: "height", target: editor.docEdit},
        { type: "button", text: (newFile) ? "create" : "resize", onclick: () => {
            if (newFile) artimus.activeWorkspaces[0].new(editor.docEdit.width, editor.docEdit.height);
            else artimus.activeWorkspaces[0].resize(editor.docEdit.width, editor.docEdit.height);
            editor.closeModal();
        }}
    ]));

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");
}

artimus.layerPropertyMenu = (workspace, layer) => {
    editor.popup.innerHTML = "";
    editor.popup.appendChild(CUGI.createList([
        { type: "header", text: layer.name },
        { type: "dropdown", target: layer, key: "blendMode", items: [
            { text: "Default", value: "source-over"},
            { text: "additive", value: "lighter"},
            { text: "multiply", value: "multiply" },
            { text: "subtractive", value: "difference" },

            { text: "exclude", value: "exclusion" },

            { text: "screen", value: "screen" },
            { text: "overlay", value: "overlay" },

            { text: "lighten", value: "lighten" },
            { text: "darken", value: "darken" },

            { text: "burn", value: "color-burn" },
            { text: "dodge", value: "color-dodge" },

            { text: "soft-light", value: "soft-light"},
            { text: "hard-light", value: "hard-light"},
        ]},
        { type: "button", text: "ok", onclick: () => editor.closeModal() }
    ]));

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");
}

artimus.translate = (item, context) => (editor.language[`artimus.${context}.${item}`] || `artimus.${context}.${item}`);

artimus.fontPopup = (workspace) => {
    return new Promise((resolve) => {
        workspace.getFonts().then(fonts => {
            editor.openModal("Choose a font", (popup) => {
                const innerList = document.createElement("div");
                let fontSet = new Set();
                innerList.className = "artimus-font-list"

                for (let fontID in fonts) {
                    if (!fontSet.has(fonts[fontID].family)) {
                        fontSet.add(fonts[fontID].family);

                        const button = document.createElement("button");
                        
                        button.innerText = fonts[fontID].family;
                        button.className = "artimus-font-button";
                        button.style.fontFamily = fonts[fontID].family;

                        button.onclick = () => {
                            resolve(fonts[fontID].family);
                            editor.closeModal();
                        }

                        innerList.appendChild(button);
                    }
                }

                popup.appendChild(innerList);
            })
        })
    })
}