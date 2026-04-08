editor.lospecMenu = () => {
    new editor.modal(artimus.translate("lospec.title", "modal"), (content, modal) => {
        //Create the search box.
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = artimus.translate("lospec.title", "modal");

        const debugInf = document.createElement('p');

        content.appendChild(input);
        content.appendChild(debugInf);

        const paletteJSONRetrieved = (text) => {
            const json = JSON.parse(text);

            console.log(json);
            debugInf.innerText = `${json.name || "palette"}\nby: ${json.author}\n with ${json.colors.length} colours\n\n${json.colors.join(", ")}`;
        }

        //Add functionality
        input.onchange = () => {
            let paletteID = input.value.toLowerCase().replaceAll(/\s/g, "-");
            if (paletteID.endsWith("palette")) paletteID = paletteID.replace(/-?palette/, "");

            //Fetch the palette from the lospec api, both before and api palette
            fetch(`https://Lospec.com/palette-list/${paletteID}.json`).then(res=>res.text())
            .then(paletteJSONRetrieved)
            .catch(() => {
                console.warn(`Palette "${paletteID}" can't be found!`)
            });
        }
    }, { height: 30 });
}