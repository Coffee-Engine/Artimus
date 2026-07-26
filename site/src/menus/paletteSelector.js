editor.registerModal("paletteSelector", class extends editor.modal {
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
        paletteAuthor.innerText = artimus.translate("palette.by", "modal.paletteSelector").replace("[author]", palette.author);

        const paletteColors = document.createElement("p");
        paletteColors.className = "settings-paletteDetail settings-paletteColors";
        paletteColors.innerText = artimus.translate("palette.colors", "modal.paletteSelector").replace("[count]", palette.colors.length);

        const paletteUse = document.createElement("button");
        paletteUse.className = "artimus-button settings-paletteDetail paletteSelector-paletteDetail paletteSelector-paletteUse";
        paletteUse.innerText = artimus.translate("palette.use", "modal.paletteSelector");

        //Now the actual palette display gradient.
        const paletteDisplay = document.createElement("div");
        paletteDisplay.className = "settings-paletteDisplay";
        paletteDisplay.style.setProperty("--palette", palette.toGradient());

        //Functionality
        paletteDetails.appendChild(paletteAuthor);
        paletteDetails.appendChild(paletteColors);
        paletteDetails.appendChild(paletteUse);
        
        paletteContainer.appendChild(paletteName);
        paletteContainer.appendChild(paletteDetails);
        paletteContainer.appendChild(paletteDisplay);

        //Functionality
        paletteUse.onclick = () => {
            editor.currentPalette = palette;
            this._close();
        }

        return paletteContainer;
    }

    async displayPalettes(from, count) {
        this.paletteList.innerHTML = "";

        from = Math.floor(Math.max(0, Math.min(this.palettes.length - 1, from)) / count) * count;
        this.pageStart = from || 0;

        count = Math.min(this.palettes.length, from + count) - from;
        
        this.pageDescription.innerText = artimus.translate("palettesOnPage", "modal.paletteSelector")
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

    init(content, self) {
        this.title = artimus.translate("title", "modal.paletteSelector");
        this.width = 50;
        this.height = 40;
        
        content.className += " popup-paletteSelector";

        //Create navigation buttons
        const palettePager = document.createElement("div");
        const previousPage = document.createElement("button");
        const nextPage = document.createElement("button");
        this.pageDescription = document.createElement("p");

        //Get classes for navigation buttons
        palettePager.className = "settings-paletteManagementPager";
        previousPage.className = "artimus-button settings-palettePageButton settings-palettePreviousPage paletteSelector-palettePageButton paletteSelector-palettePreviousPage";
        nextPage.className = "artimus-button settings-palettePageButton settings-paletteNextPage paletteSelector-palettePageButton paletteSelector-paletteNextPage";
        this.pageDescription.className = "settings-palettePageDescription paletteSelector-palettePageDescription";

        //Apply the text for the navigation buttons
        this.pageDescription.innerText = artimus.translate("palettesOnPage", "modal.paletteSelector");
        previousPage.innerText = artimus.translate("lastPage", "modal.paletteSelector");
        nextPage.innerText = artimus.translate("nextPage", "modal.paletteSelector");

        //Create palette list
        this.paletteList = document.createElement("div");
        this.paletteList.className = "settings-paletteList paletteSelector-paletteList";

        //Add the elements to the page
        palettePager.appendChild(previousPage);
        palettePager.appendChild(this.pageDescription);
        palettePager.appendChild(nextPage);
        content.appendChild(palettePager);
        content.appendChild(this.paletteList);

        //Functionality
        this.palettes = [];
        this.pageStart = 0;

        //Reset the palette list and get the palettes of the first page.
        this.displayPalettes(0, 0);
        this.refreshAndUpdate();

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
});