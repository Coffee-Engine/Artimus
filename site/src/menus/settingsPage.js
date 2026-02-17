editor.settingsPage = () => {
    //Do some cool stuff
    new editor.modal(
        artimus.translate("title", "modal.settings"), 
        (contents, modal) => {
            contents.className += " popup-settings";

            const categories = document.createElement("div");
            const settings = document.createElement("div");

            categories.classList = "settings-categoryList";
            settings.classList = "settings-settingsList";

            //Add the categories to the sidebar
            for (let category in editor.settingDefs) {
                const button = document.createElement("button");
                button.innerText = artimus.translate(category, "modal.settings.category");
                button.className = "artimus-button settings-categoryButton";

                button.onclick = () => {
                    settings.innerHTML = "";

                    settings.appendChild(CUGI.createList(editor.settingDefs[category], { 
                        globalChange: () => {
                            editor.saveSettings();
                        },

                        preprocess: (item) => modal.CUGIPreprocess(`modal.settings.${category}`, item)
                    }));
                };

                categories.appendChild(button);
            }

            //Add them to the contents then "click" the first one
            contents.appendChild(categories);
            contents.appendChild(settings);

            categories.children[0].onclick();
            
        }, 
        { translationContext: "settings", width: 60 }
    );
}