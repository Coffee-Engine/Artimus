artimus.layerPropertyMenu = (workspace, layer) => {
    new editor.modal(artimus.translate("title", "modal.layerProperty").replace("[LAYER]", layer.name), 
    (contents, modal) => {
        contents.className += " popup-layerProperties";
        
        const nameHolder = document.createElement("div");
        nameHolder.className = "layerProperties-CenterHolder layerProperties-NameHolder";

        const name = document.createElement("input");
        name.type = "text";
        name.value = layer.name;
        name.className = "layerProperties-name";

        const BMTHolder = document.createElement("div");
        BMTHolder.className = "layerProperties-BMTHolder";

        const text = document.createElement("p");
        text.innerText = artimus.translate("transparency", "modal.layerProperty");
        text.className = "layerProperties-transparencyText";

        const blendMode = document.createElement("select");
        blendMode.className = "layerProperties-blendMode";
        const blendModePreview = document.createElement("img");
        blendModePreview.className = "layerProperties-blendModePreview";

        const blendModeHolder = document.createElement("div");
        blendModeHolder.className = "layerProperties-CenterHolder layerProperties-BlendModeHolder";
        
        const transparencyInput = document.createElement("input");
        const transparencySlider = document.createElement("input");
        transparencyInput.className = "layerProperties-transparencyInput";
        transparencySlider.className = "layerProperties-transparencySlider";

        const finalDiv = document.createElement("div");
        finalDiv.className = "layerProperties-doneButtonHolder";

        const doneButton = document.createElement("button");
        doneButton.innerText = artimus.translate("done", "modal.layerProperty");
        doneButton.className = "artimus-button";

        nameHolder.appendChild(name);

        blendModeHolder.appendChild(blendModePreview);
        blendModeHolder.appendChild(blendMode);
        
        BMTHolder.appendChild(transparencyInput);
        BMTHolder.appendChild(transparencySlider);

        finalDiv.appendChild(doneButton);

        contents.appendChild(nameHolder);
        contents.appendChild(text);
        contents.appendChild(blendModeHolder);
        contents.appendChild(BMTHolder);
        contents.appendChild(finalDiv);

        //Setup transparency
        transparencyInput.type = "number";
        transparencyInput.min = 0;
        transparencyInput.max = 100;

        transparencySlider.type = "range";
        transparencySlider.min = 0;
        transparencySlider.max = 100;

        //A bit of a doozy but it works
        const updateTransparency = (value) => {
            value = (value !== undefined) ? Math.max(0, Math.min(100, Number(value))) : 0;
            
            transparencySlider.value = value;
            transparencyInput.value = value;
        }

        transparencyInput.oninput = (event) => updateTransparency(transparencyInput.value);
        transparencySlider.oninput = (event) => updateTransparency(transparencySlider.value);
        updateTransparency(layer.alpha * 100);
        
        //Setup blendmode stuff
        for (let modeID in artimus.blendModes) {
            const mode = artimus.blendModes[modeID];
            const option = document.createElement("option");

            option.value = mode;
            option.innerText = artimus.translate(mode, "blendModes");

            blendMode.appendChild(option);
        }

        blendMode.value = layer.blendMode;
        blendModePreview.src = `site/images/blendPreviews/${blendMode.value}.png`;

        blendMode.onchange = () => {
            blendModePreview.src = `site/images/blendPreviews/${blendMode.value}.png`;
        }

        //Set needed attributes
        doneButton.onclick = () => {
            layer.alpha = (transparencyInput.value / 100);
            if (layer.name != name.value) workspace.renameLayer(layer.name, name.value);
            layer.blendMode = blendMode.value;
        
            //Finally flag for update and close
            workspace.dirty = true;
            modal.close();
        }
    }, { height: 30 });
}