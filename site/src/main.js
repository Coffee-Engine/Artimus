window.editor = {
    docEdit: {
        width: 256,
        height: 240
    },

    popup: document.getElementById("popupContent"),
    popupTitle: document.getElementById("popupTitle"),

    language: {},

    modals: [],
    modal: class {
        constructor(name, contents, options) {
            options = Object.assign({
                hasClose: true,
                width: 40,
                height: 40
            }, options);

            this.background = document.createElement("div");
            this.background.className = "modal-background";
            this.background.style.pointerEvents = "all";

            this.window = document.createElement("div");
            this.window.style.setProperty("--window-width", options.width);
            this.window.style.setProperty("--window-height", options.height);
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
            
            if (options.hasClose) {
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
                case "object": this.content.appendChild(CUGI.createList(contents)); break;

                default:
                    break;
            }

            editor.modals.push(this);

            this.init(name, contents, options);
        }

        init() {}
        
        close() {
            this.background.parentElement.removeChild(this.background);

            //Remove from global modals list.
            const index = editor.modals.indexOf(this);
            if (index > -1) editor.modals.splice(index, 1);

            delete this;
        }
    }
};

editor.fileResize = (newFile) => {
    //Simple, easy.
    const modal = new editor.modal((newFile) ? "New File" : "Resize", [
        { type: "int", text: "width", key: "width", target: editor.docEdit},
        { type: "int", text: "height", key: "height", target: editor.docEdit},
        { type: "button", text: (newFile) ? "create" : "resize", onclick: () => {
            if (newFile) artimus.activeWorkspaces[0].new(editor.docEdit.width, editor.docEdit.height);
            else artimus.activeWorkspaces[0].resize(editor.docEdit.width, editor.docEdit.height);
            modal.close();
        }}
    ]);
}

artimus.layerPropertyMenu = (workspace, layer) => {
    new editor.modal(`Editing "${layer.name}"`, [
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
        ]}
    ], { height: 30 });
}

artimus.translate = (item, context) => {
    const translated = (editor.language[`artimus.${context}.${item}`] || `artimus.${context}.${item}`);
    if (Array.isArray(translated)) return translated.join("\n");
    return translated;
}

artimus.fontPopup = (workspace) => {
    return new Promise((resolve) => {
        workspace.getFonts().then(fonts => {
            new editor.modal("Choose a font", (popup, modal) => {
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
                            modal.close();
                        }

                        innerList.appendChild(button);
                    }
                }

                popup.appendChild(innerList);
            }, { height: 25.5 })
        })
    })
}

fetch("lang/english.json").then(result => result.text()).then(text => {
    //Parse the language file.
    editor.language = JSON.parse(text);

    editor.workspace = artimus.inject(document.getElementById("workspace-area"));
    editor.workspace.resize(0, 0);
    artimus.globalRefreshTools();


    new editor.modal(artimus.translate("welcome.title", "modal"), artimus.translate("welcome.info", "modal"), { height: 45, hasClose: false });
});