editor.themes = {
    default: {
        "artimus-background-1": "#e2e2ff",
        "artimus-background-2": "#d0d0ff",
        "artimus-background-3": "#bbbbff",

        "artimus-button-normal": "#e2e2ff",
        "artimus-button-hover": "#c2c2ff",
        "artimus-button-click": "#438eff",
        "artimus-button-selected": "#aaaaff",

        "artimus-text": "#29053a",
        "artimus-icon": "#29053a",

        "artimus-selection-outline": "#438eff",

        "artimus-grid-1": "#bbbbff",
        "artimus-grid-2": "#7878a4",

        "artimus-eraser-outline": "#438eff",
        "artimus-eraser-inline": "#d0d0ff",
    },
    
    dark: {
        "artimus-background-1": "#414149",
        "artimus-background-2": "#26262c",
        "artimus-background-3": "#151518",

        "artimus-button-normal": "#454551",
        "artimus-button-hover": "#8989a0",
        "artimus-button-click": "#438eff",
        "artimus-button-selected": "#333362",

        "artimus-text": "#72aad3",
        "artimus-icon": "#72aad3",

        "artimus-selection-outline": "#438eff",

        "artimus-grid-1": "#3c3c5a",
        "artimus-grid-2": "#2a2a45",

        "artimus-eraser-outline": "#438eff",
        "artimus-eraser-inline": "#d0d0ff",
    }
}

//Custom theme code
//I found a really nice BG color at 221, 184, 245.
editor.useCustomTheme = () => {
    //Background
    const bgHSV = artimus.HexToHSV(editor.settings.customBackground);
    let sMove = (bgHSV.s < 0.5) ? 0.05 : -0.05; 
    let vMove = (bgHSV.v < 0.5) ? 0.05 : -0.05;

    document.body.style.setProperty("--artimus-background-1", editor.settings.customBackground);
    document.body.style.setProperty("--artimus-background-2", artimus.HSVToHex({h: bgHSV.h, s: bgHSV.s + sMove, v: bgHSV.v + vMove}));
    document.body.style.setProperty("--artimus-background-3", artimus.HSVToHex({h: bgHSV.h, s: bgHSV.s + (sMove * 2), v: bgHSV.v + (vMove * 2)}));

    document.body.style.setProperty("--artimus-grid-1", editor.settings.customGrid1);
    document.body.style.setProperty("--artimus-grid-2", editor.settings.customGrid2);
    if (editor.workspace) editor.workspace.refreshGridPattern();

    //Text and icons
    document.body.style.setProperty("--artimus-text", editor.settings.customText);
    if (editor.settings.iconsUseText) document.body.style.setProperty("--artimus-icon", editor.settings.customText);
    else document.body.style.setProperty("--artimus-icon", editor.settings.customIcon);

    //Tools
    document.body.style.setProperty("--artimus-eraser-inline", editor.settings.customEraserInline);
    if (editor.settings.toolsUseAccent) {
        document.body.style.setProperty("--artimus-selection-outline", editor.settings.customAccent);
        document.body.style.setProperty("--artimus-eraser-outline", editor.settings.customAccent);
    }
    else {
        document.body.style.setProperty("--artimus-selection-outline", editor.settings.customSelection);
        document.body.style.setProperty("--artimus-eraser-outline", editor.settings.customEraserOutline);
    }

    //Buttons
    const accentHSV = artimus.HexToHSV(editor.settings.customAccent);
    //The click is fairly universal being the accent
    document.body.style.setProperty("--artimus-button-click", editor.settings.customAccent);
    if (editor.settings.buttonsUseBackground) {
        document.body.style.setProperty("--artimus-button-normal", editor.settings.customBackground);

        //The hover and selection are interpolated between the background and accent;
        document.body.style.setProperty("--artimus-button-hover", artimus.HSVToHex({
            h: bgHSV.h + (accentHSV.h - bgHSV.h) * 0.25,
            s: bgHSV.s + (accentHSV.s - bgHSV.s) * 0.5,
            v: bgHSV.v + (accentHSV.v - bgHSV.v) * 0.2,
        }));
        document.body.style.setProperty("--artimus-button-selected", artimus.HSVToHex({
            h: bgHSV.h + (accentHSV.h - bgHSV.h) * 0.45,
            s: bgHSV.s + (accentHSV.s - bgHSV.s) * 0.65,
            v: bgHSV.v + (accentHSV.v - bgHSV.v) * 0.50,
        }));
    }
    else {
        const buttonHSV = artimus.HexToHSV(editor.settings.customButton);
        document.body.style.setProperty("--artimus-button-normal", editor.settings.customButton);

        //The hover and selection are interpolated between the button and accent;
        document.body.style.setProperty("--artimus-button-hover", artimus.HSVToHex({
            h: buttonHSV.h + (accentHSV.h - buttonHSV.h) * 0.25,
            s: buttonHSV.s + (accentHSV.s - buttonHSV.s) * 0.5,
            v: buttonHSV.v + (accentHSV.v - buttonHSV.v) * 0.2,
        }));
        document.body.style.setProperty("--artimus-button-selected", artimus.HSVToHex({
            h: buttonHSV.h + (accentHSV.h - buttonHSV.h) * 0.45,
            s: buttonHSV.s + (accentHSV.s - buttonHSV.s) * 0.65,
            v: buttonHSV.v + (accentHSV.v - buttonHSV.v) * 0.50,
        }));
    }
}