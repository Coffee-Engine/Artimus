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
    }
};

editor.newFile = (forced) => {
    //Simple, easy.
    new editor.modal(artimus.translate("title", "modal.newFile"), (contents, modal) => {
        contents.className += " popup-newFile"
        
        const presets = document.createElement("div");
        const tuning = document.createElement("div");
        const currentPreviewHolder = document.createElement("div");
        const currentPreview = document.createElement("div");

        const sizingDiv = document.createElement("div");
        const resolutionDiv = document.createElement("div");
        const widthInput = document.createElement("input");
        const heightInput = document.createElement("input");
        const flipButton = document.createElement("button");

        const finalDiv = document.createElement("div");
        const createButton = document.createElement("button");
        
        flipButton.className = "newFile-flip";
        sizingDiv.className = "newFile-sizingDiv";
        resolutionDiv.className = "newFile-resolutionHolder";
        finalDiv.className = "newFile-finalCreateButtonHolder";
        presets.className = "newFile-presets";
        tuning.className = "newFile-tuning";
        currentPreviewHolder.className = "newFile-tuning-previewHolder";
        currentPreview.className = "newFile-tuning-preview";
        createButton.className = "artimus-button";

        resolutionDiv.appendChild(widthInput);
        resolutionDiv.appendChild(heightInput);
        sizingDiv.appendChild(resolutionDiv);
        sizingDiv.appendChild(flipButton);
        currentPreviewHolder.appendChild(currentPreview);
        finalDiv.appendChild(createButton);
        tuning.appendChild(currentPreviewHolder);
        tuning.appendChild(sizingDiv);
        tuning.appendChild(finalDiv);
        contents.appendChild(presets);
        contents.appendChild(tuning);

        createButton.innerText = artimus.translate("create", "modal.newFile");

        fetch("site/images/flipAspect.svg").then(res => res.text()).then(text => {
            if (flipButton) {
                flipButton.appendChild(artimus.elementFromString(text));
                flipButton.children[0].style.width = "100%";
                flipButton.children[0].style.height = "100%";
            }
        });

        //Get ready
        let width, height;

        //Add a simple way to update the resolution.
        const updateResolution = (w, h) => {
            width = Number(w || width);
            height = Number(h || height);

            if (width > height) {
                currentPreview.style.width = "100%";
                currentPreview.style.height = `${(height/width) * 100}%`;
            }
            else {
                currentPreview.style.width = `${(width/height) * 100}%`;
                currentPreview.style.height = "100%";
            }

            widthInput.value = Math.max(widthInput.min, Math.min(widthInput.max, width));
            heightInput.value = Math.max(heightInput.min, Math.min(heightInput.max, height));
        }

        //Get set
        widthInput.type = "number";
        widthInput.min = 1;
        widthInput.max = 8192;

        heightInput.type = "number";
        heightInput.min = 1;
        heightInput.max = 8192;

        //GOOOOO
        updateResolution(256, 240);

        widthInput.oninput = () => updateResolution(widthInput.value, heightInput.value);
        heightInput.oninput = () => updateResolution(widthInput.value, heightInput.value);
        flipButton.onclick = () => updateResolution(heightInput.value, widthInput.value);

        createButton.onclick = () => {
            artimus.activeWorkspaces[0].new(width, height);
            modal.close();
        }

        //Append resolution presets
        for (let presetID in editor.resolutionPresets) {
            const preset = editor.resolutionPresets[presetID];
            preset.width = preset.width || 1;
            preset.height = preset.height || 1;

            //Create elements
            const container = document.createElement("div");
            const previewContainer = document.createElement("div");
            const preview = document.createElement("div");
            const name = document.createElement("div");
            const resolution = document.createElement("div");

            //Set needed classes
            container.className = "newFile-preset";
            previewContainer.className = "newFile-presetPreviewContainer";            
            preview.className = "newFile-presetPreview";            
            name.className = "newFile-presetName";
            resolution.className = "newFile-presetResolution";

            //Text stuff
            name.innerText = preset.name || "preset";
            name.title = name.innerText;
            
            resolution.innerText = `${preset.width}x${preset.height}`;
            resolution.title = name.innerText;            

            if (preset.width > preset.height) {
                preview.style.width = "100%";
                preview.style.height = `${(preset.height/preset.width) * 100}%`;
            }
            else {
                preview.style.width = `${(preset.width/preset.height) * 100}%`;
                preview.style.height = "100%";
            }

            //preview.style.aspectRatio = `${preset.width}/${preset.height}`;
            
            //Finally add all the elements
            previewContainer.appendChild(preview);
            container.appendChild(previewContainer);
            container.appendChild(name);
            container.appendChild(resolution);

            presets.appendChild(container);

            container.onclick = () => updateResolution(preset.width, preset.height);
        }
        
    }, { hasClose: !forced, translationContext: "newFile", width: 60 });
}

