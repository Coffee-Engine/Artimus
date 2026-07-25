//Hope and pray this updates.
editor.paletteSelectionModal = class extends editor.modal {
    construct(content, self) {
        content.className += " popup-paletteSelector";

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
        this.pageDescription.className = "settings-palettePageDescription";
        this.pageDescription.innerText = artimus.translate("palettesOnPage", translationKey);
    }
}

editor.paletteSelectionMenu = () => {
    new editor.paletteSelectionModal(null, { width: 50, height: 40 });
}