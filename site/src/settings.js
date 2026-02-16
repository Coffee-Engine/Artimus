editor.settings = {
    theme: "default",
    maxHistory: 10,
    preferredFormat: "png",
    debug: false,
    preferGreaterAxis: true, 
};

editor.saveSettings = () => localStorage.setItem("settings", JSON.stringify(editor.settings));

editor.settingDefs = {
    general: [
        {type: "int", target: editor.settings, key: "maxHistory", min: 1, max: 50, onchange: (value) => {
            artimus.maxHistory = value;
        }},
        {type: "dropdown", target: editor.settings, key: "preferredFormat", items: Object.keys(artimus.extensionToMIME)},
        {type: "boolean", target: editor.settings, key: "preferGreaterAxis", onchange: (value) => {
            artimus.preferGreaterAxis = value;
        }},
        {type: "boolean", target: editor.settings, key: "debug" }
    ],
    theme: [
        {type: "dropdown", target: editor.settings, key: "theme", items: [
            "default",
            "dark"
        ], onchange: (value) => {
            if (!editor.themes[value]) value = "default";

            const theme = editor.themes[value];
            for (let item in theme) { document.body.style.setProperty(`--${item}`, theme[item]); }
            for (let workspaceID in artimus.activeWorkspaces) { artimus.activeWorkspaces[workspaceID].refreshGridPattern(); }
        }},
    ]
};


if (localStorage.getItem("settings")) {
    Object.assign(editor.settings, JSON.parse(localStorage.getItem("settings")));

    for (let category in editor.settingDefs) {
        for (let item in editor.settingDefs[category]) {
            const setting = editor.settingDefs[category][item];

            if (setting.onchange) setting.onchange(editor.settings[setting.key]);
        }
    }
}

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