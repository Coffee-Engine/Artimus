(function() {
    const paletteSwapperButtonModule = class extends elemental.colorPickerModule {
        build(parent, container) {
            //Create the button
            const button = document.createElement("button");
            button.innerText = "Change Palette";
            button.className = "artimus-button elemental-color-picker-change-palette-button";            
            container.appendChild(button);

            //Add the functionality
            button.onclick = () => {
                parent.destroyPopup();
                editor.paletteSelectionMenu();
            }
        }

        condition(parent) { return parent.hasAttribute("swatch"); }
    }
    
    elemental.colorPickerConfig.modules.splice(3, 0, paletteSwapperButtonModule);
})();