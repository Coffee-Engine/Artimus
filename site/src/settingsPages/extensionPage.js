editor.extensionMenu = (container, translationKey, onchange) => {
    const additionHolder = document.createElement("div");
    additionHolder.className = "settings-extensionDisplay settings-extensionAdditionDisplay";

    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = artimus.translate("placeholder", translationKey);
    
    const extensionAdd = document.createElement("button");
    extensionAdd.className = "artimus-button settings-extensionAdd";
    extensionAdd.innerText = artimus.translate("add", translationKey);

    const addExtensionDisplay = (extension) => {

    }

    additionHolder.appendChild(urlInput);
    additionHolder.appendChild(extensionAdd);
    container.appendChild(additionHolder);
}