editor.fileResize = () => {
    //Simple, easy.
    new editor.modal(artimus.translate("title", "modal.resizeFile"), (contents, modal) => {
        contents.className += " newFile-tuning resizeFile-main";
        
        const currentPreviewHolder = document.createElement("div");
        const currentPreview = document.createElement("div");
        const currentPreviewAnchor = document.createElement("div");

        const sizingDiv = document.createElement("div");
        const resolutionDiv = document.createElement("div");
        const widthInput = document.createElement("input");
        const heightInput = document.createElement("input");
        const flipButton = document.createElement("button");

        const finalDiv = document.createElement("div");
        const createButton = document.createElement("button");
        
        flipButton.className = "newFile-flip resizeFile-flip";
        sizingDiv.className = "newFile-sizingDiv resizeFile-sizingDiv";
        resolutionDiv.className = "newFile-resolutionHolder resizeFile-resolutionHolder";
        finalDiv.className = "newFile-finalCreateButtonHolder resizeFile-finalCreateButtonHolder";
        
        currentPreviewHolder.className = "newFile-tuning-previewHolder resizeFile-previewHolder";
        currentPreview.className = "newFile-tuning-preview resizeFile-preview";
        currentPreviewAnchor.className = "resizeFile-previewAnchor";

        createButton.className = "artimus-button";

        resolutionDiv.appendChild(widthInput);
        resolutionDiv.appendChild(heightInput);
        sizingDiv.appendChild(resolutionDiv);
        sizingDiv.appendChild(flipButton);

        currentPreviewHolder.appendChild(currentPreview);
        currentPreview.appendChild(currentPreviewAnchor);

        finalDiv.appendChild(createButton);

        contents.appendChild(currentPreviewHolder);
        contents.appendChild(sizingDiv);
        contents.appendChild(finalDiv);

        createButton.innerText = artimus.translate("resize", "modal.resizeFile");

        fetch("site/images/flipAspect.svg").then(res => res.text()).then(text => {
            if (flipButton) {
                flipButton.appendChild(artimus.elementFromString(text));
                flipButton.children[0].style.width = "100%";
                flipButton.children[0].style.height = "100%";
            }
        });

        //Get ready
        let width, height;
        let anchor = [...artimus.resizeAnchors.MIDDLE];
        let draggingAnchor = false;

        //Add a simple way to update the resolution.
        const updateResolution = (w, h) => {
            width = Number(w || width);
            height = Number(h || height);

            if (width > height) {
                currentPreview.style.width = "100%";
                currentPreview.style.height = `${(height/width) * 100}%`;
            }
            else {
                currentPreview.style.width = `${(width/height) * 100}%`;
                currentPreview.style.height = "100%";
            }

            widthInput.value = Math.max(widthInput.min, Math.min(widthInput.max, width));
            heightInput.value = Math.max(heightInput.min, Math.min(heightInput.max, height));
        }

        const updateAnchor = (x, y) => {
            x = (x === undefined) ? anchor[0] : x;
            y = (y === undefined) ? anchor[1] : y;

            anchor[0] = Math.max(Math.min(x, 1), 0);
            anchor[1] = Math.max(Math.min(y, 1), 0);

            currentPreviewAnchor.style.setProperty("--anchor-x", `${anchor[0] * 100}%`);
            currentPreviewAnchor.style.setProperty("--anchor-y", `${anchor[1] * 100}%`);
        }

        //Get set
        widthInput.type = "number";
        widthInput.min = 1;
        widthInput.max = 8192;

        heightInput.type = "number";
        heightInput.min = 1;
        heightInput.max = 8192;

        //GOOOOO
        updateResolution(256, 240);
        updateAnchor()

        widthInput.oninput = () => updateResolution(widthInput.value, heightInput.value);
        heightInput.oninput = () => updateResolution(widthInput.value, heightInput.value);
        flipButton.onclick = () => updateResolution(heightInput.value, widthInput.value);

        const anchorDrag = (event) => {
            if (draggingAnchor) {
                const { left, top, width, height } = currentPreview.getBoundingClientRect();
                updateAnchor(
                    (event.clientX - left) / width, 
                    (event.clientY - top) / height
                );
            }
        }

        const anchorStop = () => {
            draggingAnchor = false; 
            currentPreviewAnchor.style.removeProperty("--speed");

            updateAnchor(
                Math.round(anchor[0] * 2) / 2, 
                Math.round(anchor[1] * 2) / 2
            );
        }

        currentPreviewAnchor.onmousedown = () => { 
            draggingAnchor = true; 
            currentPreviewAnchor.style.setProperty("--speed", "0ms");
        
        }
        document.addEventListener("mousemove", anchorDrag);
        document.addEventListener("mouseup", anchorStop);

        createButton.onclick = () => {
            artimus.activeWorkspaces[0].resize(width, height, anchor);
            modal.close();
            document.removeEventListener("mousemove", anchorDrag);
            document.removeEventListener("mouseup", anchorStop);
        }
        
    }, { translationContext: "resizeFile", width: 22.5 });
}

artimus.layerPropertyMenu = (workspace, layer) => {
    new editor.modal(artimus.translate("title", "modal.layerProperty").replace("[LAYER]", layer.name), [
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
    ], { height: 30, translationContext: "layerProperty" });
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