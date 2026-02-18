editor.extensionMenu = (container, translationKey, onchange) => {
    //So much, dom, manipulation...
    const additionHolder = document.createElement("div");
    additionHolder.className = "settings-extensionDisplay settings-extensionAdditionDisplay";

    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = artimus.translate("placeholder", translationKey);
    
    const extensionAdd = document.createElement("button");
    extensionAdd.className = "artimus-button settings-extensionAdd";
    extensionAdd.innerText = artimus.translate("add", translationKey);
    
    const extensionList = document.createElement("div");
    extensionList.className = "settings-extensionList";

    const addExtensionDisplay = (extension) => {
        const extensionHolder = document.createElement("div");
        extensionHolder.className = "settings-extensionHolder";

        const extensionIcon = document.createElement("img");
        extensionIcon.src = extension.icon || "site/icons/ico48.png";
        extensionIcon.className = "settings-extensionIcon";

        const extensionData = document.createElement("div");
        extensionData.className = "settings-extensionData";

        const extensionName = document.createElement("div");
        extensionName.className = "settings-extensionDescription settings-extensionName";
        extensionName.innerText = extension.name || artimus.translate("namePlaceholder", translationKey);

        const extensionDescription = document.createElement("div");
        extensionDescription.className = "settings-extensionDescription";

        //Description stuff
        extensionDescription.innerText = artimus.translate("description", translationKey)
        .replace("[author]", (extension.author || artimus.translate("authorPlaceholder", translationKey)))
        .replace("[version]", (extension.version || artimus.translate("versionPlaceholder", translationKey)));

        //The finishing touch.
        const extensionModContainer = document.createElement("div");
        extensionModContainer.className = "settings-extensionModContainer";
    
        const extensionRemove = document.createElement("button");
        extensionRemove.className = "artimus-button settings-extensionAdd settings-extensionRemove";
        extensionRemove.innerText = artimus.translate("remove", translationKey);

        extensionRemove.onclick = () => {
            extensionHolder.parentElement.removeChild(extensionHolder);
            editor.removeExtension(extension.url);
        }

        extensionData.appendChild(extensionName);
        extensionData.appendChild(extensionDescription);
        extensionModContainer.appendChild(extensionRemove);

        extensionHolder.appendChild(extensionIcon);
        extensionHolder.appendChild(extensionData);
        extensionHolder.appendChild(extensionModContainer);
        extensionList.appendChild(extensionHolder);
    }

    extensionAdd.onclick = () => {
        editor.addExtension(urlInput.value).then((extension) => {
            addExtensionDisplay(extension);
            onchange();
        })
    }

    for (let extID in editor.settings.extensions) {
        addExtensionDisplay(editor.settings.extensions[extID]);
    }

    additionHolder.appendChild(urlInput);
    additionHolder.appendChild(extensionAdd);
    container.appendChild(additionHolder);
    container.appendChild(extensionList);
}