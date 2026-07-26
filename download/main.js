const devSelector = document.getElementById("devSelector");
const devFileType = document.getElementById("fileType");
const tools = {};
const downloadLink = document.createElement("a");

const shrinkables = [
    ";", ",", "{", "(", ":"
];

async function downloadDevFile(settings) {
    let script = await (await fetch(`../dist/artimus.js`)).text();
    for (let key in settings) {
        if (settings[key].file && settings[key].checked) {
            script += `\n//--\\\\    /dist/tools/${key}.js    //--\\\\\n`;
            script += await (await fetch(`../dist/tools/${key}.js`)).text();
        }
    }
    
    //If we are a module transform the file into a module.
    let fileType = "js";
    if (devFileType.value == "module") {
        script.replace("window.artimus", "const artimus");
        script += "\n//Export artimus.\nexport default artimus;\n";
        fileType = "mjs";
    }
    
    //Make sure external values are included if the user wants them to be.
    if (settings["styling"].checked) {
        const css = await (await fetch("../dist/default.css")).text();
        //I'm going to scream at this stupid language.
        script += `
\n//--\\\\    /dist/default.css //--\\\\\n
artimus.defaultStyleElement = document.createElement("style");
artimus.defaultStyleElement.innerHTML = \`${css.replaceAll("`","\\`")}\`;
document.head.appendChild(artimus.defaultStyleElement);
`
    }

    if (settings["cugi"].checked) {
        script = `
\n//--\\\\    /site/lib/CUGI/CUGI.js   //--\\\\\n
${await (await fetch("../site/lib/CUGI/CUGI.js")).text()}
\n//--\\\\    Artimus   //--\\\\\n
${script}
`
    }

    //Then download.
    downloadLink.href = `data:text/plain;charset=utf-8,${encodeURIComponent(script.trim())}`;
    downloadLink.download = `Artimus_${Date.now()}.${fileType}`;
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