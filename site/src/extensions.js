//Small safeguard, nothing to much.
window.extensionPrefix = `(function(extensionURL, extensionID) {
    const translate = (key, context) => {
        const translationKey = extensionID + \`.$\{context}.$\{key}\`;
        return editor.language[translationKey] || translationKey;
    }

    const addTool = (id, tool) => {
        tool.prototype.name = tool.prototype.name || translate(id, "tool");
        artimus.tools[\`$\{extensionID}_$\{id}\`] = tool;
    }
`;
window.extensionSuffix = "\n})([URL HERE], [EXTENSION ID])";

editor.addExtension = (url) => {
    return new Promise((resolve, reject) => {
        if (editor.hasExtension(url)) {
            reject("Extension exists!");
            return;
        }

        fetch(url).then(res => res.text()).then(text => {
            //Parse in a saf-ish way
            try {
                const extensionJSON = JSON.parse(text);
                extensionJSON.url = url;

                extensionJSON.fetchURL = extensionJSON.url.split("/");
                if (extensionJSON.fetchURL[extensionJSON.fetchURL.length - 1].includes(".")) extensionJSON.fetchURL.splice(extensionJSON.fetchURL.length - 1, 1);
                extensionJSON.fetchURL = extensionJSON.fetchURL.join("/") + "/";
                
                //Add it
                editor.settings.extensions.push(extensionJSON);

                editor.startExtension(extensionJSON, true);
                resolve(extensionJSON);
            } catch (error) { console.warn(`Failed to add extension ${url}\n::===---===::\n${error}`) }
        });
    });
}

editor.hasExtension = (url) => {
    const extensionIndex = editor.settings.extensions.findIndex((el) => el.url == url);
    return extensionIndex >= 0;
}

editor.removeExtension = (url) => {
    const extensionIndex = editor.settings.extensions.findIndex((el) => el.url == url);
    if (extensionIndex >= 0) {
        const extension = editor.settings.extensions.splice(extensionIndex, 1)[0];
        if (extension.id) {
            //Delete uneeded data.
            editor.storage.getKeys().then((keys) => {
                for (let keyID in keys) {
                    if (keys[keyID].startsWith(`${extension.id}/`)) editor.storage.deleteKey(keys[keyID]);
                }
            })
        }
    }
}

editor.startExtension = (extension, skipNewDat) => {
    return new Promise(async (resolve) => {
        //Force extensions to have files
        if ((!extension.files) || (!extension.id)) return;

        //If we are online, try to update.
        if (navigator.onLine) {
            //Allow the fetching of the data json from being fetched if it isn't needed
            if (!skipNewDat) {
                //Parse in a saf-ish way
                let newDat = await fetch(extension.url).then(res => res.text());
                try {
                    //Parse and use
                    newDat = JSON.parse(newDat);
                    
                    //Delete removed keys, and add new keys
                    for (let key in extension) { 
                        if (
                            key != "url" &&
                            key != "fetchURL" &&
                            newDat[key] === undefined
                        ) {
                            delete extension[key]; 
                        }
                    }
                    for (let key in newDat) { extension[key] = newDat[key]; }

                    console.log(`Fetched new data for the extension "${extension.name}" which may be called "${newDat.name}"`)

                    //Save the settings
                    editor.saveSettings();
                } catch (error) { console.warn(`New data for extension "${extension.newDat}" is invalid!`)}
            }

            //Update translations if possible.
            if (extension.translations && extension.translations[editor.language.identifier]) {
                const file = await fetch(`${extension.fetchURL}${extension.translations[editor.language.identifier]}`).then(res => res.text());
                try {
                    const parsed = JSON.parse(file);
                    editor.storage.setKey(`${extension.id}/translation`, parsed);
                } catch (error) { console.warn(`Translation for ${extension.name} failed to load due to an error.\n===---===\n${error}`)}
            }

            //Update files if possible.
            for (let fileID in extension.files) {
                const file = await fetch(`${extension.fetchURL}${extension.files[fileID]}`).then(res => res.text());
                await editor.storage.setKey(`${extension.id}/file/${extension.files[fileID]}`, file);
            }
        }

        //Apply translation
        const extensionTranslation = await editor.storage.getKey(`${extension.id}/translation`);
        if (extensionTranslation) editor.language = Object.assign(editor.language, extensionTranslation);

        //Load files
        for (let fileID in extension.files) {
            const file = await editor.storage.getKey(`${extension.id}/file/${extension.files[fileID]}`);
            
            const fileCode = `${extensionPrefix}${file}${extensionSuffix
                .replace("[URL HERE]", `"${extension.url.replaceAll('"','\\"')}"`)
                .replace("[EXTENSION ID]", `"${(extension.id || "extension").replaceAll('"','\\"')}"`)
            }`;

            const script = document.createElement("script");
            script.innerHTML = fileCode;
            document.body.appendChild(script);
        }

        artimus.globalRefreshTools()
        resolve();
    });
}