window.editor = {
    version: "Γ 1.5.3",
    bannerTitle: "Welcome Artimus!",
    bannerAuthor: "BitDisco",
    bannerAuthorURL: "https://bitdisco.itch.io/",

    dbName: "artimusDB",
    dbVersion: 3,

    docEdit: {
        width: 256,
        height: 240
    },

    language: { "artimus.layer.layer#": "Layer #" },
    englishFallback: {},

    resolutionPresets: {},

    //Events
    events: [
        "paletteAdded",
        "paletteRemoved"
    ],

    listeners: {},
    addEventListener: (event, callback) => {
        if (editor.events.includes(event)) {
            if (!editor.listeners[event]) editor.listeners[event] = [];
            editor.listeners[event].push(callback);
        }
    },
    sendEvent: (event, data) => {
        //Make sure the event list exists
        if (Array.isArray(editor.listeners[event])) {
            //Run the callbacks
            const callbacks = editor.listeners[event];
            for (let i = 0; i<callbacks.length; i++) {
                callbacks[i](data);
            }
        }
    },
    removeEventListener: (event, callback) => {
        if (editor.events.includes(event)) {
            if (!editor.listeners[event]) return;
            const index = editor.listeners[event].indexOf(callback);
            if (index < 0) return;
            editor.listeners[event].splice(index, 1);
        }
    },

    //Modal registery
    modals: {},
    registerModal: (id, modalClass) => {
        if (modalClass.prototype instanceof editor.modal) {
            editor.modals[id] = modalClass;
        }
    },

    spawnModal: (id, extraData) => {
        if (editor.modals[id] && editor.modals[id].prototype instanceof editor.modal) new editor.modals[id](extraData);
    },

    closeAllModals: () => {
        //Close all modals
        for (let modal = 0; modal < editor.spawnedModals.length; modal++) {
            if (editor.spawnedModals[modal] instanceof editor.modal) {
                editor.spawnedModals[modal]._close();
                modal--;
            }
        }
    },

    //Modals
    spawnedModals: [],
    modal: class {
        //Title stuff
        set title(value) { this.titleElement.innerText = value; }
        get title() { return this.titleElement.innerText; }

        //Modal sizing
        #width = 0;
        #height = 0;

        set width(value) {
            this.#width = value;
            this.windowElement.style.setProperty("--window-width", this.#width);
        }
        get width() { return this.#height; }

        set height(value) {
            this.#height = value;
            this.windowElement.style.setProperty("--window-height", this.#height);
        }
        get height() { return this.#height; }

        //Closability
        #canClose = false;
        set canClose(value) {
            this.#canClose = value != false;

            //Add or remove close button
            if (this.#canClose && !this.closeButton.parentElement) this.taskbarElement.appendChild(this.closeButton);
            else if (this.closeButton.parentElement) this.closeButton.parentElement.removeChild(this.closeButton);
        }
        get canClose() { return this.#canClose; }

        constructor(extraData) {
            //Make sure we are using an object
            if (typeof extraData != "object") extraData = {};

            //Create initial state
            artimus.unfocusedHotkeys = false;

            //Create needed elements for a modal
            this.backgroundElement = document.createElement("div");
            this.backgroundElement.className = "modal-background";
            this.backgroundElement.style.pointerEvents = "all";

            this.windowElement = document.createElement("div");
            this.windowElement.className = "popup";

            this.taskbarElement = document.createElement("div");
            this.taskbarElement.className = "popup-top";

            this.content = document.createElement("div");
            this.content.className = "popup-content";

            this.titleElement = document.createElement("p");
            this.titleElement.className = "popup-title";
            this.titleElement.innerText = name;

            this.backgroundElement.appendChild(this.windowElement);
            this.windowElement.appendChild(this.taskbarElement);
            this.taskbarElement.appendChild(this.titleElement);
            this.windowElement.appendChild(this.content);

            document.body.appendChild(this.backgroundElement);
            this.backgroundElement.style.setProperty("--modal-opacity", "100%");

            //Now create togglable ones, (for now only the close button)
            this.closeButton = document.createElement("button");
            this.closeButton.className = "popup-close";
            this.closeButton.onclick = () => {
                this._close();
            }
            
            this.closeButton.appendChild(artimus.elementFromString(editor.modalCloseButton));
            this.closeButton.children[0].style.width = "100%";
            this.closeButton.children[0].style.height = "100%";

            //Set initial config
            this.width = 40;
            this.height = 40;
            this.title = "Modal";
            this.canClose = true;

            editor.spawnedModals.push(this);
            this.init(this.content, this, extraData);
        }

        init(content, self) {}
        close(content, self) {}

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
        
        _close() {
            this.backgroundElement.parentElement.removeChild(this.backgroundElement);

            //Remove from global modals list.
            const index = editor.spawnedModals.indexOf(this);
            if (index > -1) editor.spawnedModals.splice(index, 1);

            if (editor.spawnedModals.length == 0) artimus.unfocusedHotkeys = true;

            this.close(this.content, this);
            delete this;
        }
    },

    settingsPage: class {
        constructor(container, translationKey, onchange) {
            //Just so we can call from both functions
            this.container = container;
            this.translationKey = translationKey;
            this.onchange = onchange;

            this.init(container, translationKey, onchange);
        }
        
        editorReady() {}
        init(container, translationKey, onchange) {}
        destroy() {}
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
        "zoomIn",
        "zoomOut"
    ],

    refreshLanguage: () => {
        editor.workspace.refreshTranslation();
        editor.toolbar.refresh();
    },

    initialize: (noStartMenu) => {
        if (!noStartMenu) editor.spawnModal("startMenu");
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

        editor.workspace.addEventListener("tick", () => {
            if (editor.settings.debug && editor.versionIdentifier) {
                //Timing
                editor.versionIdentifier.innerText = `dt:${Math.floor(editor.workspace.performance.delta * 1000) / 1000} fps:${Math.floor(editor.workspace.performance.fps)}`;
                //Canvas
                editor.versionIdentifier.innerText += ` ud: ${editor.workspace.historyLength} hs: ${editor.workspace.historyIndex} d:${editor.workspace.dirty} l:${editor.workspace.layers.length} || cw: ${editor.workspace.width} ch: ${editor.workspace.height}`;

                if (editor.workspace.tool) editor.versionIdentifier.innerText = editor.versionIdentifier.innerText += ` || t: ${editor.workspace.tool} tc: ${editor.workspace.toolFunction.constructive} pc: ${JSON.stringify(editor.workspace.toolFunction.colorProperties)}`
                else editor.versionIdentifier.innerText += ` || t: none`;
                editor.versionIdentifier.innerText += `|| x: ${editor.workspace.scrollX} y: ${editor.workspace.scrollY} z: ${editor.workspace.zoom} vb: ${editor.workspace.viewBounds}`
            }
        })
    },

    downloader: document.createElement("a"),
    downloadText: (name, content) => {
        editor.downloader.download = name;
        editor.downloader.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
        
        //Download
        document.body.appendChild(editor.downloader);
        editor.downloader.click();
        editor.downloader.parentElement.removeChild(editor.downloader);
    },

    currentPalette: null,
};

//Artimus configuration
artimus.translate = (item, context, noComplaints) => {
    const key = `artimus.${context}.${item}`;
    if ((!noComplaints) && !editor.language[key]) console.warn(`Translation key "${key}" is missing!`);

    let translated = (noComplaints) ? item : key;
    if (editor.language[key]) translated = editor.language[key] || translated;
    else translated = editor.englishFallback[key] || translated;

    if (Array.isArray(translated)) return translated.join("\n");
    return translated;
}

//Replace artimus calls so they will show the appropriate menus
artimus.fontPopup = (workspace) => {
    return new Promise((resolve) => {
        workspace.getFonts().then(fonts => {
            editor.spawnModal("fontMenu", { fonts: fonts, resolve: resolve });
        })
    })
}

artimus.layerPropertyMenu = (workspace, layer) => editor.spawnModal("layerProperty", 
    {
        workspace: workspace,
        layer: layer
    }
);

//Setup hotkeys
artimus.unfocusedHotkeys = true;
artimus.hotkeys["ctrl+s"] = "exportToPC";
artimus.hotkeys["ctrl+l"] = "importFromPC";

//Prepare storage ready function
editor.storageReady = async () => {
    //Get modal close button data
    editor.modalCloseButton = await fetch("site/images/close.svg").then(res => res.text());

    //Get fallback data
    editor.englishFallback = await fetch("lang/english.json").then(result => result.text());
    try {
        const parsed = JSON.parse(editor.englishFallback);
        editor.englishFallback = parsed;
    } catch (error) { console.error(`Fallback english error!\n===---===\n${error}\n===---===`)}

    //Finally initialize the editor by fetching needed json data
    const unparsedResolutions = await fetch("site/resolutionPresets.json").then(result => result.text())
    try {
        const parsed = JSON.parse(unparsedResolutions);
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
            editor.spawnModal("languageMenu", { forced: true });
        })
    }

    //Get the default palettes.
    editor.palettes.getDefaultPalettes();

    //Define new swatch getter
    Object.defineProperty(elemental.colorPickerConfig, "globalSwatch", {
        get() {
            if (editor.currentPalette && editor.currentPalette instanceof editor.palettes.palette) {
                return editor.currentPalette.colors;
            }
            return [];
        }
    });

    //Global preprocessor for modifying to CUGI to add elemental swatches
    artimus.toolCUGIPreprocess = (item) => {
        item.swatch = true;
        return item;
    }
}
