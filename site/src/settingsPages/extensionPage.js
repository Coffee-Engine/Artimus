editor.extensionMenu = class extends editor.settingsPage {
    addExtensionDisplay(extension, index) {
        const extensionHolder = document.createElement("div");
        extensionHolder.className = "settings-extensionHolder";
        extensionHolder.style.setProperty("--index", index);

        const extensionIcon = document.createElement("img");
        extensionIcon.src = (extension.icon) ? `${extension.fetchURL}${extension.icon}` : "site/icons/ico48.png";
        extensionIcon.className = "settings-extensionIcon";

        const extensionData = document.createElement("div");
        extensionData.className = "settings-extensionData";

        const extensionName = document.createElement("div");
        extensionName.className = "settings-extensionDescription settings-extensionName";
        extensionName.innerText = extension.name || artimus.translate("namePlaceholder", this.translationKey);

        const extensionDescription = document.createElement("div");
        extensionDescription.className = "settings-extensionDescription";

        //Description stuff
        extensionDescription.innerText = artimus.translate("description", this.translationKey)
        .replace("[author]", (extension.author || artimus.translate("authorPlaceholder", this.translationKey)))
        .replace("[version]", (extension.version || artimus.translate("versionPlaceholder", this.translationKey)));

        //The finishing touch.
        const extensionModContainer = document.createElement("div");
        extensionModContainer.className = "settings-extensionModContainer";
    
        const extensionRemove = document.createElement("button");
        extensionRemove.className = "artimus-button settings-extensionAdd settings-extensionRemove";
        extensionRemove.innerText = artimus.translate("remove", this.translationKey);

        extensionRemove.onclick = () => {
            extensionHolder.parentElement.removeChild(extensionHolder);
            editor.removeExtension(extension.url);
            this.onchange();
        }

        extensionData.appendChild(extensionName);
        extensionData.appendChild(extensionDescription);
        extensionModContainer.appendChild(extensionRemove);

        extensionHolder.appendChild(extensionIcon);
        extensionHolder.appendChild(extensionData);
        extensionHolder.appendChild(extensionModContainer);
        this.extensionList.appendChild(extensionHolder);
    }

    init(container, translationKey, onchange) {
        container.className = "settings-extensionMenu";

        //So much, dom, manipulation...
        const infoHolder = document.createElement("div");
        infoHolder.className = "settings-extensionInfoHolder";

        const bigOlWarninText = document.createElement("h1");
        bigOlWarninText.innerText = artimus.translate("warning", translationKey);

        const warningDialogue = document.createElement("p");
        warningDialogue.innerText = artimus.translate("warningText", translationKey);

        const reloadButton = document.createElement("button");
        reloadButton.className = "artimus-button";
        reloadButton.innerText = artimus.translate("reload", translationKey);

        const listHolder = document.createElement("div");
        listHolder.className = "settings-extensionListHolder";

        //So much, dom, manipulation...
        const additionHolder = document.createElement("div");
        additionHolder.className = "settings-extensionDisplay settings-extensionAdditionDisplay";

        const urlInput = document.createElement("input");
        urlInput.type = "url";
        urlInput.placeholder = artimus.translate("placeholder", translationKey);
        
        const extensionAdd = document.createElement("button");
        extensionAdd.className = "artimus-button settings-extensionAdd";
        extensionAdd.innerText = artimus.translate("add", translationKey);
        
        this.extensionList = document.createElement("div");
        this.extensionList.className = "settings-extensionList";

        reloadButton.onclick = () => location.reload();

        urlInput.oninput = () => {
            if (editor.hasExtension(urlInput.value)) urlInput.setCustomValidity("Existing");
            else urlInput.setCustomValidity("");
        }

        extensionAdd.onclick = () => {
            if (!urlInput.checkValidity()) return;

            editor.addExtension(urlInput.value).then((extension) => {
                this.addExtensionDisplay(extension, 0);
                onchange();
                urlInput.value = "";
            })
        }

        for (let extID in editor.settings.extensions) {
            this.addExtensionDisplay(editor.settings.extensions[extID], Number(extID) + 1);
        }

        additionHolder.appendChild(urlInput);
        additionHolder.appendChild(extensionAdd);
        listHolder.appendChild(additionHolder);
        listHolder.appendChild(this.extensionList);
        infoHolder.appendChild(bigOlWarninText);
        infoHolder.appendChild(warningDialogue);
        infoHolder.appendChild(reloadButton);
        container.appendChild(infoHolder);
        container.appendChild(listHolder);
    }
}