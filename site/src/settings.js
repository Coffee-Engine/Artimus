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
    ],
    //Hotkeys are complex, so we use a function instead of a cugi menu.
    hotkeys: (container, translationKey) => {
        container.className = "settings-hotkeyList";
        
        //Create elements
        const hotkeyAddHolder = document.createElement("div");
        hotkeyAddHolder.className = "settings-hotkeyHolder";

        const hotkeyInput = document.createElement("button");
        hotkeyInput.className = "artimus-button settings-hotkeyInput";
        hotkeyInput.innerText = artimus.translate("clickToInput", translationKey);

        //Add the dropdown menu, and it's options.
        const hotkeyFunction = document.createElement("select");
        for (let funcID in editor.hotkeyFunctions) {
            const func = editor.hotkeyFunctions[funcID];

            const option = document.createElement("option");
            option.innerText = artimus.translate(func, `${translationKey}.functions`);
            option.value = func;

            hotkeyFunction.appendChild(option);
        }

        const hotkeyAdd = document.createElement("button");
        hotkeyAdd.className = "artimus-button settings-hotkeyAdd";
        hotkeyAdd.innerText = artimus.translate("add", translationKey);

        //Add functionality to the key capture mechanism.
        let hotkeyToAdd = "";
        const inputCapturer = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const key = event.key.toLowerCase();

            if (!artimus.modifierKeys.includes(key)) {
                let keyDescription = key;

                if (event.altKey) keyDescription = `alt+${keyDescription}`;
                if (event.shiftKey) keyDescription = `shift+${keyDescription}`;
                if (event.ctrlKey) keyDescription = `ctrl+${keyDescription}`;

                //Just incase...
                if (event.metaKey) keyDescription = `meta+${keyDescription}`;

                const joiner = artimus.translate("joiner", translationKey);
                let translatedDescription = keyDescription.split("+");

                for (let idx in translatedDescription) {
                    translatedDescription[idx] = artimus.translate(translatedDescription[idx], translationKey, true);
                }
                
                artimus.unfocusedHotkeys = true;
                hotkeyInput.innerText = translatedDescription.join(joiner);
                hotkeyToAdd = keyDescription;
                document.removeEventListener("keydown", inputCapturer);
            }
        }

        hotkeyInput.onclick = () => {
            artimus.unfocusedHotkeys = false;
            hotkeyInput.innerText = artimus.translate("waitingForInput", translationKey);

            document.addEventListener("keydown", inputCapturer);
        }

        hotkeyAddHolder.appendChild(hotkeyInput);
        hotkeyAddHolder.appendChild(hotkeyFunction);
        hotkeyAddHolder.appendChild(hotkeyAdd);
        container.appendChild(hotkeyAddHolder);

        //Prevent errors from switching pages.
        return () => document.removeEventListener("keydown", inputCapturer);
    }
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