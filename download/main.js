const devSelector = document.getElementById("devSelector");
const tools = {};

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
});