//Small safeguard, nothing to much.
window.extensionPrefix = "(function(extensionURL) {\n//To somewhat safeguard the editor\n//I know it's not the most secure but it works for now.\n";
window.extensionSuffix = "\n})([URL HERE])";

editor.addExtension = (url) => {
    return new Promise((resolve, reject) => {
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

editor.removeExtension = (url) => {
    const extensionIndex = editor.settings.extensions.findIndex((el) => el.url == url);
    if (extensionIndex >= 0) {
        editor.settings.extensions.splice(extensionIndex, 1);
    }
}

editor.startExtension = (extension, skipNewDat) => {
    new Promise(async (resolve) => {
        //If we are online, try to update.
        if (navigator.onLine && !skipNewDat) {
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

        for (let fileID in extension.files) {
            const file = await fetch(`${extension.fetchURL}${extension.files[fileID]}`).then(res => res.text());
            const fileCode = `${extensionPrefix}${file}${extensionSuffix.replace("[URL HERE]", `"${extension.url.replaceAll('"','\\"')}"`)}`;

            const script = document.createElement("script");
            script.innerHTML = fileCode;
            document.body.appendChild(script);
        }
    });
}

//Autostart existing ones.
for (let idx in editor.settings.extensions) {
    editor.startExtension(editor.settings.extensions[idx]);
}