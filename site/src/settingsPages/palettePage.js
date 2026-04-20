editor.paletteMenu = (container, translationKey, onchange) => {
    //For inputting files
    const fileReader = new FileReader();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    
    fileReader.onload = () => {
        fileReader.result();
    }
    fileInput.onchange = () => fileReader.readAsText(fileInput.files[0]);

    //The actual UI element.
    container.className = "settings-paletteMenu";

    //Create the initial buttons to create and import palettes
    const paletteTopHolder = document.createElement("div");
    
    const createPalette = document.createElement("button");
    createPalette.className = "artimus-button settings-paletteNew";
    createPalette.innerText = artimus.translate("create", translationKey);
    
    const importPalette = document.createElement("button");
    importPalette.className = "artimus-button settings-paletteImport";
    importPalette.innerText = artimus.translate("import", translationKey);
    
    const lospecPalette = document.createElement("button");
    lospecPalette.className = "artimus-button settings-paletteLospec";
    lospecPalette.innerText = artimus.translate("importLospec", translationKey);

    paletteTopHolder.appendChild(createPalette);
    paletteTopHolder.appendChild(importPalette);
    paletteTopHolder.appendChild(lospecPalette);

    container.appendChild(paletteTopHolder);

    importPalette.onclick = () => fileInput.click();
    lospecPalette.onclick = () => { editor.lospecMenu(); }
}