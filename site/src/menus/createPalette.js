//Hope and pray this updates.
editor.paletteCreationMenu = () => {
    new editor.modal(artimus.translate("createPalette.title", "modal"), (content, modal) => {
        content.className += " popup-createPalette";

        //Define elements
        const colorArea = document.createElement("div");
        const addColor = document.createElement("button");
        const bottomArea = document.createElement("div");
        const detailArea = document.createElement("div");
        const paletteName = document.createElement("p");
        const paletteNameInput = document.createElement("input");
        const authorName = document.createElement("p");
        const authorNameInput = document.createElement("input");
        const authorURL = document.createElement("p");
        const authorURLInput = document.createElement("input");
        const done = document.createElement("button");

        //Add classes
        colorArea.className = "createPalette-colorArea";
        addColor.className = "artimus-button createPalette-addColor";
        bottomArea.className = "createPalette-bottomArea";
        detailArea.className = "createPalette-detailArea";
        done.className = "artimus-button";

        //Text n stuff
        addColor.innerText = artimus.translate("createPalette.addColor", "modal");
        paletteName.innerText = artimus.translate("createPalette.name", "modal");
        authorName.innerText = artimus.translate("createPalette.author", "modal");
        authorURL.innerText = artimus.translate("createPalette.url", "modal");
        done.innerText = artimus.translate("createPalette.done", "modal");
        
        //Define the inputs
        paletteNameInput.type = "text";
        paletteNameInput.placeholder = artimus.translate("createPalette.placeholder.name", "modal");
        authorNameInput.type = "text";
        authorNameInput.placeholder = artimus.translate("createPalette.placeholder.author", "modal");
        authorURLInput.type = "url";
        authorURLInput.placeholder = artimus.translate("createPalette.placeholder.url", "modal");

        //Add to content
        colorArea.appendChild(addColor);
        detailArea.appendChild(paletteName);
        detailArea.appendChild(paletteNameInput);
        detailArea.appendChild(authorName);
        detailArea.appendChild(authorNameInput);
        detailArea.appendChild(authorURL);
        detailArea.appendChild(authorURLInput);
        bottomArea.appendChild(detailArea);
        bottomArea.appendChild(done);
        content.appendChild(colorArea);
        content.appendChild(bottomArea);

        //Then functionality
        addColor.onclick = () => {
            const newColor = document.createElement("color-picker");
            newColor.value = "#ff0000";

            colorArea.insertBefore(newColor, addColor);
        }

        //When we click done we want to compile the palette
        done.onclick = () => {
            const compiledPalette = new editor.palettes.palette();

            //Assign general info
            compiledPalette.name = paletteNameInput.value || paletteNameInput.placeholder;
            compiledPalette.author = authorNameInput.value || paletteNameInput.placeholder;
            compiledPalette.source = "Artimus";
            compiledPalette.url = authorURLInput.value || location.href;

            //Get all of the colors
            for (childID in colorArea.children) {
                const child = colorArea.children[childID];
                if (!(child instanceof HTMLElement)) continue;
                if (child.tagName.toLowerCase() == "color-picker") compiledPalette.colors.push(child.value);
            }

            //Make sure we have colors
            if (compiledPalette.colors.length > 0) {
                //Add it to the palette list and close.
                editor.palettes.savePalette(compiledPalette);
                modal.close();
            }
        }
    }, { width: 50, height: 40 });
}