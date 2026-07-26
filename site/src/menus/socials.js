editor.registerModal("socials", class extends editor.modal {
    addSocial(type, url, icon) {
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

        this.content.appendChild(dServer);
    }

    init(content, self) {
        this.title = artimus.translate("socials.title", "modal");
        this.height = 20;

        this.addSocial("discordServer", "https://discord.gg/R4AhDBNZZ7", "disk.png");
        this.addSocial("github", "https://github.com/Coffee-Engine", "git.png");
    }
});