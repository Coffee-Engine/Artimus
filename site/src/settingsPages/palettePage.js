editor.paletteMenu = class extends editor.settingsPage {
    createPaletteElement(palette) {
        if (!palette instanceof editor.palettes.palette) return;

        //Create the container for the palette
        const paletteContainer = document.createElement("div");
        paletteContainer.className = "settings-paletteContainer";

        const paletteName = document.createElement("p");
        paletteName.className = "settings-paletteName";
        paletteName.innerText = palette.name;

        //Details for the palette, like origin, color count, and other stuff.
        const paletteDetails = document.createElement("div");
        paletteDetails.className = "settings-paletteDetails";

        const paletteAuthor = document.createElement("p");
        paletteAuthor.className = "settings-paletteDetail settings-paletteAuthor";
        paletteAuthor.innerText = artimus.translate("palette.by", this.translationKey).replace("[author]", palette.author);

        const paletteOrigin = document.createElement("p");
        paletteOrigin.className = "settings-paletteDetail settings-paletteOrigin";
        paletteOrigin.innerText = artimus.translate("palette.origin", this.translationKey).replace("[source]", palette.source);

        const paletteColors = document.createElement("p");
        paletteColors.className = "settings-paletteDetail settings-paletteColors";
        paletteColors.innerText = artimus.translate("palette.colors", this.translationKey).replace("[count]", palette.colors.length);

        //Links are strange as they can't / can exist, so make sure to check for reality.
        const paletteLink = document.createElement("a");
        paletteLink.className = "settings-paletteDetail settings-paletteLink";
        paletteLink.innerText = artimus.translate("palette.link", this.translationKey);

        //Protocol;
        const protocolMatches = palette.url.match(/\w*\:\/\//);
        if (protocolMatches && palette.url.startsWith(protocolMatches[0])) {
            paletteLink.href = palette.url;
            paletteLink.innerText = paletteLink.innerText
                .replace("[protocol]", protocolMatches[0].replace("://", ""))
                .replace("[site]", palette.url.replace(protocolMatches[0], "").split("/")[0]);
        }
        else paletteLink.innerText = artimus.translate("palette.linkUnknown", this.translationKey);

        //Strange buttons
        const paletteExport = document.createElement("button");
        paletteExport.className = "artimus-button settings-paletteDetail settings-paletteExport";
        paletteExport.innerText = artimus.translate("palette.export", this.translationKey).replace("[source]", palette.source);
        
        const paletteDelete = document.createElement("button");
        paletteDelete.className = "artimus-button settings-paletteDetail settings-paletteDelete";
        paletteDelete.innerText = artimus.translate("palette.delete", this.translationKey).replace("[count]", palette.colors.length);

        //Now the actual palette display gradient.
        const paletteDisplay = document.createElement("div");
        paletteDisplay.className = "settings-paletteDisplay";
        paletteDisplay.style.setProperty("--palette", palette.toGradient());

        //Functionality
        paletteExport.onclick = () => 
            editor.downloadText(`${palette.name}.json`, JSON.stringify(palette.toJSON()));
        
        paletteDelete.onclick = () => 
            editor.palettes.deletePalette(palette.name);

        paletteDetails.appendChild(paletteAuthor);
        paletteDetails.appendChild(paletteOrigin);
        paletteDetails.appendChild(paletteExport);
        paletteDetails.appendChild(paletteColors);
        paletteDetails.appendChild(paletteLink);
        paletteDetails.appendChild(paletteDelete);
        
        paletteContainer.appendChild(paletteName);
        paletteContainer.appendChild(paletteDetails);
        paletteContainer.appendChild(paletteDisplay);

        return paletteContainer;
    }

    async displayPalettes(from, count) {
        this.paletteList.innerHTML = "";

        from = Math.floor(Math.max(0, Math.min(this.palettes.length - 1, from)) / count) * count;
        this.pageStart = from || 0;

        count = Math.min(this.palettes.length, from + count) - from;
        
        this.pageDescription.innerText = artimus.translate("palettesOnPage", this.translationKey)
        .replace("[first]", from + 1)
        .replace("[last]", Math.min(this.palettes.length, from + count))
        .replace("[total]", this.palettes.length);

        if (count > 0) {
            for (let i=from; i<from+count; i++) {
                const palette = await editor.palettes.getPalette(this.palettes[i]);
                const paletteElement = this.createPaletteElement(palette);

                if (paletteElement) {
                    paletteElement.style.setProperty("--index", i - from);
                    this.paletteList.appendChild(paletteElement);
                }
            }
        }
    }

    refreshAndUpdate() {
        editor.palettes.getPalettes().then((keys) => {
            this.palettes = keys;
            this.displayPalettes(this.pageStart, 10);
        });
    }

    init(container, translationKey, onchange) {
        const self = this;

        //For inputting files
        const fileReader = new FileReader();
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        
        fileReader.onload = () => {
            const palette = editor.palettes.fromText(fileReader.result);
            editor.palettes.savePalette(palette);
        }
        fileInput.onchange = () => fileReader.readAsText(fileInput.files[0]);

        //The actual UI element.
        container.className = "settings-paletteMenu";

        //Create the initial buttons to create and import palettes
        const paletteTopHolder = document.createElement("div");
        paletteTopHolder.className = "settings-paletteManagementButtons";
        
        const createPalette = document.createElement("button");
        createPalette.className = "artimus-button settings-paletteNew";
        createPalette.innerText = artimus.translate("create", translationKey);
        
        const importPalette = document.createElement("button");
        importPalette.className = "artimus-button settings-paletteImport";
        importPalette.innerText = artimus.translate("import", translationKey);
        
        const lospecPalette = document.createElement("button");
        lospecPalette.className = "artimus-button settings-paletteLospec";
        lospecPalette.innerText = artimus.translate("importLospec", translationKey);

        //Create navigation buttons
        const palettePager = document.createElement("div");
        palettePager.className = "settings-paletteManagementPager";

        const previousPage = document.createElement("button");
        previousPage.className = "artimus-button settings-palettePageButton settings-palettePreviousPage";
        previousPage.innerText = artimus.translate("lastPage", translationKey);

        const nextPage = document.createElement("button");
        nextPage.className = "artimus-button settings-palettePageButton settings-paletteNextPage";
        nextPage.innerText = artimus.translate("nextPage", translationKey);

        this.pageDescription = document.createElement("p");
        this.pageDescription.className = "settings-palettePageDescription";
        this.pageDescription.innerText = artimus.translate("palettesOnPage", translationKey);

        //Then the actual palette list
        this.paletteList = document.createElement("div");
        this.paletteList.className = "settings-paletteList";

        paletteTopHolder.appendChild(createPalette);
        paletteTopHolder.appendChild(importPalette);
        paletteTopHolder.appendChild(lospecPalette);

        palettePager.appendChild(previousPage);
        palettePager.appendChild(this.pageDescription);
        palettePager.appendChild(nextPage);

        container.appendChild(paletteTopHolder);
        container.appendChild(palettePager);
        container.appendChild(this.paletteList);

        this.palettes = [];
        this.pageStart = 0;

        //Reset the palette list and get the palettes of the first page.
        this.displayPalettes(0, 0);
        this.refreshAndUpdate();

        createPalette.onclick = () => { editor.paletteCreationMenu(); }
        importPalette.onclick = () => fileInput.click();
        lospecPalette.onclick = () => { editor.spawnModal("importLospec"); }

        previousPage.onclick = () => {
            this.pageStart -= 10;
            this.displayPalettes(this.pageStart, 10);
        }

        nextPage.onclick = () => {
            this.pageStart += 10;
            this.displayPalettes(this.pageStart, 10);
        }

        this.selfRefresh = () => { this.refreshAndUpdate.call(self); };
        editor.addEventListener("paletteAdded", this.selfRefresh);
        editor.addEventListener("paletteRemoved", this.selfRefresh);
    }

    destroy() {
        editor.removeEventListener("paletteAdded", this.selfRefresh);
        editor.removeEventListener("paletteRemoved", this.selfRefresh);
    }
}