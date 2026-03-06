editor.startMenu = {
    open: () => {
        new editor.modal(artimus.translate("ready.title", "modal").replace("[VERSION]", editor.version), (content, modal) => {
            content.className += " ready-popup";

            const banner = document.createElement("div");
            banner.className = "ready-banner";

            banner.onclick = () => {
                window.open(location.href + "site/images/banner.png");
            }

            const bannerText = document.createElement("p");
            bannerText.innerText = artimus.translate("ready.authorTag", "modal").replace("[TITLE]", editor.bannerTitle);
            bannerText.className = "ready-banner-text";

            const authorLink = document.createElement("a");
            authorLink.innerText = editor.bannerAuthor;
            authorLink.href = editor.bannerAuthorURL;

            const seperator = document.createElement('hr');

            const divider = document.createElement('div');
            divider.className = "ready-divider"

            const recentFiles = document.createElement("div");
            recentFiles.className = "ready-list ready-recent";

            const recentText = document.createElement("p");
            recentText.innerText = artimus.translate("ready.recentFiles", "modal");
            recentText.className = "ready-recentText";

            const recentList = document.createElement("div");
            recentList.className = "ready-recentList";

            //Show recent projects if possible
            if (!window.showSaveFilePicker) recentList.innerText = artimus.translate("ready.recentFiles.notSupported", "modal");
            else {
                editor.recentStorage.getKey("recentProjects").then((arr) => {
                    arr = arr || [];
                    for (let i = arr.length - 1; i >= 0; i--) {
                        const fileHandle = arr[i];

                        //Create the button and add the text
                        const recentButton = document.createElement("button");
                        recentButton.className = "artimus-button ready-recentButton";

                        let extensionless = fileHandle.name.split(".");
                        extensionless.splice(extensionless.length - 1, 1);
                        
                        recentButton.innerText = extensionless.join(".");

                        recentList.appendChild(recentButton);

                        //Finally add functionality.
                        recentButton.onclick = () => {
                            fileHandle.requestPermission().then((val) => {
                                if (val != "granted") return;
                                fileHandle.getFile().then((file) => {
                                    editor.workspace.fileSystemHandle = fileHandle;
                                    editor.workspace.importFromImage(file, true);
                                    modal.close();
                                })
                            })
                        }
                    }
                });
            }

            const fileButtons = document.createElement("div");
            fileButtons.className = "ready-list ready-options";
            
            const newFile = document.createElement('button');
            newFile.className = "artimus-button";
            newFile.innerText = artimus.translate("ready.newFile", "modal");
            newFile.onclick = () => { editor.newFile(modal); }
            
            const loadFile = document.createElement('button');
            loadFile.className = "artimus-button";
            loadFile.innerText = artimus.translate("ready.loadFile", "modal");
            loadFile.onclick = () => { editor.loadFile(modal); }
            
            const settings = document.createElement('button');
            settings.className = "artimus-button";
            settings.innerText = artimus.translate("ready.settings", "modal");
            settings.onclick = () => { editor.settingsPage(); }
            
            const credits = document.createElement('button');
            credits.className = "artimus-button";
            credits.innerText = artimus.translate("ready.credits", "modal");
            credits.onclick = () => { editor.creditsMenu(); }

            recentFiles.appendChild(recentText);
            recentFiles.appendChild(recentList);

            fileButtons.appendChild(newFile);
            fileButtons.appendChild(loadFile);
            fileButtons.appendChild(settings);
            fileButtons.appendChild(credits);

            divider.appendChild(recentFiles);
            divider.appendChild(fileButtons);

            bannerText.appendChild(authorLink);

            content.appendChild(banner);
            content.appendChild(bannerText);
            content.appendChild(seperator);
            content.appendChild(divider);
        }, { hasClose: false })
    }
}