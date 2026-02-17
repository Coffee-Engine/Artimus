editor.exportMenu = () => {
    const workspace = editor.workspace;
    new editor.modal(artimus.translate("title", "modal.exportFile"), (contents, modal) => {
        contents.className += " popup-exportFile";

        //Html elements
        const name = document.createElement("input");
        name.type = "text";
        name.value = artimus.translate("defaultName", "modal.exportFile");

        //Show formats available for export
        const formatMenu = document.createElement("select");
        formatMenu.className = "exportFile-formatDropdown";

        const formatQuality = document.createElement("input");
        formatQuality.type = "range";
        formatQuality.min = 0;
        formatQuality.max = 1;
        formatQuality.step = 0.05;
        formatQuality.value = 1;
        formatQuality.className = "exportFile-formatQuality";

        //A small description. Nice to have
        const formatDescription = document.createElement("p");
        formatDescription.className = "exportFile-formatDescription";

        //For size manipulation in post
        const size = document.createElement("input");
        size.type = "number";
        size.className = "exportFile-sizeInput";
        size.min = 0.1;
        size.max = 16;
        size.step = 0.1;
        size.value = 1;

        const finalSize = document.createElement("p");
        finalSize.className = "exportFile-finalSize";

        //Incase the artist wants to add a background in post
        const backgroundDiv = document.createElement("div");
        backgroundDiv.className = "exportFile-backgroundDataHolder";

        const backgroundEnabled = document.createElement("input");
        backgroundEnabled.type = "checkbox";
        backgroundEnabled.className = "exportFile-backgroundEnabler";

        const backgroundColor = document.createElement("input");
        backgroundColor.type = "color";
        backgroundColor.value = "#000000";
        backgroundColor.disabled = true;
        backgroundColor.className = "exportFile-backgroundColor";

        const finalDiv = document.createElement("div");
        finalDiv.className = "exportFile-finalDiv";

        const finalButton = document.createElement("button");
        finalButton.className = "artimus-button";
        finalButton.innerText = artimus.translate("export", "modal.exportFile");

        //Add it to the dom
        backgroundDiv.appendChild(backgroundEnabled);
        backgroundDiv.appendChild(backgroundColor);

        finalDiv.appendChild(finalButton);

        contents.appendChild(name);
        contents.appendChild(editor.quickP(artimus.translate("formatText", "modal.exportFile"), "exportFile-labelText exportFile-formatText"));
        contents.appendChild(formatMenu);
        contents.appendChild(formatDescription);
        contents.appendChild(editor.quickP(artimus.translate("qualityText", "modal.exportFile"), "exportFile-labelText exportFile-qualityText"));
        contents.appendChild(formatQuality);
        contents.appendChild(editor.quickP(artimus.translate("size", "modal.exportFile"), "exportFile-labelText exportFile-sizeText"));
        contents.appendChild(size);
        contents.appendChild(finalSize);
        contents.appendChild(editor.quickP(artimus.translate("background", "modal.exportFile"), "exportFile-labelText exportFile-backgroundText"));
        contents.appendChild(backgroundDiv);
        contents.appendChild(finalDiv);

        //Add file extensions to file dropdown
        for (let format in artimus.extensionToMIME) {
            const option = document.createElement("option");
            //Configure, and if it is the preferred one append the preferred marker
            option.innerText = format;
            if (editor.settings.preferredFormat == format) option.innerText += ` ${artimus.translate("preferred", "modal.exportFile")}`;
            option.value = format;

            formatMenu.appendChild(option);
        }

        //Update descriptions for the formats, and set the default value to the preferred format
        const updateFormat = () => {
            formatDescription.innerText = artimus.translate(formatMenu.value, "modal.exportFile.formatDescription");
            formatQuality.disabled = !artimus.lossyFormats.includes(formatMenu.value);
        }
        
        formatMenu.value = editor.settings.preferredFormat;
        formatMenu.onchange = () => updateFormat();
        updateFormat();

        //Enable background color when background is enabled.
        backgroundEnabled.oninput = () => backgroundColor.disabled = !backgroundEnabled.checked;

        //Allow for updating the final size, and clamping it to 8192;
        const updateFinalSize = () => {
            if (workspace.width * size.value > 8192) size.value *= 8192 / (workspace.width * size.value);
            if (workspace.height * size.value > 8192) size.value *= 8192 / (workspace.height * size.value);
            size.value = Math.floor(size.value * 100) / 100;

            finalSize.innerText = `${Math.max(1, Math.floor(workspace.width * size.value))}x${Math.max(1, Math.floor(workspace.height * size.value))}`;
        }

        size.oninput = () => updateFinalSize();
        updateFinalSize();

        //Finally the final button
        finalButton.onclick = () => {
            workspace.exportToPC(formatMenu.value, {
                background: backgroundEnabled.checked,
                backgroundColor: backgroundColor.value,
                sizeMul: Number(size.value),
                quality: Number(formatQuality.value),
                forceDialogue: true
            });
        }
    }, { width: 21, height: 50 })
}