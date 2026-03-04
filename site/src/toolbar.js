editor.toolbar = {
    items: {
        "file": [
            { type: "button", text: "new", onclick: () => {
                editor.newFile();
            }},
            { type: "button", text: "save", onclick: () => {
                artimus.activeWorkspaces[0].exportToPC();
            }},
            { type: "button", text: "saveAs", onclick: () => {
                artimus.activeWorkspaces[0].exportToPC("artimus", { forceDialogue: true });
            }},
            { type: "button", text: "export", onclick: () => {
                editor.exportMenu();
            }},
            { type: "button", text: "load", onclick: () => {
                editor.loadFile(false);
            }}
        ],
        "edit": [
            { type: "label", text:"sprite" },
            { type: "button", text: "resize", onclick: () => {
                editor.fileResize(false);
            }},
            { type: "button", text: "crop", onclick: () => {
                artimus.activeWorkspaces[0].cropToSelection();
            }},
            { type: "button", text: "undo", onclick: () => {
                artimus.activeWorkspaces[0].undo();
            }},
            { type: "button", text: "redo", onclick: () => {
                artimus.activeWorkspaces[0].redo();
            }},
            { type: "label", text:"editor" },
            { type: "button", text: "settings", onclick: () => {
                editor.settingsPage();
            }}
        ],
    },

    element: document.getElementById("toolbar"),

    refresh: () => {
        if (!editor.versionIdentifier) {
            editor.versionIdentifier = document.createElement("p");
            editor.versionIdentifier.style.textAlign = "right";
            editor.versionIdentifier.style.width = "100%";
        }
        else editor.versionIdentifier.parentElement.removeChild(editor.versionIdentifier);

        //Create the elements
        editor.toolbar.element.innerHTML = "";
        for (let key in editor.toolbar.items) {
            //Create the dropdown element
            const dropdown = document.createElement("button");
            dropdown.innerText = artimus.translate(key, "toolbar");
            dropdown.className = "CUGI-popup-button";

            //Add the inner options for the dropdown.
            const item = editor.toolbar.items[key];
            dropdown.onclick = () => {
                if (CUGI.currentPopup) {
                    CUGI.currentPopup.close();
                    CUGI.currentPopup = null;
                }

                const bounds = dropdown.getClientRects()[0];
                CUGI.currentPopup = CUGI.createPopup(item, {
                    preprocess: (item) => {
                        return {...item, text: artimus.translate(item.text, `toolbar.${key}`)};
                    }
                }, bounds.left, bounds.top);
            }

            editor.toolbar.element.appendChild(dropdown);
        }

        editor.toolbar.element.appendChild(editor.versionIdentifier);
    }
}