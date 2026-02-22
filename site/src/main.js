window.editor = {
    dbName: "artimusDB",
    dbVersion: 1,

    docEdit: {
        width: 256,
        height: 240
    },

    popup: document.getElementById("popupContent"),
    popupTitle: document.getElementById("popupTitle"),

    language: {},
    resolutionPresets: {},

    modals: [],
    modal: class {
        constructor(name, contents, options) {
            options = Object.assign({
                hasClose: true,
                width: 40,
                height: 40,
                translationContext: "CUGI"
            }, options);

            options.translationContext = `modal.${options.translationContext}`;

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
                });

                this.taskbar.appendChild(this.closeButton);
            }

            switch (typeof contents) {
                case "function": contents(this.content, this); break;
                case "string": this.content.innerHTML = contents; break;
                case "object": this.content.appendChild(CUGI.createList(contents, {
                    preprocess: (item) => this.CUGIPreprocess(options.translationContext, item)
                }));
                break;

                default:
                    break;
            }

            editor.modals.push(this);

            this.init(name, contents, options);
        }

        CUGIPreprocess(context, item) {
            item.text = artimus.translate(item.translationKey || item.key || item.text, context) || item.text || item.key;
            return item;
        }

        init() {}
        
        close() {
            this.background.parentElement.removeChild(this.background);

            //Remove from global modals list.
            const index = editor.modals.indexOf(this);
            if (index > -1) editor.modals.splice(index, 1);

            delete this;
        }
    },

    quickP: (text, cls) => {
        const p = document.createElement("p");
        p.innerText = text;
        p.className = cls || "";
        return p;
    },

    hotkeyFunctions: [
        "undo",
        "redo",
        "importFromPC",
        "exportToPC",
        "createLayer",
        "cropToSelection"
    ]
};

//Artimus configuration
artimus.translate = (item, context, noComplaints) => {
    if ((!noComplaints) && !editor.language[`artimus.${context}.${item}`]) console.warn(`Translation key "${`artimus.${context}.${item}`}" is missing!`);

    const translated = editor.language[`artimus.${context}.${item}`] || ((noComplaints) ? item : `artimus.${context}.${item}`);
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

//Setup hotkeys
artimus.unfocusedHotkeys = true;
artimus.hotkeys["ctrl+s"] = "exportToPC";
artimus.hotkeys["ctrl+l"] = "importFromPC";

//Finally initialize the editor by fetching needed json data
fetch("site/resolutionPresets.json").then(result => result.text()).then(text => {
    try {
        const parsed = JSON.parse(text);
        if (parsed) editor.resolutionPresets = parsed;
    } catch (error) {}
})

fetch("lang/english.json").then(result => result.text()).then(text => {
    //Parse the language file.
    editor.language = JSON.parse(text);

    editor.workspace = artimus.inject(document.getElementById("workspace-area"));
    editor.workspace.resize(0, 0);
    artimus.globalRefreshTools();

    //Add extensions
    for (let idx in editor.settings.extensions) {
        editor.startExtension(editor.settings.extensions[idx]);
    }

    new editor.modal(artimus.translate("welcome.title", "modal"), artimus.translate("welcome.info", "modal"), { height: 45, hasClose: false });

    const element = document.getElementById("versionIdentifier");
    const loop = () => {
        if (editor.settings.debug) {
            //Timing
            element.innerText = `dt:${Math.floor(editor.workspace.performance.delta * 1000) / 1000} fps:${Math.floor(editor.workspace.performance.fps)}`;
            //Canvas
            element.innerText += ` ud: ${editor.workspace.layerHistory.length} hs: ${editor.workspace.historyIndex} d:${editor.workspace.dirty} l:${editor.workspace.layers.length} || cw: ${editor.workspace.width} ch: ${editor.workspace.height}`;

            if (editor.workspace.tool) element.innerText = element.innerText += ` || t: ${editor.workspace.tool} tc: ${editor.workspace.toolFunction.constructive} pc: ${JSON.stringify(editor.workspace.toolFunction.colorProperties)}`
            else element.innerText += ` || t: none`;
            element.innerText += `|| x: ${editor.workspace.scrollX} y: ${editor.workspace.scrollY} z: ${editor.workspace.zoom} vb: ${editor.workspace.viewBounds}`
        }
        requestAnimationFrame(loop);
    }

    loop();
});