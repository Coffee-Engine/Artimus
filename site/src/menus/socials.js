editor.creditsMenu = () => {
    new editor.modal(artimus.translate("socials.title", "modal"), (content, modal) => {
        const dServer = document.createElement("a");
        dServer.className = "socials-link";
        dServer.href = "https://discord.gg/R4AhDBNZZ7";

        const dImage = document.createElement("img");
        dImage.src = "site/images/socials/disk.png";
        const dText = document.createElement("p");
        dText.innerText = artimus.translate("socials.discordServer", "modal");

        dServer.appendChild(dImage);
        dServer.appendChild(dText);

        content.appendChild(dServer);
    });
}