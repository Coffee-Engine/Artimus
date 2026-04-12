editor.lospecMenu = () => {
    new editor.modal(artimus.translate("lospec.title", "modal"), (content, modal) => {
        //Create the search box.
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = artimus.translate("lospec.title", "modal");

        //Make the display for the palette
        const previewContainer = document.createElement("div");
        previewContainer.className = "lospec-previewContainer";

        //Preview information
        const paletteInformation = document.createElement("div");
        paletteInformation.className = "lospec-previewInformation";

        const paletteName = document.createElement("p");
        paletteName.className = "lospec-previewGame";

        const colorCount = document.createElement("p");
        colorCount.className = "lospec-previewCount";

        const authorName = document.createElement("p");
        authorName.className = "lospec-previewAuthor";

        // Color preview
        const paletteDisplay = document.createElement("div");
        paletteDisplay.className = "lospec-previewDisplay"

        //Add information
        paletteInformation.appendChild(paletteName);
        paletteInformation.appendChild(colorCount);
        paletteInformation.appendChild(authorName);

        previewContainer.appendChild(paletteInformation);
        previewContainer.appendChild(paletteDisplay);

        content.appendChild(input);
        content.appendChild(previewContainer);

        const paletteJSONRetrieved = (text) => {
            const json = JSON.parse(text);

            const name = json.name || "palette";
            const author = json.author || "author";
            const colors = (json.colors || ["#ff00ff"]).map((val) => `#${val}`);

            paletteName.innerText = name;
            colorCount.innerText = colors.length;
            authorName.innerText = author;

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

        //Add functionality
        input.onchange = () => {
            let paletteID = input.value.toLowerCase().replaceAll(/\s/g, "-");
            if (paletteID.endsWith("palette")) paletteID = paletteID.replace(/-?palette/, "");

            //Fetch the palette from the lospec api, both before and api palette
            fetch(`https://Lospec.com/palette-list/${paletteID}.json`).then(res=>res.text())
            .then(paletteJSONRetrieved)
            .catch(() => {
                console.warn(`Palette "${paletteID}" can't be found!`)
            });
        }
    }, { height: 30 });
}