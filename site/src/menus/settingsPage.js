editor.registerModal("settings", class extends editor.modal {
    init(content, self) {
        //Set the settings
        this.title = artimus.translate("title", "modal.settings");
        this.width = 60;

        //Spawn required elements
        content.className += " popup-settings";

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

            //WHen clicked open the category
            button.onclick = () => {
                if (pageSwitch) pageSwitch();
                
                //Clear previous contents
                settings.innerHTML = "";

                const categoryInfo = editor.settingDefs[category];
                switch (typeof categoryInfo) {
                    //If we are a CUGI list create the list
                    case "object":
                        //Just incase a category changes it.
                        settings.className = "settings-settingsList";
                        if (Array.isArray(categoryInfo)) settings.appendChild(CUGI.createList(categoryInfo, { 
                            globalChange: () => {
                                editor.saveSettings();
                            },

                            preprocess: (item) => this.CUGIPreprocess(`modal.settings.${category}`, item)
                        }));
                        else if (categoryInfo.function) categoryInfo.function(settings, `modal.settings.${category}`, categoryInfo.onchange);                            
                        break;

                    //If we are a function, or class spawn/run it.
                    case "function":
                        if (categoryInfo.constructor) {
                            const constructed = new categoryInfo(settings, `modal.settings.${category}`, () => editor.saveSettings());
                            pageSwitch = () => { constructed.destroy.call(constructed); };
                        }
                        else pageSwitch = categoryInfo(settings, `modal.settings.${category}`, () => editor.saveSettings());
                        break
                
                    default:
                        break;
                }

            };

            categories.appendChild(button);
        }

        //Add them to the content then "click" the first one
        content.appendChild(categories);
        content.appendChild(settings);

        categories.children[0].onclick();
    }
});