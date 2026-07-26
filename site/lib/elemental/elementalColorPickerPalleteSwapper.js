(function() {
    const paletteSwapperButtonModule = class extends elemental.colorPickerModule {
        build(parent, container) {
            //Create elements
            const div = document.createElement("div");
            const button = document.createElement("button");

            //Style elements
            div.className = "elemental-color-picker-palette-button-container";

            button.innerText = artimus.translate("changePalette", "colorPicker");
            button.className = "artimus-button elemental-color-picker-change-palette-button"; 
            
            //Add to container
            div.appendChild(button);
            container.appendChild(div);

            //Add the functionality
            button.onclick = () => {
                parent.destroyPopup();
                editor.spawnModal("paletteSelector");
            }
        }

        condition(parent) { return parent.hasAttribute("swatch"); }
    }
    
    elemental.colorPickerConfig.modules.splice(3, 0, paletteSwapperButtonModule);
})();