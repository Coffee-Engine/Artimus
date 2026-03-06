window.editor = {
    version: "Γ 1.4.1",
    bannerTitle: "Help Wanted",
    bannerAuthor: "ObviousAlexC",
    bannerAuthorURL: "https://ObviousStudios.dev",

    dbName: "artimusDB",
    dbVersion: 2,

    docEdit: {
        width: 256,
        height: 240
    },

    popup: document.getElementById("popupContent"),
    popupTitle: document.getElementById("popupTitle"),

    language: { "artimus.layer.layer#": "Layer #" },
    resolutionPresets: {},

    modals: [],
    modal: class {
        constructor(name, contents, options) {
            artimus.unfocusedHotkeys = false;

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
                case "object": this.content.appendChild(CUGI.createList({...contents}, {
                    preprocess: (item) => this.CUGIPreprocess(options.translationContext, {...item})
                }));
                break;

                default:
                    break;
            }

            editor.modals.push(this);

            this.init(name, contents, options);
        }

        CUGIPreprocess(context, inItem) {
            const item = {...inItem, modal: this};
            const translationKey = item.translationKey || item.key || item.text;
            item.text = artimus.translate(translationKey, context) || item.text || item.key;
            if (item.items) {
                //Make it original
                item.items = [...item.items];
                for (let optionID in item.items) {
                    const option = item.items[optionID];
                    if (typeof option != "string") continue;

                    item.items[optionID] = { text: artimus.translate(option, `${context}.${translationKey}`), value: option} 
                }
            }
            return item;
        }

        init() {}
        
        close() {
            this.background.parentElement.removeChild(this.background);

            //Remove from global modals list.
            const index = editor.modals.indexOf(this);
            if (index > -1) editor.modals.splice(index, 1);

            if (editor.modals.length == 0) artimus.unfocusedHotkeys = true;

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
        "copy",
        "paste",
        "importFromPC",
        "exportToPC",
        "createLayer",
        "clearSelection",
        "cropToSelection",
    ],

    refreshLanguage: () => {
        editor.workspace.refreshTranslation();
        editor.toolbar.refresh();
    },

    initialize: (noStartMenu) => {
        if (!noStartMenu) editor.startMenu.open();
        editor.toolbar.refresh();

        //Inject our workspace.
        editor.workspace = artimus.inject(document.getElementById("workspace-area"));
        editor.workspace.resize(0, 0);

        //Then add our event listeners for file I/O
        editor.workspace.addEventListener("importLocal", (event) => {
            if (event.file instanceof window.FileSystemHandle) {
                editor.recentStorage.getKey("recentProjects").then((arr) => {
                    //Get array and append current file to top
                    arr = arr || [];
                    
                    const index = arr.findIndex((value) => value.name == event.file.name);
                    if (index >= 0) arr.splice(index, 1);
                    arr.push(event.file);

                    //If there are more than 10, remove the 11th or 12th
                    if (arr.length > 10) arr.splice(0, arr.length - 10);

                    //Array
                    editor.recentStorage.setKey("recentProjects", arr);
                });
            }
        });

        editor.workspace.addEventListener("exportLocal", (event) => {
            if (event.file instanceof window.FileSystemHandle) {
                editor.recentStorage.getKey("recentProjects").then((arr) => {
                    //Get array and append current file to top
                    arr = arr || [];

                    const index = arr.findIndex((value) => value.name == event.file.name);
                    if (index >= 0) arr.splice(index, 1);
                    arr.push(event.file);

                    //If there are more than 10, remove the 11th or 12th
                    if (arr.length > 10) arr.splice(0, arr.length - 10);

                    //Array
                    editor.recentStorage.setKey("recentProjects", arr);
                });
            }
        });
        artimus.globalRefreshTools();

        //Add extensions
        for (let idx in editor.settings.extensions) {
            editor.startExtension(editor.settings.extensions[idx]);
        }

        //Debugger loop
        const loop = () => {
            if (editor.settings.debug && editor.versionIdentifier) {
                //Timing
                editor.versionIdentifier.innerText = `dt:${Math.floor(editor.workspace.performance.delta * 1000) / 1000} fps:${Math.floor(editor.workspace.performance.fps)}`;
                //Canvas
                editor.versionIdentifier.innerText += ` ud: ${editor.workspace.layerHistory.length} hs: ${editor.workspace.historyIndex} d:${editor.workspace.dirty} l:${editor.workspace.layers.length} || cw: ${editor.workspace.width} ch: ${editor.workspace.height}`;

                if (editor.workspace.tool) editor.versionIdentifier.innerText = editor.versionIdentifier.innerText += ` || t: ${editor.workspace.tool} tc: ${editor.workspace.toolFunction.constructive} pc: ${JSON.stringify(editor.workspace.toolFunction.colorProperties)}`
                else editor.versionIdentifier.innerText += ` || t: none`;
                editor.versionIdentifier.innerText += `|| x: ${editor.workspace.scrollX} y: ${editor.workspace.scrollY} z: ${editor.workspace.zoom} vb: ${editor.workspace.viewBounds}`
            }
            requestAnimationFrame(loop);
        }

        loop();
    }
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

editor.storageReady = () => {
    //Finally initialize the editor by fetching needed json data
    fetch("site/resolutionPresets.json").then(result => result.text()).then(text => {
        try {
            const parsed = JSON.parse(text);
            if (parsed) editor.resolutionPresets = parsed;
        } catch (error) {}

        //Load the language file
        if (localStorage.getItem("language")) {
            editor.language = JSON.parse(localStorage.getItem("language"));
            if (navigator.onLine && editor.language.src) {
                fetch(editor.language.src).then(res => res.text()).then(text => {
                    try {
                        //Parse new file and save
                        const parsed = JSON.parse(text);
                        editor.language = parsed;

                        //In all outcomes we will load the new data
                        console.log("Sucessfully updated language file!")
                        editor.initialize();
                    } catch (error) {
                        console.error(`Parsing of updated language file failed. Loading old one.\n===---===\n${error}\n===---===`);
                        editor.initialize(); 
                    }
                }).catch(() => {
                    editor.initialize();
                })
            }
            else {
                editor.initialize();
            }
        }
        else {
            fetch("lang/english.json").then(res => res.text()).then(text => {
                try { editor.language = JSON.parse(text); }
                catch (error) { console.error(`English fallback error!\n===---===\n${error}\n===---===`); }
                
                editor.initialize(true);
                editor.languageMenu(true);
            })
        }
    });
}
