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
        const loadButton = document.createElement("button");
        
        flipButton.className = "newFile-flip";
        sizingDiv.className = "newFile-sizingDiv";
        resolutionDiv.className = "newFile-resolutionHolder";
        finalDiv.className = "newFile-finalCreateButtonHolder";
        presets.className = "newFile-presets";
        tuning.className = "newFile-tuning";
        currentPreviewHolder.className = "newFile-tuning-previewHolder";
        currentPreview.className = "newFile-tuning-preview";
        createButton.className = "artimus-button";
        loadButton.className = "artimus-button";

        resolutionDiv.appendChild(widthInput);
        resolutionDiv.appendChild(heightInput);
        sizingDiv.appendChild(resolutionDiv);
        sizingDiv.appendChild(flipButton);
        currentPreviewHolder.appendChild(currentPreview);
        finalDiv.appendChild(createButton);
        finalDiv.appendChild(loadButton);
        tuning.appendChild(currentPreviewHolder);
        tuning.appendChild(sizingDiv);
        tuning.appendChild(finalDiv);
        contents.appendChild(presets);
        contents.appendChild(tuning);

        createButton.innerText = artimus.translate("create", "modal.newFile");
        loadButton.innerText = artimus.translate("loadInstead", "modal.newFile");

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

        loadButton.onclick = () => {
            modal.close();
            editor.loadFile(true);
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