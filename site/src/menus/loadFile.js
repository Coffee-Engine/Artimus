editor.loadFile = (parentModal) => {
    //Open the popup directly if we are a part of a parent node.
    if (parentModal) {
        artimus.activeWorkspaces[0].importFromPC(true).then(() => parentModal.close());
        return;
    }

    //Simple, easy.
    new editor.modal(artimus.translate("title", "modal.loadFile"), (contents, modal) => {

        const loadReplaceButton = document.createElement("button");
        const loadAddButton = document.createElement("button");

        loadReplaceButton.className = "artimus-button";
        loadAddButton.className = "artimus-button";


        loadReplaceButton.innerText = artimus.translate("loadAndReplace", "modal.loadFile");
        loadAddButton.innerText = artimus.translate("loadAndAdd", "modal.loadFile");

        loadReplaceButton.onclick = () => {
            artimus.activeWorkspaces[0].importFromPC(true).then(() => {
                modal.close();
                parentModal.close();
            });
        };

        loadAddButton.onclick = () => {
            artimus.activeWorkspaces[0].importFromPC(false).then(() => {
                modal.close();
                parentModal.close();
            });
        };

        contents.appendChild(loadReplaceButton); // don't give the option to add as a layer if this is probably an empty file
        contents.appendChild(loadAddButton);
        
    }, { translationContext: "loadFile", width: 25, height: 20 });
}