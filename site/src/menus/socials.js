editor.creditsMenu = () => {
    new editor.modal(artimus.translate("socials.title", "modal"), (content, modal) => {
        const addSocial = (type, url, icon) => {
            const dServer = document.createElement("a");
            dServer.className = "socials-container";
            dServer.href = url;

            const dImage = document.createElement("img");
            dImage.src = `site/images/socials/${icon}`;
            dImage.className = "socials-icon";

            const dText = document.createElement("p");
            dText.innerText = artimus.translate(`socials.${type}`, "modal");
            dText.className = "socials-link";

            dServer.appendChild(dImage);
            dServer.appendChild(dText);

            content.appendChild(dServer);
        }

        addSocial("discordServer", "https://discord.gg/R4AhDBNZZ7", "disk.png");
        addSocial("github", "https://github.com/Coffee-Engine", "git.png");
    }, { height: 20 });
}