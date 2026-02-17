editor.settingsPage = () => {
    //Do some cool stuff
    new editor.modal(
        artimus.translate("title", "modal.settings"), 
        (contents, modal) => {
            contents.className += " popup-settings";

            const categories = document.createElement("div");
            const settings = document.createElement("div");

            categories.className = "settings-categoryList";
            settings.className = "settings-settingsList";

            let pageSwitch = () => {};

            //Add the categories to the sidebar
            for (let category in editor.settingDefs) {
                const button = document.createElement("button");
                button.innerText = artimus.translate(category, "modal.settings.category");
                button.className = "artimus-button settings-categoryButton";

                button.onclick = () => {
                    if (pageSwitch) pageSwitch();
                    
                    settings.innerHTML = "";

                    const categoryInfo = editor.settingDefs[category];
                    switch (typeof categoryInfo) {
                        case "object":
                            //Just incase a category changes it.
                            settings.className = "settings-settingsList";
                            settings.appendChild(CUGI.createList(categoryInfo, { 
                                globalChange: () => {
                                    editor.saveSettings();
                                },

                                preprocess: (item) => modal.CUGIPreprocess(`modal.settings.${category}`, item)
                            }));
                            break;

                        case "function":
                            pageSwitch = categoryInfo(settings, `modal.settings.${category}`);
                            break
                    
                        default:
                            break;
                    }

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