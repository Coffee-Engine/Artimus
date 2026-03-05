editor.credits = {
    "ObviousAlexC": { icon: "https://avatars.githubusercontent.com/u/76855369", role: "leadDeveloper", website: "https://obviousstudios.dev" },
    "DerpyGamer2142": { icon: "https://avatars.githubusercontent.com/u/93667155", role: "addtionalFeatures", website: "https://derpygamer2142.com/" },
    "Äs Nödt": { icon: "https://m.gjcdn.net/user-avatar/200/5161034-crop346_0_1202_856-a9h5psbg-v4.webp", role: "translator", website: "https://youtu.be/wtb4z9IUY88", special: "Türkçe" },
    "Bamfyu": { icon: "https://m.gjcdn.net/user-avatar/200/5860051-crop221_0_1542_1321-zsi5byvu-v4.webp", role: "translator", website: "https://gamejolt.com/@bamfyu", special: "Deutsch" },
    "Myrixx": { icon: "https://m.gjcdn.net/user-avatar/200/5161034-crop346_0_1202_856-a9h5psbg-v4.webp", role: "translator", website: "https://gamejolt.com/@As_Nodt", special: "Deutsch" }
};

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

            icon.onerror = () => { icon.src = "site/images/credits/unknown.png"; }

            const divider = document.createElement("div");
            divider.className = "credit-divider";

            const name = document.createElement("p");
            name.className = "credit-text credit-username";

            const link = document.createElement("a");
            link.innerText = key;
            link.href = user.website;

            const role = document.createElement("p");
            role.className = "credit-text credit-role";
            role.innerText = artimus.translate(`credits.role.${user.role}`, "modal").replace("[SPECIAL]", user.special || "");

            name.appendChild(link)
            divider.appendChild(name);
            divider.appendChild(role);
            container.appendChild(icon);
            container.appendChild(divider);
            content.appendChild(container);
        }
    }, { width: 50, height: 30 })
}