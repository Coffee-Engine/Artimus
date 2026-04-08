editor.paletteMenu = (container, translationKey, onchange) => {
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

    lospecPalette.onclick = () => { editor.lospecMenu(); }
}