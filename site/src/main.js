window.editor = {
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
                preprocess: (item) => {
                        item.text = artimus.translate(item.translationKey || item.key || item.text, options.translationContext) || item.text || item.key;
                        return item;
                    }
                }));
                break;

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
    },

    quickP: (text, cls) => {
        const p = document.createElement("p");
        p.innerText = text;
        p.className = cls || "";
        return p;
    }
};

artimus.translate = (item, context) => {
    if (!editor.language[`artimus.${context}.${item}`]) console.warn(`Translation key "${`artimus.${context}.${item}`}" is missing!`);

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

    new editor.modal(artimus.translate("welcome.title", "modal"), artimus.translate("welcome.info", "modal"), { height: 45, hasClose: false });
});