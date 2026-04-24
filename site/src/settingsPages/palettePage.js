editor.paletteMenu = (container, translationKey, onchange) => {
    //For inputting files
    const fileReader = new FileReader();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    
    fileReader.onload = () => {
        const palette = editor.palettes.fromText(fileReader.result);
        editor.palettes.savePalette(palette);
    }
    fileInput.onchange = () => fileReader.readAsText(fileInput.files[0]);

    //The actual UI element.
    container.className = "settings-paletteMenu";

    //Create the initial buttons to create and import palettes
    const paletteTopHolder = document.createElement("div");
    paletteTopHolder.className = "settings-paletteManagementButtons";
    
    const createPalette = document.createElement("button");
    createPalette.className = "artimus-button settings-paletteNew";
    createPalette.innerText = artimus.translate("create", translationKey);
    
    const importPalette = document.createElement("button");
    importPalette.className = "artimus-button settings-paletteImport";
    importPalette.innerText = artimus.translate("import", translationKey);
    
    const lospecPalette = document.createElement("button");
    lospecPalette.className = "artimus-button settings-paletteLospec";
    lospecPalette.innerText = artimus.translate("importLospec", translationKey);

    //Create navigation buttons
    const palettePager = document.createElement("div");
    palettePager.className = "settings-paletteManagementPager";

    const previousPage = document.createElement("button");
    previousPage.className = "artimus-button settings-palettePageButton settings-palettePreviousPage";
    previousPage.innerText = artimus.translate("lastPage", translationKey);

    const nextPage = document.createElement("button");
    nextPage.className = "artimus-button settings-palettePageButton settings-paletteNextPage";
    nextPage.innerText = artimus.translate("nextPage", translationKey);

    const pageDescription = document.createElement("p");
    pageDescription.className = "settings-palettePageDescription";
    pageDescription.innerText = artimus.translate("palettesOnPage", translationKey);

    //Then the actual palette list
    const paletteList = document.createElement("div");
    paletteList.className = "settings-paletteList";

    paletteTopHolder.appendChild(createPalette);
    paletteTopHolder.appendChild(importPalette);
    paletteTopHolder.appendChild(lospecPalette);

    palettePager.appendChild(previousPage);
    palettePager.appendChild(pageDescription);
    palettePager.appendChild(nextPage);

    container.appendChild(paletteTopHolder);
    container.appendChild(palettePager);
    container.appendChild(paletteList);

    //Now we can create the palette button
    const createPaletteElement = (palette) => {
        if (!palette instanceof editor.palettes.palette) return;

        //Create the container for the palette
        const paletteContainer = document.createElement("div");
        paletteContainer.className = "settings-paletteContainer";

        const paletteName = document.createElement("p");
        paletteName.className = "settings-paletteName";
        paletteName.innerText = palette.name;

        //Details for the palette, like origin, color count, and other stuff.
        const paletteDetails = document.createElement("div");
        paletteDetails.className = "settings-paletteDetails";

        const paletteAuthor = document.createElement("p");
        paletteAuthor.className = "settings-paletteDetail settings-paletteAuthor";
        paletteAuthor.innerText = artimus.translate("palette.by", translationKey).replace("[author]", palette.author);

        const paletteOrigin = document.createElement("p");
        paletteOrigin.className = "settings-paletteDetail settings-paletteOrigin";
        paletteOrigin.innerText = artimus.translate("palette.origin", translationKey).replace("[source]", palette.source);

        const paletteColors = document.createElement("p");
        paletteColors.className = "settings-paletteDetail settings-paletteColors";
        paletteColors.innerText = artimus.translate("palette.colors", translationKey).replace("[count]", palette.colors.length);

        //Links are strange as they can't / can exist, so make sure to check for reality.
        const paletteLink = document.createElement("a");
        paletteLink.className = "settings-paletteDetail settings-paletteLink";
        paletteLink.innerText = artimus.translate("palette.link", translationKey);

        //Protocol;
        const protocolMatches = palette.url.match(/\w*\:\/\//);
        if (protocolMatches && palette.url.startsWith(protocolMatches[0])) {
            paletteLink.href = palette.url;
            paletteLink.innerText = paletteLink.innerText.replace("[protocol]", protocolMatches[0].replace("://", ""))
        }
        else paletteLink.innerText = artimus.translate("palette.linkUnknown", translationKey);

        const paletteDisplay = document.createElement("div");
        paletteDisplay.className = "settings-paletteDisplay";
        paletteDisplay.style.setProperty("--palette", palette.toGradient());

        paletteDetails.appendChild(paletteAuthor);
        paletteDetails.appendChild(paletteOrigin);
        paletteDetails.appendChild(paletteColors);
        paletteDetails.appendChild(paletteLink);
        
        paletteContainer.appendChild(paletteName);
        paletteContainer.appendChild(paletteDetails);
        paletteContainer.appendChild(paletteDisplay);

        return paletteContainer;
    }

    //Display the available palettes
    let palettes = [];
    let pageStart = 0;
    const displayPalettes = async (from, count) => {
        paletteList.innerHTML = "";

        from = Math.floor(Math.max(0, Math.min(palettes.length - 1, from)) / count) * count;
        pageStart = from;

        count = Math.min(palettes.length, from + count) - from;
        
        pageDescription.innerText = artimus.translate("palettesOnPage", translationKey)
        .replace("[first]", from + 1)
        .replace("[last]", Math.min(palettes.length, from + count))
        .replace("[total]", palettes.length);

        if (count > 0) {
            for (let i=from; i<from+count; i++) {
                const palette = await editor.palettes.getPalette(palettes[i]);
                const paletteElement = createPaletteElement(palette);

                paletteList.appendChild(paletteElement);
            }
        }
    }

    //Reset the palette list and get the palettes of the first page.
    displayPalettes(0, 0);
    editor.palettes.getPalettes().then((keys) => {
        palettes = keys;
        displayPalettes(0, 10);
    });

    importPalette.onclick = () => fileInput.click();
    lospecPalette.onclick = () => { editor.lospecMenu(); }

    previousPage.onclick = () => {
        pageStart -= 10;
        displayPalettes(pageStart, 10);
    }

    nextPage.onclick = () => {
        pageStart += 10;
        displayPalettes(pageStart, 10);        
    }
}