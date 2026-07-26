editor.registerModal("fontMenu", class extends editor.modal {
    init(content, self, { fonts, resolve }) {
        fonts = fonts || [];

        this.title = artimus.translate("fontMenu.title", "modal");
        this.height = 22.5;

        const innerList = document.createElement("div");
        let fontSet = new Set();
        innerList.className = "artimus-font-list"

        for (let fontID in fonts) {
            if (!fontSet.has(fonts[fontID].family)) {
                fontSet.add(fonts[fontID].family);

                const button = document.createElement("button");
                
                button.innerText = fonts[fontID].family;
                button.className = "artimus-button artimus-font-button";
                button.style.fontFamily = fonts[fontID].family;

                button.onclick = () => {
                    if (resolve) resolve(fonts[fontID].family);
                    this._close();
                }

                innerList.appendChild(button);
            }
        }

        content.appendChild(innerList);
    }
});