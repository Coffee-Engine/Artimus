editor.languageMenu = (forced) => {
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
                    button.innerText = language.name;
                    button.className = "artimus-button language-button";

                    //When we click prepare the world for our arrival
                    button.onclick = () => {
                        fetch(`lang/${language.id}.json`).then(res => res.text()).then((text) => {
                            try {
                                const parsed = JSON.parse(text);
                                editor.language = parsed;
                                localStorage.setItem("language", text);
                                editor.refreshLanguage();

                                editor.startMenu.open();
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