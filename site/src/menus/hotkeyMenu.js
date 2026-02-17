editor.hotkeyMenu = (container, translationKey, onchange) => {
    container.className = "settings-hotkeyList";
    const joiner = artimus.translate("joiner", translationKey);
    
    //Create elements
    const hotkeyInputHolder = document.createElement("div");
    hotkeyInputHolder.className = "settings-hotkeyDisplay settings-hotkeyAdditionDisplay";

    const hotkeyInput = document.createElement("button");
    hotkeyInput.className = "artimus-button settings-hotkeyInput";
    hotkeyInput.innerText = artimus.translate("clickToInput", translationKey);

    const addFunctionOptions = (selectElements) => {
        for (let funcID in editor.hotkeyFunctions) {
            const func = editor.hotkeyFunctions[funcID];

            const option = document.createElement("option");
            option.innerText = artimus.translate(func, `${translationKey}.functions`);
            option.value = func;

            selectElements.appendChild(option);
        }
    }

    //Add the dropdown menu, and it's options.
    const hotkeyFunction = document.createElement("select");
    addFunctionOptions(hotkeyFunction)

    const hotkeyAdd = document.createElement("button");
    hotkeyAdd.className = "artimus-button settings-hotkeyAdd";
    hotkeyAdd.innerText = artimus.translate("add", translationKey);

    const hotkeyDisplayHolder = document.createElement("div");
    hotkeyDisplayHolder.className = "settings-hotkeyDisplayHolder";

    //Add functionality to the key capture mechanism.
    let hotkeyToAdd = "";
    const inputCapturer = (event) => {
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
                translatedDescription[idx] = artimus.translate(translatedDescription[idx], translationKey, true);
            }
            
            artimus.unfocusedHotkeys = true;
            hotkeyInput.innerText = translatedDescription.join(joiner);
            hotkeyToAdd = keyDescription;
            document.removeEventListener("keydown", inputCapturer);
        }
    }

    //For adding hotkeys to the list.
    const addHotkeyDisplay = (hotkey, animationOffset) => {
        const holder = document.createElement("div");

        //For sequential animations
        holder.style.setProperty("--index", animationOffset);
        holder.className = "settings-hotkeyDisplay";

        let translatedDescription = hotkey.split("+");
        for (let idx in translatedDescription) {
            translatedDescription[idx] = artimus.translate(translatedDescription[idx], translationKey, true);
        }

        //Create the inner elements
        const description = document.createElement("p");
        description.innerText = translatedDescription.join(joiner);
        description.className = "settings-hotkeyDescription";

        const hotkeyDisplayFunction = document.createElement("select");
        addFunctionOptions(hotkeyDisplayFunction);
        hotkeyDisplayFunction.value = artimus.hotkeys[hotkey];

        const hotkeyRemove = document.createElement("button");
        hotkeyRemove.className = "artimus-button settings-hotkeyAdd settings-hotkeyRemove";
        hotkeyRemove.innerText = artimus.translate("remove", translationKey);

        hotkeyRemove.onclick = () => {
            holder.parentElement.removeChild(holder);
            delete editor.settings.hotkeys[hotkey];
            onchange();
        }

        //Then create the dom and add to the display holder
        holder.appendChild(description);
        holder.appendChild(hotkeyDisplayFunction);
        holder.appendChild(hotkeyRemove);
        
        hotkeyDisplayHolder.appendChild(holder);
    }

    hotkeyInput.onclick = () => {
        artimus.unfocusedHotkeys = false;
        hotkeyInput.innerText = artimus.translate("waitingForInput", translationKey);

        document.addEventListener("keydown", inputCapturer);
    }

    hotkeyAdd.onclick = () => {
        //Give an error if the hotkey doesn't exist.
        if (artimus.hotkeys[hotkeyToAdd]) {
            hotkeyInput.innerText = artimus.translate("hotkeyExists", translationKey);
        }
        else {
            editor.settings.hotkeys[hotkeyToAdd] = hotkeyFunction.value;
            addHotkeyDisplay(hotkeyToAdd, 0);
            onchange();
            
            hotkeyToAdd = "";
            hotkeyInput.innerText = artimus.translate("clickToInput", translationKey);
        }
    }

    //Setup the dom for the initial holder.
    hotkeyInputHolder.appendChild(hotkeyInput);
    hotkeyInputHolder.appendChild(hotkeyFunction);
    hotkeyInputHolder.appendChild(hotkeyAdd);
    container.appendChild(hotkeyInputHolder);
    container.appendChild(hotkeyDisplayHolder);

    let offset = 1;
    for (let hotkey in artimus.hotkeys) {
        addHotkeyDisplay(hotkey, offset);
        offset++;
    }

    //Prevent errors from switching pages.
    return () => document.removeEventListener("keydown", inputCapturer);
}