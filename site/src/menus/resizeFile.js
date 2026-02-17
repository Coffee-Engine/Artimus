editor.fileResize = () => {
    //Simple, easy.
    new editor.modal(artimus.translate("title", "modal.resizeFile"), (contents, modal) => {
        contents.className += " newFile-tuning popup-resizeFile";
        
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
            editor.workspace.resize(width, height, anchor);
            modal.close();
            document.removeEventListener("mousemove", anchorDrag);
            document.removeEventListener("mouseup", anchorStop);
        }
        
    }, { translationContext: "resizeFile", width: 22.5 });
}