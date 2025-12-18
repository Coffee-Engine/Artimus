editor.settings = {};

editor.saveSettings = () => localStorage.setItem("settings", JSON.stringify(editor.settings));

editor.settingDefs = {
    general: [
        {type: "dropdown", target: editor.settings, key: "theme", items: [
            "default",
            "dark"
        ], onchange: (value) => {
            if (!editor.themes[value]) value = "default";

            const theme = editor.themes[value];
            for (let item in theme) { document.body.style.setProperty(`--${item}`, theme[item]); }
            for (let workspaceID in artimus.activeWorkspaces) { artimus.activeWorkspaces[workspaceID].refreshGridPattern(); }

            editor.saveSettings();
        }},
    ]
};


if (localStorage.getItem("settings")) {
    Object.assign(editor.settings, JSON.parse(localStorage.getItem("settings")));

    for (let category in editor.settingDefs) {
        for (let item in editor.settingDefs[category]) {
            const setting = editor.settingDefs[category][item];

            setting.onchange(editor.settings[setting.key]);
        }
    }
}

editor.settingsPage = () => {
    editor.docEdit = {
        width: 256,
        height: 240
    };

    editor.popup.innerHTML = "";
    editor.popup.appendChild(CUGI.createList(editor.settingDefs.general));

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");
}