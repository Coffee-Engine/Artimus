editor.hotkeyMenu = class extends editor.settingsPage {
    addFunctionOptions(selectElements) {
        for (let funcID in editor.hotkeyFunctions) {
            const func = editor.hotkeyFunctions[funcID];

            const option = document.createElement("option");
            option.innerText = artimus.translate(func, `${this.translationKey}.functions`);
            option.value = func;

            selectElements.appendChild(option);
        }
    }

    addHotkeyDisplay(hotkey, animationOffset) {
        const holder = document.createElement("div");

        //For sequential animations
        holder.style.setProperty("--index", animationOffset);
        holder.className = "settings-hotkeyDisplay";

        let translatedDescription = hotkey.split("+");
        for (let idx in translatedDescription) {
            translatedDescription[idx] = artimus.translate(translatedDescription[idx], this.translationKey, true);
        }

        //Create the inner elements
        const description = document.createElement("p");
        description.innerText = translatedDescription.join(this.joiner);
        description.className = "settings-hotkeyDescription";

        const hotkeyDisplayFunction = document.createElement("select");
        this.addFunctionOptions(hotkeyDisplayFunction);
        hotkeyDisplayFunction.value = artimus.hotkeys[hotkey];

        const hotkeyRemove = document.createElement("button");
        hotkeyRemove.className = "artimus-button settings-hotkeyAdd settings-hotkeyRemove";
        hotkeyRemove.innerText = artimus.translate("remove", this.translationKey);

        //Update hotkeys
        hotkeyRemove.onclick = () => {
            holder.parentElement.removeChild(holder);
            delete editor.settings.hotkeys[hotkey];
            artimus.hotkeys = editor.settings.hotkeys;
            this.onchange();
        }

        //Then create the dom and add to the display holder
        holder.appendChild(description);
        holder.appendChild(hotkeyDisplayFunction);
        holder.appendChild(hotkeyRemove);
        
        this.hotkeyDisplayHolder.appendChild(holder);
    }

    inputCapturer(event) {
        event.preventDefault();
        event.stopPropagation();

        const key = event.key.toLowerCase();

        if (!artimus.modifierKeys.includes(key)) {
            let keyDescription = key;

            if (event.altKey) keyDescription = `alt+${keyDescription}`;
            if (event.shiftKey) keyDescription = `shift+${keyDescription}`;
            if (event.ctrlKey) keyDescription = `ctrl+${keyDescription}`;

            //Just incase...
            if (event.metaKey) keyDescription = `meta+${keyDescription}`;
            let translatedDescription = keyDescription.split("+");

            for (let idx in translatedDescription) {
                translatedDescription[idx] = artimus.translate(translatedDescription[idx], this.translationKey, true);
            }
            
            this.hotkeyInput.innerText = translatedDescription.join(this.joiner);
            this.hotkeyToAdd = keyDescription;
            document.removeEventListener("keydown", this.inputCapturer);
        }
    }

    init(container, translationKey, onchange) {
        const self = this;

        container.className = "settings-hotkeyList";
        this.joiner = artimus.translate("joiner", translationKey);
        
        //Create elements
        this.hotkeyInputHolder = document.createElement("div");
        this.hotkeyInputHolder.className = "settings-hotkeyDisplay settings-hotkeyAdditionDisplay";

        this.hotkeyInput = document.createElement("button");
        this.hotkeyInput.className = "artimus-button settings-hotkeyInput";
        this.hotkeyInput.innerText = artimus.translate("clickToInput", translationKey);

        //Add the dropdown menu, and it's options.
        this.hotkeyFunction = document.createElement("select");
        this.addFunctionOptions(this.hotkeyFunction)

        this.hotkeyAdd = document.createElement("button");
        this.hotkeyAdd.className = "artimus-button settings-hotkeyAdd";
        this.hotkeyAdd.innerText = artimus.translate("add", translationKey);

        this.hotkeyDisplayHolder = document.createElement("div");
        this.hotkeyDisplayHolder.className = "settings-hotkeyDisplayHolder";

        //Add functionality to the key capture mechanism.
        this.hotkeyToAdd = "";

        this.hotkeyInput.onclick = () => {
            this.hotkeyInput.innerText = artimus.translate("waitingForInput", translationKey);

            document.addEventListener("keydown", (event) => {this.inputCapturer.call(self, event);});
        }

        this.hotkeyAdd.onclick = () => {
            //Give an error if the hotkey doesn't exist.
            if (artimus.hotkeys[this.hotkeyToAdd]) {
                this.hotkeyInput.innerText = artimus.translate("hotkeyExists", translationKey);
            }
            else {
                editor.settings.hotkeys[this.hotkeyToAdd] = this.hotkeyFunction.value;
                artimus.hotkeys = editor.settings.hotkeys;

                this.addHotkeyDisplay(this.hotkeyToAdd, 0);
                onchange();
                
                this.hotkeyToAdd = "";
                this.hotkeyInput.innerText = artimus.translate("clickToInput", translationKey);
            }
        }

        //Setup the dom for the initial holder.
        this.hotkeyInputHolder.appendChild(this.hotkeyInput);
        this.hotkeyInputHolder.appendChild(this.hotkeyFunction);
        this.hotkeyInputHolder.appendChild(this.hotkeyAdd);
        container.appendChild(this.hotkeyInputHolder);
        container.appendChild(this.hotkeyDisplayHolder);

        let offset = 1;
        for (let hotkey in artimus.hotkeys) {
            this.addHotkeyDisplay(hotkey, offset);
            offset++;
        }
    }

    destroy() {
        document.removeEventListener("keydown", this.inputCapturer);
    }
}