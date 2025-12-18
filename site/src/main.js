window.editor = {
    docEdit: {
        width: 256,
        height: 240
    },

    language: {}
};

editor.closeModal = () => {
    document.body.style.setProperty("--modal-interaction", "none");
    document.body.style.setProperty("--modal-opacity", "0%");
}

editor.fileResize = (newFile) => {
    editor.docEdit = {
        width: 256,
        height: 240
    };

    editor.popup.innerHTML = "";
    editor.popup.appendChild(CUGI.createList([
        { type: "header", text: (newFile) ? "New File" : "Resize" },
        { type: "int", text: "width", key: "width", target: editor.docEdit},
        { type: "int", text: "height", key: "height", target: editor.docEdit},
        { type: "button", text: (newFile) ? "create" : "resize", onclick: () => {
            if (newFile) artimus.activeWorkspaces[0].new(editor.docEdit.width, editor.docEdit.height);
            else artimus.activeWorkspaces[0].resize(editor.docEdit.width, editor.docEdit.height);
            editor.closeModal();
        }}
    ]));

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");
}

artimus.layerPropertyMenu = (workspace, layer) => {
    editor.popup.innerHTML = "";
    editor.popup.appendChild(CUGI.createList([
        { type: "header", text: layer.name },
        { type: "dropdown", target: layer, key: "blendMode", items: [
            { text: "Default", value: "source-over"},
            { text: "additive", value: "lighter"},
            { text: "multiply", value: "multiply" },
            { text: "subtractive", value: "difference" },

            { text: "exclude", value: "exclusion" },

            { text: "screen", value: "screen" },
            { text: "overlay", value: "overlay" },

            { text: "lighten", value: "lighten" },
            { text: "darken", value: "darken" },

            { text: "burn", value: "color-burn" },
            { text: "dodge", value: "color-dodge" },

            { text: "soft-light", value: "soft-light"},
            { text: "hard-light", value: "hard-light"},
        ]},
        { type: "button", text: "ok", onclick: () => editor.closeModal() }
    ]));

    document.body.style.setProperty("--modal-interaction", "all");
    document.body.style.setProperty("--modal-opacity", "100%");
}

artimus.translate = (item, context) => (editor.language[`${context}.${item}`] || `${context}.${item}`);

fetch("lang/english.json").then(result => result.text()).then(text => {
    //Parse the language file.
    editor.language = JSON.parse(text);

    editor.workspace = artimus.inject(document.getElementById("workspace-area"));
    editor.popup = document.getElementById("popup");
    editor.workspace.resize(0, 0);
    artimus.globalRefreshTools();
})