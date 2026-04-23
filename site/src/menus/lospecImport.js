//Hope and pray this updates.
editor.lospecMenu = () => {
    new editor.modal(artimus.translate("lospec.title", "modal"), (content, modal) => {
        //Create the search box.
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = artimus.translate("lospec.placeholder", "modal");
        input.className = "lospec-paletteInput";

        //Make the display for the palette
        const previewContainer = document.createElement("div");
        previewContainer.className = "lospec-previewContainer";

        //Preview information
        const paletteInformation = document.createElement("div");
        paletteInformation.className = "lospec-previewInformation";

        const paletteName = document.createElement("p");
        paletteName.className = "lospec-information lospec-previewName";

        const colorCount = document.createElement("p");
        colorCount.className = "lospec-information lospec-previewCount";

        const authorName = document.createElement("p");
        authorName.className = "lospec-information lospec-previewAuthor";

        // Color preview
        const paletteDisplay = document.createElement("div");
        paletteDisplay.className = "lospec-previewDisplay";

        //Finally the final button
        const addPalette = document.createElement("button");
        addPalette.className = "artimus-button settings-paletteAdd";
        addPalette.innerText = artimus.translate("lospec.add", "modal");

        //Add information
        paletteInformation.appendChild(paletteName);
        paletteInformation.appendChild(colorCount);

        previewContainer.appendChild(paletteInformation);
        previewContainer.appendChild(authorName);
        previewContainer.appendChild(paletteDisplay);

        content.appendChild(input);
        content.appendChild(previewContainer);
        content.appendChild(addPalette);

        const paletteJSONRetrieved = (text) => {
            const json = JSON.parse(text);

            //Parse the text and make sure to add placeholders if the need is there.
            const name = json.name || artimus.translate("lospec.placeholder.name", "modal");
            const author = json.author || artimus.translate("lospec.placeholder.author", "modal");
            const colors = (json.colors || ["ff00ff", "000000"]).map((val) => `#${val}`);

            //Add the text;
            paletteName.innerText = name;
            colorCount.innerText = artimus.translate("lospec.colors", "modal").replace("[count]", colors.length);
            authorName.innerText = artimus.translate("lospec.by", "modal").replace("[author]", author);

            //Figure out the palette display;
            if (colors.length == 1) paletteDisplay.style.setProperty("--palette", colors[0]);
            else {
                let paletteGradient = "linear-gradient(90deg";
                const paletteStep = 1 / colors.length;

                //Now create the gradient
                let step = 0;
                for (let i=0;i<colors.length - 1;i++) {
                    step += paletteStep;
                    paletteGradient += `, ${colors[i]} ${step * 100}%, ${colors[i + 1]} ${step * 100}%`;
                }

                paletteGradient += ")";

                paletteDisplay.style.setProperty("--palette", paletteGradient);
            }
        }

        //Just init.
        paletteJSONRetrieved("{}");

        //Add functionality
        input.onchange = () => {
            let paletteID = input.value.toLowerCase().trim().replaceAll(/\s/g, "-");
            if (paletteID.endsWith("palette")) paletteID = paletteID.replace(/-?palette/, "");

            //Fetch the palette from the lospec api, both before and api palette
            fetch(`https://Lospec.com/palette-list/${paletteID}.json`).then(res=>res.text())
            .then(paletteJSONRetrieved)
            .catch(() => {
                console.warn(`Palette "${paletteID}" can't be found!`);
                paletteJSONRetrieved("{}");
            });
        }
    }, { height: 16  });
}