editor.paletteMenu = (container, translationKey, onchange) => {
    container.className = "settings-paletteMenu";
    
    const createPalette = document.createElement("button");
    createPalette.innerText = artimus.translate("create", translationKey);
    
    const importPalette = document.createElement("button");
    importPalette.innerText = artimus.translate("import", translationKey);
    
    const lospecPalette = document.createElement("button");
    lospecPalette.innerText = artimus.translate("importLospec", translationKey);

    container.appendChild(createPalette);
    container.appendChild(importPalette);
    container.appendChild(lospecPalette);
}