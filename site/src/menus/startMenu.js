editor.startMenu = {
    open: () => {
        new editor.modal(artimus.translate("ready.title", "modal").replace("[VERSION]", editor.version), (content, modal) => {
            content.className += " ready-popup";

            const banner = document.createElement("div");
            banner.className = "ready-banner";

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

            if (!window.showSaveFilePicker) recentList.innerText = artimus.translate("ready.recentFiles.notSupported", "modal");
            else {

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

            recentFiles.appendChild(recentText);
            recentFiles.appendChild(recentList);

            fileButtons.appendChild(newFile);
            fileButtons.appendChild(loadFile);
            fileButtons.appendChild(settings);

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