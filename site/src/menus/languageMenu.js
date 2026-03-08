editor.languageMenu = (forced, noStartMenu) => {
    new editor.modal("Artimus!", (content, modal) => {
        content.className += " language-modal";

        fetch("lang/list.json").then(res => res.text()).then(text => {            
            try {
                const list = JSON.parse(text);
                for (let idx in list) {
                    //Gather info
                    const language = list[idx];

                    //Create button
                    const button = document.createElement("button");
                    button.className = "artimus-button language-button";

                    //Create the icon
                    const icon = document.createElement("img");
                    icon.src = language.icon || `site/images/languages/${language.id}.png`;
                    icon.className = "language-icon";

                    const name = document.createElement("p");
                    name.innerText = language.name;
                    name.className = "language-name";

                    button.appendChild(icon);
                    button.appendChild(name);

                    //When we click prepare the world for our arrival
                    button.onclick = () => {
                        fetch(`lang/${language.id}.json`).then(res => res.text()).then((text) => {
                            try {
                                //Get data
                                const parsed = JSON.parse(text);
                                parsed.src = `lang/${language.id}.json`;
                                editor.language = parsed;

                                //Save and refresh
                                localStorage.setItem("language", JSON.stringify(parsed));
                                editor.refreshLanguage();

                                //Finally ready the editor
                                if (!noStartMenu) editor.startMenu.open();
                                modal.close();
                            } catch (error) { console.error(`Language ${language.id} isn't valid!\n===---===\n${error}\n===---===`) }
                        })
                    }

                    content.appendChild(button);
                }
            } catch (error) { console.error(`No valid language list found!\n===---===\n${error}\n===---===`) }
        });
    }, { height: 45, hasClose: !forced });
}