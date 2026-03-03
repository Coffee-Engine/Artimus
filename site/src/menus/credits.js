editor.credits = {
    "ObviousAlexC": { icon: "https://avatars.githubusercontent.com/u/76855369", role: "Lead Developer", website: "https://obviousstudios.dev" },
    "DerpyGamer2142": { icon: "https://avatars.githubusercontent.com/u/93667155", role: "Additional Features", website: "https://derpygamer2142.com/"}
}

editor.creditsMenu = () => {
    new editor.modal(artimus.translate("credits.title", "modal"), (content, modal) => {
        content.className += " credits-menu";
        for (let key in editor.credits) {
            const user = editor.credits[key];

            const container = document.createElement("div");
            container.className = "credit-container";

            const icon = document.createElement("img");
            icon.className = "credit-icon";
            icon.src = user.icon;

            const divider = document.createElement("div");
            divider.className = "credit-divider";

            const name = document.createElement("p");
            name.className = "credit-text credit-username";

            const link = document.createElement("a");
            link.innerText = key;
            link.href = user.website;

            const role = document.createElement("p");
            role.className = "credit-text credit-role";
            role.innerText = user.role;

            name.appendChild(link)
            divider.appendChild(name);
            divider.appendChild(role);
            container.appendChild(icon);
            container.appendChild(divider);
            content.appendChild(container);
        }
    })
}