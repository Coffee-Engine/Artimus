editor.settings = {
    maxHistory: 10,
    preferredFormat: "png",
    debug: false,
    preferGreaterAxis: true, 

    theme: "default",
    lastTheme: "default",
    customBackground: "#e2e2ff",
    customText: "#29053a",
    customEraserInline: "#d0d0ff",
    customAccent: "#438eff",
    customGrid1: "#bbbbff",
    customGrid2: "#7878a4",
    iconsUseText: true,
    customIcon: "#29053a",
    toolsUseAccent: true,
    customEraserOutline: "#438eff",
    customSelection: "#438eff",
    buttonsUseBackground: true,
    customButton: "#e2e2ff",
    customCSS: false,
    customCSSCode: "",

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
            "dark",
            "eclipse",
            "custom"
        ], onchange: (value, item) => {
            if (value == "custom") editor.useCustomTheme();

            if (item) {
                //Refresh is switching to or from custom.
                if (value == "custom" || item.target.lastTheme == "custom") {
                    item.refreshSelection();
                    item.target.lastTheme = value;
                    if (value == "custom") return;
                }

                item.target.lastTheme = value;
            }

            if (!editor.themes[value]) value = "default";

            const theme = editor.themes[value];
            for (let item in theme) { document.body.style.setProperty(`--${item}`, theme[item]); }
            for (let workspaceID in artimus.activeWorkspaces) { artimus.activeWorkspaces[workspaceID].refreshGridPattern(); }
        }},
        //The colors
        {type: "color", target: editor.settings, key: "customBackground", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customText", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customEraserInline", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customAccent", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customGrid1", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customGrid2", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: () => { editor.useCustomTheme(); }},

        //text-ish things
        {type: "boolean", target: editor.settings, key: "iconsUseText", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: (value, item) => { if (item) { item.refreshSelection(); } editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customIcon", disabled: () => { return (editor.settings.theme != "custom") || (editor.settings.iconsUseText); },
        onchange: () => { editor.useCustomTheme(); }},

        //Accent-ish things
        {type: "boolean", target: editor.settings, key: "toolsUseAccent", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: (value, item) => { if (item) { item.refreshSelection(); } editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customEraserOutline", disabled: () => { return (editor.settings.theme != "custom") || (editor.settings.toolsUseAccent); },
        onchange: () => { editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customSelection", disabled: () => { return (editor.settings.theme != "custom") || (editor.settings.toolsUseAccent); },
        onchange: () => { editor.useCustomTheme(); }},

        //background-ish things
        {type: "boolean", target: editor.settings, key: "buttonsUseBackground", disabled: () => { return editor.settings.theme != "custom"; },
        onchange: (value, item) => { if (item) { item.refreshSelection(); } editor.useCustomTheme(); }},
        {type: "color", target: editor.settings, key: "customButton", disabled: () => { return (editor.settings.theme != "custom") || (editor.settings.buttonsUseBackground); },
        onchange: () => { editor.useCustomTheme(); }},

        //Bad Idea.
        {type: "button", key: "randomize", onclick: (button, event, item) => {
            const getRandomColor = () => {
                return artimus.RGBToHex({
                    r: Math.floor(Math.random() * 255),
                    g: Math.floor(Math.random() * 255),
                    b: Math.floor(Math.random() * 255)
                });
            }

            editor.settings.customBackground = getRandomColor();
            editor.settings.customText = getRandomColor();
            editor.settings.customEraserInline = getRandomColor();
            editor.settings.customAccent = getRandomColor();
            editor.settings.customGrid1 = getRandomColor();
            editor.settings.customGrid2 = getRandomColor();
            editor.settings.customIcon = getRandomColor();
            editor.settings.customEraserOutline = getRandomColor();
            editor.settings.customSelection = getRandomColor();
            editor.settings.customButton = getRandomColor();

            editor.useCustomTheme();
            editor.saveSettings();
            item.refreshSelection();
        }},

        {type: "boolean", target: editor.settings, key: "customCSS", onchange: (value, item) => { if (item) { item.refreshSelection(); } editor.useCustomTheme(); }},
        {type: "multiline", target: editor.settings, key: "customCSSCode", rows: 15, disabled: () => { return !editor.settings.customCSS; },
        onchange: () => { editor.useCustomTheme(); }},
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