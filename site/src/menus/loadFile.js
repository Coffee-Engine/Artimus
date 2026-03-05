editor.loadFile = (parentModal) => {
    //Open the popup directly if we are a part of a parent node.
    if (parentModal) {
        editor.workspace.importFromPC(true).then(() => parentModal.close());
        return;
    }

    editor.workspace.importFromPC(true);
}