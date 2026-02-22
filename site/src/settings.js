editor.settings = {
    theme: "default",
    maxHistory: 10,
    preferredFormat: "png",
    debug: false,
    preferGreaterAxis: true, 
    hotkeys: {...artimus.hotkeys},
    extensions: []
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
    ],
    //Hotkeys are complex, so we use a function instead of a cugi menu.
    hotkeys: { function: editor.hotkeyMenu, onchange: () => {
        artimus.hotkeys = editor.settings.hotkeys;
        editor.saveSettings();
    }},
    extensions: { function: editor.extensionMenu, onchange: () => {
        editor.saveSettings();
    }}
};


if (localStorage.getItem("settings")) {
    Object.assign(editor.settings, JSON.parse(localStorage.getItem("settings")));

    for (let category in editor.settingDefs) {
        const categoryObj = editor.settingDefs[category];
        //If we aren't a CUGI menu, then try to call object functions
        if (!Array.isArray(categoryObj)) {
            if (typeof categoryObj == "object") {
                if (categoryObj.onchange) categoryObj.onchange();
            }
            continue;
        }

        for (let item in categoryObj) {
            const setting = categoryObj[item];

            if (setting.onchange) setting.onchange(editor.settings[setting.key]);
        }
    }
}