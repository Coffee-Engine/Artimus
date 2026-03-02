editor.loadFile = (parentModal) => {
    //Open the popup directly if we are a part of a parent node.
    if (parentModal) {
        artimus.activeWorkspaces[0].importFromPC(true).then(() => parentModal.close());
        return;
    }

    artimus.activeWorkspaces[0].importFromPC(true);
}