const devSelector = document.getElementById("devSelector");
const tools = {};
const downloadLink = document.createElement("a");

async function downloadDevFile(settings) {
    let script = await (await fetch(`../dist/artimus.js`)).text();
    for (let key in settings) {
        if (settings[key].file && settings[key].checked) {
            script += `\n//--\\\\    /dist/tools/${key}.js    //--\\\\\n`;
            script += await (await fetch(`../dist/tools/${key}.js`)).text();
        }
    }

    if (settings["styling"].checked) {
        const css = await (await fetch("../dist/default.css")).text();
        console.log(css.replaceAll("\n", "\\n"));
        script += `
\n//--\\\\    /dist/default.css //--\\\\\n
artimus.defaultStyleElement = document.createElement("style");
artimus.defaultStyleElement.innerHTML = \`${css.replaceAll("`","\\`")}\`;
document.head.appendChild(artimus.defaultStyleElement);
`
    }

    downloadLink.href = `data:text/plain;charset=utf-8,${encodeURIComponent(script.trim())}`;
    downloadLink.download = `Artimus_${Date.now()}.js`;
    downloadLink.click();
}

fetch("form.json").then(result => result.text()).then((text) => {
    const toolList = JSON.parse(text);
    const items = document.createElement("div");
    items.className = "checkboxOfLists";

    for (let i=0; i<toolList.length; i++) {
        const item = toolList[i];

        if (Array.isArray(item)) {
            const [ tool, name ] = item;

            const div = document.createElement("div");
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            
            div.className = "listCheckbox";

            label.innerText = name;
            checkbox.type = "checkbox";
            checkbox.checked = true;
            tools[tool] = checkbox;
            checkbox.file = (item[2] != false) && (item[2] != undefined);

            div.appendChild(checkbox);
            div.appendChild(label);

            items.appendChild(div);
        }
        else {
            const h4 = document.createElement("h4");
            h4.innerText = item;

            items.appendChild(h4);
        }
    }

    devSelector.appendChild(items);

    const submitButton = document.createElement("button");
    submitButton.innerText = "Download";

    submitButton.onclick = () => {
        downloadDevFile(tools);
    }

    devSelector.appendChild(submitButton);
});