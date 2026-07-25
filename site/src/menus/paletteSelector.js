//Hope and pray this updates.
editor.paletteSelectionMenu = () => {
    new editor.modal(artimus.translate("paletteSelector.title", "modal"), (content, modal) => {
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
        pageDescription.className = "settings-palettePageDescription";
        pageDescription.innerText = artimus.translate("palettesOnPage", translationKey);
    }, { width: 50, height: 40 });
}