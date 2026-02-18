editor.loadFile = (forced) => {
    //Simple, easy.
    new editor.modal(artimus.translate("title", "modal.loadFile"), (contents, modal) => {

        const loadReplaceButton = document.createElement("button");
        const loadAddButton = document.createElement("button");
        const createButon = document.createElement("button");

        loadReplaceButton.className = "artimus-button";
        loadAddButton.className = "artimus-button";
        createButon.className = "artimus-button";


        createButon.innerText = artimus.translate("createInstead", "modal.loadFile");
        loadReplaceButton.innerText = artimus.translate("loadAndReplace", "modal.loadFile");
        loadAddButton.innerText = artimus.translate("loadAndAdd", "modal.loadFile");

        createButon.onclick = () => {
            modal.close();
            editor.newFile(true);
        }
        loadReplaceButton.onclick = () => {
            artimus.activeWorkspaces[0].importFromPC(true).then(() => {
                modal.close();
            });
        };
        loadAddButton.onclick = () => {
            artimus.activeWorkspaces[0].importFromPC(false).then(() => {
                modal.close();
            });
        };

        contents.appendChild(loadReplaceButton); // don't give the option to add as a layer if this is probably an empty file
        if (!forced) contents.appendChild(loadAddButton);
        contents.appendChild(document.createElement("br")); // seperate load buttons and create button
        contents.appendChild(createButon);
        
    }, { hasClose: !forced, translationContext: "loadFile", width: 25, height: 20 });
}