//--\\    /site/lib/CUGI/CUGI.js   //--\\

(function() {
    const radianMagicNumber = (Math.PI/180);
    const degreeMagicNumber = (180/Math.PI);

    window.CUGI = {
        macros:{
            inputElement: (type, extra) => {
                //Create our inputElement
                const inputEl = document.createElement("input");
                inputEl.type = type;

                //If not an object then return the input element
                if (!(typeof extra == "object")) return inputEl;

                //If we have extra use extra
                Object.keys(extra).forEach(key => {
                    if (typeof extra[key] == "undefined") return;
                    inputEl[key] = extra[key];
                });

                return inputEl;
            },
            onchange: (data, input, value, passthrough) => {
                value = value || "value";
                return () => {
                    data.target[data.key] = (typeof passthrough == "function") ? passthrough(input[value]) : input[value];
                    if (data.onchange) data.onchange(data.target[data.key], data);
                }
            },

            radToDeg: rad => rad * degreeMagicNumber,

            degToRad: deg => deg * radianMagicNumber
        },

        //Custom Displays
        displays:{
            label: (data) => {
                const text = document.createElement("p");
                text.innerText = data.text || "No text";
                text.className = "CUGI-PropertyName CUGI-Label"

                return text;
            },
            header: (data) => {
                const text = document.createElement("h2");
                text.innerText = data.text || "No text";
                text.className = "CUGI-PropertyName CUGI-Header"

                return text;
            },
            subMenu: (data, parameters) => {
                //Create the container
                const container = document.createElement("div");
                container.className = "CUGI-PropertyHolder CUGI-SubMenu";

                if (!Array.isArray(data.items)) return container;
            
                //Add the sub CUGI
                container.appendChild(CUGI.createList(data.items, parameters));

                //Return
                return container;
            },
            button: (data) => {
                //Create the button
                const button = document.createElement('button');

                //Our button
                if (data.onclick) button.onclick = (event) => {data.onclick(button, event, data)};
                button.innerText = data.text || "No Text!";
                button.className = "CUGI-Button";

                return button;
            },
            link: (data) => {
                const link = document.createElement("a");
                link.innerText = data.text || "No text";
                link.href = data.link || "https://github.com/Coffee-Engine/CUGI";
                link.className = "CUGI-PropertyName CUGI-Label CUGI-Link"

                return link;

            }
        },

        //Now declare our types
        types:{
            float: (data) => {
                const { target, key } = data;

                //Create our input, make sure it is in degrees if its radians
                let value = Number(target[key]);
                if (data.isRadians) value = CUGI.macros.radToDeg(value);
                const input = CUGI.macros.inputElement("number", { 
                    value: value, 
                    className: `CUGI-Number CUGI-Float ${data.extraStyle}`,
                    min: data.min,
                    max: data.max,
                    step: data.step || 0.001,
                    size:2,
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                input.onchange = CUGI.macros.onchange(data, input, null, (value) => {
                    //Clamping
                    const initial = value;
                    if (data.min !== undefined) value = Math.max(data.min, value);
                    if (data.max !== undefined) value = Math.min(data.max, value);
                    if (initial != value) input.value = value;

                    if (data.isRadians) return CUGI.macros.degToRad(value);
                    return value;
                });
                
                if (data.min !== undefined) input.value = Math.max(data.min, input.value);
                if (data.max !== undefined) input.value = Math.min(data.max, input.value);

                return input;
            },

            slider: (data) => {
                const {target, key} = data;

                data.min = data.min || 0;
                data.max = (data.max !== undefined) ? data.max : 100;

                //Create our number input
                const containerDiv = document.createElement("div");
                containerDiv.className = "CUGI-PropertyHolder CUGI-SliderHolder";

                const numberInput = CUGI.types.float(data);
                const sliderInput = CUGI.macros.inputElement("range", {
                    value: Number(target[key]),
                    className: `CUGI-Slider ${data.extraStyle}`,
                    min: data.min,
                    max: data.max,
                    step: data.step || 0.05,
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                sliderInput.onchange = CUGI.macros.onchange(data, sliderInput);
                sliderInput.disabled = (typeof data.disabled == "function") ? data.disabled() : data.disabled;

                containerDiv.appendChild(numberInput);
                containerDiv.appendChild(sliderInput);

                //Link them
                numberInput.oninput = () => {
                    sliderInput.value = numberInput.value;
                }

                sliderInput.oninput = () => {
                    numberInput.value = sliderInput.value;
                }

                return containerDiv;
            },

            int: (data) => {
                const { target, key } = data;

                //Create our input
                const input = CUGI.macros.inputElement("number", { 
                    value: Number(target[key]), 
                    className: `CUGI-Number CUGI-Int ${data.extraStyle}`,
                    min: data.min,
                    max: data.max,
                    step: 1,
                    size:2,
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                input.onchange = CUGI.macros.onchange(data, input, null, (value) => {
                    //Clamping
                    const initial = value;
                    if (data.min !== undefined) value = Math.max(data.min, value);
                    if (data.max !== undefined) value = Math.min(data.max, value);
                    if (initial != value) input.value = value;

                    return Math.floor(value);
                });

                if (data.min !== undefined) input.value = Math.max(data.min, input.value);
                if (data.max !== undefined) input.value = Math.min(data.max, input.value);

                return input;
            },

            vec2: (data) => {
                const { target, key } = data;

                const containerDiv = document.createElement("div");
                containerDiv.className = "CUGI-PropertyHolder CUGI-Vec2";

                //Create our input
                const inputX = CUGI.types.float({...data, target: target[key], key: data.isArray ? 0 : "x", extraStyle:"CUGI-Vec2 CUGI-X"});
                const inputY = CUGI.types.float({...data, target: target[key], key: data.isArray ? 1 : "y", extraStyle:"CUGI-Vec2 CUGI-Y"});

                containerDiv.appendChild(inputX);
                containerDiv.appendChild(inputY);

                return containerDiv;
            },

            vec3: (data) => {
                const { target, key } = data;

                const containerDiv = document.createElement("div");
                containerDiv.className = "CUGI-PropertyHolder CUGI-Vec3";

                //Create our input
                const inputX = CUGI.types.float({...data, target: target[key], key: data.isArray ? 0 : "x", extraStyle:"CUGI-Vec3 CUGI-X"});
                const inputY = CUGI.types.float({...data, target: target[key], key: data.isArray ? 1 : "y", extraStyle:"CUGI-Vec3 CUGI-Y"});
                const inputZ = CUGI.types.float({...data, target: target[key], key: data.isArray ? 2 : "z", extraStyle:"CUGI-Vec3 CUGI-Z"});

                containerDiv.appendChild(inputX);
                containerDiv.appendChild(inputY);
                containerDiv.appendChild(inputZ);

                return containerDiv;
            },

            vec4: (data) => {
                const { target, key } = data;

                const containerDiv = document.createElement("div");
                containerDiv.className = "CUGI-PropertyHolder CUGI-Vec4";

                //Create our input
                const inputX = CUGI.types.float({...data, target: target[key], key: data.isArray ? 0 : "x", extraStyle:"CUGI-X"});
                const inputY = CUGI.types.float({...data, target: target[key], key: data.isArray ? 1 : "y", extraStyle:"CUGI-Y"});
                const inputZ = CUGI.types.float({...data, target: target[key], key: data.isArray ? 2 : "z", extraStyle:"CUGI-Z"});
                const inputW = CUGI.types.float({...data, target: target[key], key: data.isArray ? 3 : "w", extraStyle:"CUGI-W"});

                containerDiv.appendChild(inputX);
                containerDiv.appendChild(inputY);
                containerDiv.appendChild(inputZ);
                containerDiv.appendChild(inputW);

                return containerDiv;
            },

            string: (data) => {
                const { target, key } = data;

                const input = CUGI.macros.inputElement("text", {
                    value: String(target[key]),
                    className: "CUGI-String",
                    placeholder: data.placeholder,
                    minlength: Math.floor(data.min),
                    maxlength: Math.floor(data.max),
                    spellcheck: data.spellcheck,
                    size:10,
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                input.onchange = CUGI.macros.onchange(data, input);

                return input;
            },

            multiline: (data) => {
                const {target, key} = data;

                //Create our textarea
                const input = document.createElement("textarea");
                input.className = "CUGI-String CUGI-Multiline";

                //Configure it
                input.autocapitalize = data.autocapitalize || false;
                input.autocomplete = data.autocomplete || false;
                input.autocorrect = data.autocorrect || false;
                input.spellcheck = (typeof data.spellcheck != "undefined") ? data.spellcheck : true;
                input.disabled = (typeof data.disabled == "function") ? data.disabled() : data.disabled;

                input.rows = data.rows;
                input.columns = data.columns;

                if (data.min) input.minlength = Math.floor(data.min);
                if (data.max) input.maxlength = Math.floor(data.max);

                input.placeholder = data.placeholder || "";
                input.wrap = data.wrap || "off";

                input.value = target[key];

                //Add our onchange
                input.onchange = CUGI.macros.onchange(data, input);

                //return
                return input;
            },

            boolean: (data) => {
                const { target, key } = data;

                const input = CUGI.macros.inputElement("checkbox", {
                    checked: Boolean(target[key]),
                    className: "CUGI-Boolean",
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                input.onchange = CUGI.macros.onchange(data, input, "checked");

                return input;
            },
            
            color: (data) => {
                const { target, key } = data;

                const input = CUGI.macros.inputElement("color", {
                    value: String(target[key]),
                    className: "CUGI-Color",
                    disabled: (typeof data.disabled == "function") ? data.disabled() : data.disabled
                });

                input.onchange = CUGI.macros.onchange(data, input);

                return input;
            },

            dropdown: (data) => {
                const { target, key } = data;

                const input = document.createElement("select");
                input.className = "CUGI-Dropdown";

                //Parse out menu items
                if (data.items) {
                    let parsedItems = data.items;
                    if (typeof parsedItems == "function") parsedItems = parsedItems(data);

                    //Make sure we have an array
                    if (Array.isArray(parsedItems)) parsedItems.forEach(item => {
                        const option = document.createElement("option");

                        switch (typeof item) {
                            //Handle strings
                            case "string":
                                option.innerText = item;
                                option.value = item;
                                break;

                            //Handle objects and arrays
                            case "object":
                                if (Array.isArray(item)) {
                                    option.innerText = item[0];
                                    option.value = item[1];
                                }
                                else {
                                    option.innerText = item.text;
                                    option.value = item.value;
                                }
                                break;
                        
                            default:
                                option.innerText = "Not set!";
                                option.value = "";
                                break;
                        }

                        input.appendChild(option);
                    });
                }
                
                //Yeah
                input.value = target[key] || input.children[0].value;

                input.onchange = CUGI.macros.onchange(data, input);

                return input;
            },

            date: (data) => {
                const { target, key } = data;

                const input = CUGI.macros.inputElement((data.includeTime) ? "datetime-local" : "date", {
                    value: String(target[key])
                });

                input.onchange = CUGI.macros.onchange(data, input);

                return input;
            },

            time: (data) => {
                const { target, key } = data;

                const input = CUGI.macros.inputElement("time", {
                    value: String(target[key])
                });

                input.onchange = CUGI.macros.onchange(data, input);

                return input;
            }
        },

        createList: (items, parameters) => {
            const container = document.createElement("div");

            const {globalChange, preprocess} = parameters || {};
            
            if (Array.isArray(items)) {
                items.forEach(item => {
                    //Make sure the item is an object
                    if (typeof item == "string") {
                        const propertyHolder = document.createElement("div");
                        propertyHolder.className = "CUGI-PropertyHolder";

                        propertyHolder.appendChild(CUGI.displays.label({ text:(item === "---") ? " " : item }));

                        container.appendChild(propertyHolder);
                        return;
                    }

                    if (typeof item != "object") return;

                    //Make sure we have a type
                    if (!item.type) return;

                    if (preprocess) {
                        item = preprocess({...item});
                    }

                    //If we have an globalChange add that
                    if (item.onchange && globalChange) {
                        const oldChange = item.onchange;
                        item.onchange = (value, data) => {
                            oldChange(value, data);
                            globalChange(value, data);
                        }
                    }
                    else if (globalChange) {
                        item.onchange = globalChange;
                    }

                    //Displays are just static most of the time
                    if (CUGI.displays[item.type]) {
                        const propertyHolder = document.createElement("div");
                        propertyHolder.className = "CUGI-PropertyHolder CUGI-DisplayHolder";

                        //Add our display
                        propertyHolder.appendChild(CUGI.displays[item.type]({
                            //Our items
                            ...item, 
                            
                            //Our selection refresher
                            refreshSelection:() => {
                                //Refresh it
                                container.parentElement.insertBefore(CUGI.createList(items, parameters), container);
                                container.parentElement.removeChild(container);
                                container.innerHTML = "";
                            }
                        }, 
                        parameters));

                        container.appendChild(propertyHolder);
                        return;
                    }

                    //Make sure item target and key exist
                    if (!(item.target && item.key)) return;
                    
                    //Also make sure it's type exists
                    if (!CUGI.types[item.type]) return;

                    //Then assemble
                    const propertyHolder = document.createElement("div");
                    propertyHolder.className = "CUGI-PropertyHolder";

                    const label = document.createElement("p");
                    label.className = "CUGI-PropertyName";
                    label.innerText = item.text || item.key;

                    //Add our input
                    const input = CUGI.types[item.type]({
                        //Our items
                        ...item, 
                        
                        //Our selection refresher
                        refreshSelection:() => {
                            //Refresh it
                            container.parentElement.insertBefore(CUGI.createList(items, parameters), container);
                            container.parentElement.removeChild(container);
                            container.innerHTML = "";
                        }
                    }, 
                    parameters);

                    propertyHolder.appendChild(label);
                    propertyHolder.appendChild(input);

                    container.appendChild(propertyHolder);
                });
            }

            return container;
        },

        createPopup: (items, parameters, x, y) => {
            const container = CUGI.createList(items, parameters);
            container.className = "CUGI-Popup";

            document.body.appendChild(container);

            let { width, height, padding } = getComputedStyle(container);
            width = Number(width.replaceAll(/[a-zA-Z]/g, ""));
            height = Number(height.replaceAll(/[a-zA-Z]/g, ""));
            padding = Number(padding.replaceAll(/[a-zA-Z]/g, ""));

            //If we are offscreen on either side flip
            if (x + (width + padding * 2) > window.innerWidth) container.style.setProperty("--x", `${x - (width + padding * 2)}px`);
            else container.style.setProperty("--x", `${x}px`);

            if (y + (height + padding * 2) > window.innerHeight) container.style.setProperty("--y", `${y - (height + padding * 2)}px`);
            else container.style.setProperty("--y", `${y}px`);


            return {
                container: container,
                close: () => {
                    container.parentElement.removeChild(container);
                },
                justOpened: true
            }
        },

        dropdownClass: class extends HTMLElement {
            static observedAttributes = ["func", "preprocess"];

            constructor() {
                super();

                //remove odd spacing
                for (let nodeID in this.childNodes) {
                    const node = this.childNodes[nodeID];
                    if (node instanceof Text) node.data = node.data.trim();
                }

                //Get this ready and steaming
                this.addEventListener("click", () => {
                    const bounds = this.getClientRects()[0];
                    let script = "";
                    
                    //Loop through children to get options
                    for (let childID in this.children) {
                        const child = this.children[childID];
                        if (child.nodeName == "CUGI-OPTION") {
                            //From G4G
                            const optionData = child.innerHTML.replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'");

                            if (childID == 0) script += optionData;
                            else script += `,${optionData}`;
                        }
                    }

                    script = `[${script}]`;
                    if (this.hasAttribute("func")) script += `.concat(${this.getAttribute("func")}())`;

                    if (CUGI.currentPopup) {
                        CUGI.currentPopup.close();
                        CUGI.currentPopup = null;
                    }

                    if (this.hasAttribute("preprocess")) CUGI.currentPopup = CUGI.createPopup(eval(script), { preprocess: eval(this.getAttribute("preprocess")) }, bounds.left, bounds.top);
                    else CUGI.currentPopup = CUGI.createPopup(eval(script), {}, bounds.left, bounds.top);
                });
            }
        },

        optionClass: class extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.style.visibility = "hidden";
                this.style.fontSize = "0px";
            }
        },

        dropDownCloseExceptions: [
            HTMLInputElement,
            HTMLSelectElement,
            HTMLOptionElement,
            HTMLTextAreaElement
        ]
    }

    customElements.define("cugi-dropdown", CUGI.dropdownClass);
    customElements.define("cugi-option", CUGI.optionClass);

    document.addEventListener("click", event => {
        //Make an exception for various elements
        if (CUGI.dropDownCloseExceptions.includes(event.target.constructor)
        ) return;

        if (CUGI.currentPopup) {
            if (CUGI.currentPopup.justOpened) {
                CUGI.currentPopup.justOpened = false;
                return;
            }

            CUGI.currentPopup.close();
            CUGI.currentPopup = null;
        }
    });

    document.addEventListener("contextmenu", event => {
        if (event.target && event.target.CUGI_CONTEXT) {
            event.preventDefault();
            event.stopPropagation();

            if (CUGI.currentPopup) {
                CUGI.currentPopup.close();
                CUGI.currentPopup = null;
            }

            CUGI.currentPopup = CUGI.createPopup(event.target.CUGI_CONTEXT(), {
                preprocess: event.target.CUGI_PREPROCESS
            }, event.clientX, event.clientY);
            CUGI.currentPopup.justOpened = false;
        }
    });
})();


//--\\    Artimus   //--\\

window.artimus = {
    //Just a small performance thing to prevent un-needed function alls while copying
    clipboardMagic: "H_ARTIMUS",
    magic: Array.from("COFE", char => String(char).charCodeAt(0)),
    jsonMagic: Array.from("JSON", char => String(char).charCodeAt(0)),

    hexArray: [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ],

    windRule: "evenodd",
    pickType: "layer",
    preferGreaterAxis: true,

    //For and pasting
    preferredMoveTool: "move",
    preferredPasteLayer: "new",

    //I probably need to make a better solution for replacing and modifying these? Maybe some build script?
    defaultArrow: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="67.79628" height="19.99114" viewBox="0,0,67.79628,19.99114"><g transform="translate(-206.10043,-170.79353)"><g fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-miterlimit="10"><path d="M272.39671,189.28467c-0.45144,-8.7306 -24.09936,-17.06276 -32.46692,-16.99068c-7.9521,0.06851 -31.96292,7.81916 -32.32935,16.92539c-0.00186,0.04618 16.25066,-3.22684 32.24773,-3.1737c16.40198,0.05449 32.55854,3.43226 32.54855,3.23898z" /></g></g></svg>`,
    hideIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="58" height="58" viewBox="0,0,58,58"><g transform="translate(-211,-151)"><g stroke-miterlimit="10"><path d="M264.91616,181.7c4.38014,-2.9052 -6.38446,-0.74738 -11.43352,-3.76823c-5.30721,-3.1753 -9.39066,-8.63177 -13.65934,-8.63177c-4.09095,0 -13.12294,0.85076 -18.29409,3.81852c-5.61379,3.2218 -8.36188,5.26545 -7.21305,8.58148c2.92024,8.42912 16.07033,9 24.10714,9c8.76638,0 17.33691,-2.92717 26.49286,-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M250.4,180c0,-2.33846 -2.78686,-4.29491 -4.11265,-6.02382c-1.89933,-2.47682 -2.90475,-4.27618 -6.28735,-4.27618c-5.74376,0 -10.4,4.61147 -10.4,10.3c0,5.68853 4.65624,10.3 10.4,10.3c5.74376,0 10.4,-4.61147 10.4,-10.3z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="butt"/><path d="M211,209v-58h58v58z" fill="none" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,

    unknownToolIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="101.93117" height="101.93117" viewBox="0,0,101.93117,101.93117"><g transform="translate(-189.03441,-129.03441)"><g stroke="none" stroke-miterlimit="10"><path d="M225.95401,214.66685c0.89084,-3.66761 4.59572,-6.71311 8.27507,-6.80231c3.67935,-0.0892 5.9399,2.81169 5.04906,6.4793c-0.89084,3.66761 -4.59572,6.71311 -8.27507,6.80231c-3.67935,0.0892 -5.9399,-2.81169 -5.04906,-6.4793z" fill="currentColor" stroke-width="0"/><path d="M241.24709,198.30435c-0.80849,3.32859 -4.17091,6.09258 -7.51016,6.17353c-5.9079,-0.17749 -4.79982,-3.31275 -4.81767,-3.59652c-0.36844,-5.85805 1.48435,-14.51241 3.67817,-20.14809c2.76599,-7.10553 10.14553,-6.79158 15.72967,-8.2536c6.70318,-1.755 9.08711,-21.20805 -2.06731,-20.97545c-2.8163,0.05873 -12.46331,-0.84184 -15.95506,3.41385c-3.66442,4.46614 -5.86484,18.49888 -12.8902,18.95622c-7.40501,0.48206 -4.17815,-7.82231 -3.07453,-12.08808c2.3903,-9.23905 9.99144,-17.09308 19.20257,-20.64455c11.191,-4.31483 29.64094,-2.97729 32.84812,7.85829c1.30777,4.41835 1.11645,9.37421 0.10936,14.38396c-2.70576,13.45983 -11.1629,17.9317 -16.37594,20.25907c-1.03336,0.46134 -7.30035,1.64794 -8.13776,3.20032c-1.37081,2.5412 -0.6219,10.97781 -0.73928,11.46105z" fill="currentColor" stroke-width="0.5"/><path d="M189.03441,230.96559v-101.93117h101.93117v101.93117z" fill="none" stroke-width="0"/></g></g></svg><!--rotationCenter:50.96558700509328:50.965587005093255-->`,
    toolIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70.5" height="70.5" viewBox="0,0,70.5,70.5"> <g transform="translate(-204.75002,-144.75)">    <g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal">        <path d="M204.75003,215.25v-70.5h70.5v70.5z" fill="none" stroke-width="0"/>        <path d="M220.9868,205.17696c1.77179,-0.89842 3.45323,-2.83003 3.92284,-4.18449c0.48941,-2.20805 2.09187,-5.70927 4.03585,-6.94886c1.41138,-1.79045 6.7982,-2.72387 8.25105,-0.51354c3.63129,2.41038 4.42564,4.90457 4.65906,6.97496c0.87449,2.30301 -2.19833,6.25534 -4.02505,7.55363c-2.70649,1.77061 -6.09868,1.76254 -9.25182,2.13584c-3.36677,0.39859 -5.03047,-0.4888 -7.98273,-1.41774c-0.53432,-0.4212 -3.55958,-2.15572 -3.34232,-2.965c0.23096,-0.8603 2.73102,-0.52502 3.38089,-0.60196l0.28441,-0.03367c0,0 0.02808,-0.00332 0.06782,0.00082z" fill="currentColor" stroke-width="0.5"/>        <path d="M254.7307,185.57527c-5.41655,12.21861 -8.83657,10.44178 -13.17454,8.51874c-4.33797,-1.92303 -7.95119,-3.26405 -2.53464,-15.48266c5.41655,-12.21861 17.81172,-30.68787 22.14969,-28.76483c4.33797,1.92304 -1.02396,23.51014 -6.4405,35.72876z" fill="currentColor" stroke-width="0"/></g></g></svg><!--rotationCenter:35.249975000000006:35.25000499999999-->`,
    propertiesIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70.5" height="70.5" viewBox="0,0,70.5,70.5"><g transform="translate(-204.75001,-144.75)"><g stroke="none" stroke-width="0" stroke-miterlimit="10"><path d="M204.75001,215.25v-70.5h70.5v70.5z" fill="none"/><path d="M220.30727,180c0,-10.876 8.81673,-19.69273 19.69274,-19.69273c10.876,0 19.69274,8.81673 19.69274,19.69274c0,10.876 -8.81674,19.69274 -19.69274,19.69274c-10.876,0 -19.69273,-8.81673 -19.69273,-19.69273zM239.5721,191.93641c6.2132,0 11.25,-5.0368 11.25,-11.25c0,-6.2132 -5.0368,-11.25 -11.25,-11.25c-6.2132,0 -11.25,5.0368 -11.25,11.25c0,6.2132 5.0368,11.25 11.25,11.25z" fill="currentColor"/><path d="M266.32682,174.76257v10.47486h-16.46326c0.61623,-1.39146 0.95854,-2.93126 0.95854,-4.55102c0,-2.1737 -0.61649,-4.20342 -1.68416,-5.92384z" fill="currentColor"/><path d="M213.67319,185.23743v-10.47486h16.33307c-1.06767,1.72042 -1.68416,3.75014 -1.68416,5.92384c0,1.61976 0.34231,3.15956 0.95854,4.55102z" fill="currentColor"/><path d="M254.91245,157.68071l7.40684,7.40684l-12.06382,12.06382c-1.15757,-3.50021 -3.98726,-6.23919 -7.54291,-7.27077z" fill="currentColor"/><path d="M225.08755,202.31929l-7.40684,-7.40684l11.08557,-11.08557c1.03158,3.55565 3.77056,6.38534 7.27077,7.54291z" fill="currentColor"/><path d="M234.76257,153.67319h10.47486l0,17.29172c-1.66381,-0.9717 -3.59955,-1.52849 -5.66533,-1.52849c-1.72074,0 -3.35125,0.38633 -4.80953,1.07698z" fill="currentColor"/><path d="M245.23743,206.32681h-10.47486l0,-15.46738c1.45828,0.69065 3.08879,1.07698 4.80953,1.07698c2.06579,0 4.00153,-0.55679 5.66533,-1.52849z" fill="currentColor"/><path d="M217.68071,165.08756l7.40684,-7.40684l12.0253,12.0253c-3.65263,0.81448 -6.63562,3.40493 -7.99565,6.81804z" fill="currentColor"/><path d="M262.31929,194.91244l-7.40684,7.40684l-11.17799,-11.17799c3.4131,-1.36003 6.00356,-4.34302 6.81804,-7.99565z" fill="currentColor"/></g></g></svg>`,
    layerIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="66.48045" height="66.48045" viewBox="0,0,66.48045,66.48045"><g transform="translate(-206.75978,-146.75978)"><g stroke-miterlimit="10"><path d="M213.21429,179.5871h53.57143" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M213.21429,167.4753h3.35793" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M233.91977,167.4753h8.04121" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M260.59712,167.4753h6.18859" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M213.21429,191.38834h29.85166" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M258.87232,191.38834h7.91339" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><g><path d="M225.22727,172.35537v-9.60744" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M219.33884,164.71074l5.88843,-10.02066l5.88843,10.02066z" fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="butt"/></g><g><path d="M250.95041,187.64463v9.60744" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M256.83884,195.28926l-5.88843,10.02066l-5.88843,-10.02066z" fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="butt"/></g><path d="M206.75978,213.24022v-66.48045h66.48045v66.48045z" fill="none" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,

    exportCanvas: document.createElement("canvas"),

    degreeToRad: (deg) => (deg * (3.1415962 / 180)),
    radToDegree: (rad) => (rad * (180 / 3.1415962)),

    //DOM sanitizer
    DOMParser: new DOMParser(),
    
    //Just in case.
    badElements: [
        "script",
        "foreignobject",
        "style",
        "link",
        "iframe",
        "embed",
        "title"
    ],

    sanitizeDOM: (svg) => {
        //Make sure the DOM is valid;
        let DOM = artimus.DOMParser.parseFromString(`<elementalSanitizer>${svg}</elementalSanitizer>`, "application/xml");
        if (DOM.documentElement.tagName == "parsererror") return "<p>Invalid DOM</p>";

        //Search through children, and give the final result
        const children = [...DOM.querySelectorAll("*")];
        for (let childID = 0; childID < children.length; childID++) {
            const child = children[childID];
            if (artimus.badElements.includes(child.tagName.toLowerCase())) child.parentElement.removeChild(child);

            //Search through attributes
            const names = child.getAttributeNames();
            for (let attributeID = 0; attributeID < names.length; attributeID++) {
                const attribute = names[attributeID];

                //If possibly an event
                if (attribute.startsWith("on")) child.removeAttribute(attribute);
                //If we have any odd values, like a "javascript:" uri
                else {
                    const data = child.getAttribute(attribute);
                    if (data.startsWith("javascript:")) child.removeAttribute(attribute);
                }
            }
        }

        //Return the final sanitized HTML
        return DOM.documentElement.innerHTML;
    },

    //Host/Parasite relationship
    host: document.createElement("div"),

    elementFromString: (element) => {
        artimus.host.innerHTML = artimus.sanitizeDOM(element);

        //Remove the parasite
        const parasite = artimus.host.children[0];
        artimus.host.removeChild(parasite);
        return parasite;
    },

    getCSSVariable: (variable) => {
        return getComputedStyle(document.body).getPropertyValue(`--artimus-${variable}`);
    },

    iRandRange: (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    BrightestChannel: (Color) => {
        if (typeof Color == "string") {
            const split = artimus.HexToRGB(Color);

            let brightest = split.r;

            if (brightest < split.g) {
                brightest = split.g;
            }
            if (brightest < split.b) {
                brightest = split.b;
            }

            return brightest;
        }

        let brightest = Color.r;

        if (brightest < Color.g) {
            brightest = Color.g;
        }
        if (brightest < Color.b) {
            brightest = Color.b;
        }

        return brightest;
    },

    DarkestChannel: (Color) => {
        if (typeof Color == "string") {
            const split = artimus.HexToRGB(Color);

            let brightest = split.r;

            if (brightest > split.g) {
                brightest = split.g;
            }
            if (brightest > split.b) {
                brightest = split.b;
            }

            return brightest;
        }

        let brightest = Color.r;

        if (brightest > Color.g) {
            brightest = Color.g;
        }
        if (brightest > Color.b) {
            brightest = Color.b;
        }

        return brightest;
    },

    HexToRGB: (Hex) => {
        if (typeof Hex === "string") {
            Hex = Hex.trim();

            if (Hex.length > 7) {
                const splitHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Hex) || [0,0,0,255];
                return {
                    r: parseInt(splitHex[1], 16),
                    g: parseInt(splitHex[2], 16),
                    b: parseInt(splitHex[3], 16),
                    a: parseInt(splitHex[4], 16),
                };
            } else if (Hex.length > 5) {
                const splitHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Hex);
                return {
                    r: parseInt(splitHex[1], 16),
                    g: parseInt(splitHex[2], 16),
                    b: parseInt(splitHex[3], 16),
                    a: 255,
                };
            } else {
                const splitHex = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(Hex);
                return {
                    r: parseInt(splitHex[1], 16),
                    g: parseInt(splitHex[2], 16),
                    b: parseInt(splitHex[3], 16),
                    a: 255,
                };
            }
        }

        return {
            r: Math.floor(Hex / 65536),
            g: Math.floor(Hex / 256) % 256,
            b: Hex % 256,
            a: 255,
        };
    },

    RGBToHex: (RGB) => {
        let hexR = Math.floor(RGB.r).toString(16);
        let hexG = Math.floor(RGB.g).toString(16);
        let hexB = Math.floor(RGB.b).toString(16);

        if (hexR.length == 1) hexR = "0" + hexR;
        if (hexG.length == 1) hexG = "0" + hexG;
        if (hexB.length == 1) hexB = "0" + hexB;

        //Transparency
        if (typeof RGB.a == "number") {
            let hexA = Math.floor(RGB.a).toString(16);
            if (hexA.length == 1) hexA = "0" + hexA;

            return `#${hexR}${hexG}${hexB}${hexA.toLowerCase() == "ff" ? "" : hexA}`;
        }

        return `#${hexR}${hexG}${hexB}`;
    },

    RGBToHSV: (RGB) => {
        //Divide the RGB by 255
        RGB.r /= 255;
        RGB.g /= 255;
        RGB.b /= 255;

        //Get the brightest and darkest channels
        const CMax = artimus.BrightestChannel(RGB);
        const CMin = artimus.DarkestChannel(RGB);

        const Delta = CMax - CMin;

        let H = 0;

        //Multiply and get the Hue
        if (CMax == RGB.r) {
            H = 60 * (((RGB.g - RGB.b) / Delta) % 6);
        }
        if (CMax == RGB.g) {
            H = 60 * ((RGB.b - RGB.r) / Delta + 2);
        }
        if (CMax == RGB.b) {
            H = 60 * ((RGB.r - RGB.g) / Delta + 4);
        }

        //Set the saturation
        let S = 0;
        if (CMax != 0) {
            S = Delta / CMax;
        }

        //Make sure the hue isn't NaN
        if (isNaN(H)) {
            H = 0;
        }

        //Revert & Return
        RGB.r *= 255;
        RGB.g *= 255;
        RGB.b *= 255;

        if (H < 0) H += 360;

        return {
            h: H,
            s: S,
            v: CMax,
            a: RGB.a,
        };
    },

    HSVToRGB: (HSV) => {
        const h = HSV.h;

        //Some math to get C and X
        const C = HSV.v * HSV.s;
        const X = C * (1 - Math.abs(((h / 60) % 2) - 1));

        const m = HSV.v - C;

        //Make our returned objects
        const RGB = { r: 0, g: 0, b: 0 };

        //And the if statements
        if (0 <= h && h < 60) {
            RGB.r = C;
            RGB.g = X;
        } else if (60 <= h && h < 120) {
            RGB.r = X;
            RGB.g = C;
        } else if (120 <= h && h < 180) {
            RGB.g = C;
            RGB.b = X;
        } else if (180 <= h && h < 240) {
            RGB.g = X;
            RGB.b = C;
        } else if (240 <= h && h < 300) {
            RGB.b = C;
            RGB.r = X;
        } else if (300 <= h && h < 360) {
            RGB.b = X;
            RGB.r = C;
        }

        //Then convert
        RGB.r = (RGB.r + m) * 255;
        RGB.g = (RGB.g + m) * 255;
        RGB.b = (RGB.b + m) * 255;
        RGB.a = HSV.a;

        return RGB;
    },

    HSVToHex: (HSV) => {
        return artimus.RGBToHex(artimus.HSVToRGB(HSV));
    },

    HexToHSV: (Hex) => {
        return artimus.RGBToHSV(artimus.HexToRGB(Hex));
    },

    translate: (item, context) => {
        return item;
    },

    fontPopup: (workspace) => {
        return new Promise((resolve) => { resolve("Monospace") });
    },

    //Should probably make a default one but for now this works.
    layerPropertyMenu: (workspace, layer) => {},

    //Other stuff
    extensionToMIME: {
        "png": "image/png",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",

        //Eww
        "webp": "image/webp",
    },

    lossyFormats: [ "jpeg", "jpg", "webp" ],

    resizeAnchors: {
        TOP_LEFT: [0, 0],
        TOP_MIDDLE: [0.5, 0],
        TOP_RIGHT: [1, 0],
        MIDDLE_LEFT: [0, 0.5],
        MIDDLE: [0.5, 0.5],
        MIDDLE_RIGHT: [1, 0.5],
        BOTTOM_LEFT: [0, 1],
        BOTTOM_MIDDLE: [0.5, 1],
        BOTTOM_RIGHT: [1, 1],
    },

    resizeModes: [
        "anchored",
        "crop"
    ],

    //Mostly used in saving but can be used for other purposes, like making a list of global composite operations
    blendModes: [
        "source-over",
        "source-in",
        "source-out",
        "source-atop",
        "lighter",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
        "destination-over",
        "destination-in",
        "destination-out",
        "destination-atop",
        "copy",
        "xor",
    ],

    //Default hotkey settings, unfocusedHotkeys makes hotkeys a non-focus exclusive feature.
    unfocusedHotkeys: false,
    hotkeys: {
        "ctrl+z": "undo",
        "ctrl+shift+z": "redo",
        "ctrl+c": "copy",
        "ctrl+v": "paste",
        "c": "clearSelection",
    },

    modifierKeys: [
        "control",
        "shift",
        "meta",
        "alt",
        "+"
    ],

    tools: {},
    tool: class {
        get icon() { return artimus.unknownToolIcon; }

        constructor(workspace, context) { this.workspace = workspace; }

        get shiftHeld() { return this.workspace.shiftHeld; }

        name = null;

        mouseDown(gl, x, y, toolProperties) {}
        mouseMove(gl, x, y, vx, vy, toolProperties) {}
        mouseUp(gl, x, y, toolProperties) {}

        keyPressed(gl, event, toolProperties) {}
        keyReleased(gl, event, toolProperties) {}

        preview(gl, x, y, toolProperties) {}
        
        selected(gl, previewGL, toolProperties) {}
        deselected(gl, previewGL, toolProperties) {}

        undo(gl, previewGL, toolProperties) {}
        redo(gl, previewGL, toolProperties) {}

        paste(gl, previewGL, bitmap, sizeMultiplier) {}

        CUGI() { return [] }

        inSelection(gl, x, y) {
            if (this.workspace.hasSelection > 0) return gl.isPointInPath(this.workspace.selectionPath, x + 0.5, y + 0.5, artimus.windRule);
            else return true;
        }

        properties = {};
        colorProperties = [];
        constructive = true;
    },

    //History is important, and it's finally getting some TLC
    maxHistory: 10,
    historicalEventTypes: {
        "imageChange": (workspace, data) => {
            console.log(data);
        }
    },

    historicalEvent: class {
        constructor(type, data, workspace) {
            this.type = type;
            this.data = data;
            this.workspace = workspace;
        }

        restoreTo() {
            artimus.historicalEventTypes[this.type](this.workspace, this.data);
        }
    },
    
    layer: class {
        blendMode = "source-over";
        alpha = 1;
        bitmap = null;
        visibility = true;

        get data() {
            if (this.dataRaw) return this.dataRaw.data;
            else return new Uint8Array(4);
        }

        get width() {
            if (this.dataRaw) return this.dataRaw.width;
            else return 1;
        }

        get height() {
            if (this.dataRaw) return this.dataRaw.height;
            else return 1;
        }

        constructor(width, height, name, workspace, noSwitch) {
            //Create internal image data
            this.dataRaw = new ImageData(width, height);
            
            this.workspace = workspace;
            this.name = name || `${artimus.translate("layer#", "layer").replace("#", this.layers.length + 1)}`;

            //Do a thing, guaranteed to not exist (hopefully)
            const preferredName = name;
            if (this.workspace.layerExists(name)) {
                let num = 1;
                name = (`${artimus.translate("incrementalName", "layer").replace("#", num).replace("[NAME]", preferredName)}`);
                
                //Find one that doesn't exist.
                while (this.workspace.layerExists(name)) {
                    num++;
                    name = (`${artimus.translate("incrementalName", "layer").replace("#", num).replace("[NAME]", preferredName)}`);
                }

                this.name = name;
            }

            
            this.element = this.workspace._createLayerElement(this);

            this.workspace.layers.push(this);
            this.workspace.layerList.appendChild(this.element);

            this.element.positionID = this.workspace.layers.length - 1;

            //Finally use the new layer
            if (!noSwitch) this.workspace.setLayer(name);
        }

        updateBitmap() {
            if (this.bitmap) this.bitmap.close();

            return new Promise((resolve, reject) => createImageBitmap(this.dataRaw).then(bitmap => {
                this.bitmap = bitmap;
                resolve(bitmap);
            }));
        }

        dispose(ID) {            
            //Clean up clean up!
            this.element.parentElement.removeChild(this.element);
            this.workspace.layers.splice(ID, 1);

            if (this.bitmap) this.bitmap.close();
            delete this;
        }

        rename(name) {
            if (name == this.name) return;

            //Check for any other layers named this.
            const nameAvailable = this.workspace.layers.findIndex((layer) => layer.name == name) == -1;
            if (nameAvailable) {
                this.name = name;
                if (this.element) this.element.targetLayer = name;
                if (this.label) this.label.innerText = name;
            }
        }

        resizeByRect(active, rx, ry, width, height, editingData) {
            const layer = (active) ? editingData : this;
            if (width == layer.width && height == layer.height) return;

            //Get needed attributes for the transfer
            const output = new ImageData(width, height);

            //Transfer data
            for (let y = 0; y < layer.height; y++) {
                for (let x = 0; x < layer.width; x++) {
                    //Then get the position
                    if (x < 0 || y < 0 || x >= width || y >= height) continue;

                    //Now we do the stuff we need to
                    const lID = (((ry + y) * layer.width) + (rx + x)) * 4;
                    const oID = ((y * output.width) + x) * 4;

                    output.data[oID] = layer.data[lID];
                    output.data[oID + 1] = layer.data[lID + 1];
                    output.data[oID + 2] = layer.data[lID + 2];
                    output.data[oID + 3] = layer.data[lID + 3];
                }
            }
            
            //Blit image data to editing canvas if needed
            if (active) {
                this.workspace.editGL.putImageData(output, 0, 0);
            }

            this.dataRaw = output;
            this.updateBitmap();
        }

        resizeByAnchor(active, anchor, width, height, editingData) {
            const layer = (active) ? editingData : this;
            if (width == layer.width && height == layer.height) return;

            //Get needed attributes for the transfer
            const output = new ImageData(width, height);

            const writeOffsetX = Math.floor((anchor[0] * width) - (anchor[0] * layer.width));
            const writeOffsetY = Math.floor((anchor[1] * height) - (anchor[1] * layer.height));

            //Transfer data
            for (let y = 0; y < layer.height; y++) {
                for (let x = 0; x < layer.width; x++) {
                    //Pointer stuffs
                    const pointerX = writeOffsetX + x;
                    const pointerY = writeOffsetY + y;

                    //Then get the position
                    if (pointerX < 0 || pointerY < 0 || pointerX >= width || pointerY >= height) continue;

                    //Now we do the stuff we need to
                    const lID = ((y * layer.width) + x) * 4;
                    const oID = ((pointerY * output.width) + pointerX) * 4;
                    output.data[oID] = layer.data[lID];
                    output.data[oID + 1] = layer.data[lID + 1];
                    output.data[oID + 2] = layer.data[lID + 2];
                    output.data[oID + 3] = layer.data[lID + 3];
                }
            }
            
            //Blit image data to editing canvas if needed
            if (active) {
                this.workspace.editGL.putImageData(output, 0, 0);
            }

            this.dataRaw = output;
            this.updateBitmap();
        }
    },

    workspace: class {
        events = [
            "redraw",
            "tick",
            "import",
            "importLocal",
            "export",
            "exportLocal",
            "new",
            "undo",
            "redo",
            "copy",
            "paste",
            "layerCreated",
            "layerRemoved",
            "layerSwitched",
            "layerRenamed",
            "resized",
            "toolsRefreshed",
            "toolSwitched",
            "tabSwitched",
            "selected",
            "selectionCleared",
        ];
        listeners = {};

        addEventListener(event, callback) {
            //Add the callback
            if (this.events.includes(event)) {
                if (!this.listeners[event]) this.listeners[event] = [];
                this.listeners[event].push(callback);
            }
        }

        sendEvent(event, data) {
            //Make sure the event list exists
            if (Array.isArray(this.listeners[event])) {
                //Merge data if possible.
                data = {workspace: this, ...data};

                //Run the callbacks
                const callbacks = this.listeners[event];
                for (let i = 0; i<callbacks.length; i++) {
                    callbacks[i](data, this);
                }
            }
        }

        removeEventListener(event, callback) {
            if (this.events.includes(event)) {
                if (!this.listeners[event]) return;
                const index = this.listeners[event].indexOf(callback);
                if (index < 0) return;
                this.listeners[event].splice(index, 1);
            }
        }

        //Viewbounds
        viewBounds = [0, 0, 0, 0];

        //Scrolling
        #scrollX = 0;
        set scrollX(value) {
            this.#scrollX = Math.min(Math.max(this.width / -2, value), this.width / 2);
            this.updatePosition();
        }
        get scrollX() { return this.#scrollX; }

        #scrollY = 0;
        set scrollY(value) {
            this.#scrollY = Math.min(Math.max(this.height / -2, value), this.height / 2);
            this.updatePosition();
        }
        get scrollY() { return this.#scrollY; }

        #zoom = 2;
        invZoom = 1;
        set zoom(value) {
            this.#zoom = Math.max(Math.min(value, 25), 0.25);
            this.updatePosition();
        }
        get zoom() { return this.#zoom; }

        //Tools
        #tool = ""
        toolButtons = {};
        toolFunction = new artimus.tool();
        suppressSelectionFunction = false;

        set tool(value) {
            //Make sure the tool function gets the deselection notification if possible
            if (this.toolFunction && this.toolFunction.deselected) this.toolFunction.deselected(this.editGL, this.previewGL, this.toolProperties);

            if (artimus.tools[value]) this.toolFunction = new artimus.tools[value]();
            else this.toolFunction = new artimus.tool();
            this.toolFunction.workspace = this;

            //Then call the selection signal after properties.
            this.toolProperties = Object.assign({},this.toolFunction.properties, this.toolProperties);

            if (!this.suppressSelectionFunction && this.toolFunction && this.toolFunction.selected) this.toolFunction.selected(this.editGL, this.previewGL, this.toolProperties);

            //Tool stuffs
            this.#tool = value;
            this.refreshToolOptions();

            //Set the last selected to not be selected
            if (this.selectedElement) this.selectedElement.className = this.toolClass;

            //Set the new one to be selected.
            this.selectedElement = this.toolButtons[value];
            if (this.selectedElement) this.selectedElement.className = this.toolClass + this.toolClassSelected;

            //We also want to clear the previewGL
            if (this.toolFunction.preview) this.previewGL.clearRect(...this.viewBounds);

            this.sendEvent("toolSwitched", { tab: value });
        }
        get tool() { return this.#tool; }

        toolProperties = {};

        //Canvas
        #width = 300;
        set width(value) { this.resize(value, this.height); }
        get width() { return this.#width; }

        #height = 150;
        set height(value) { this.resize(this.width, value); }
        get height() { return this.#height; }
        
        dirty = true;

        //Layers
        layerHiddenAnimation = 0;
        #currentLayer = 0;
        set currentLayer(value) {
            this.setLayer(value);
        }
        get currentLayer() {
            return this.#currentLayer;
        }

        _toolbarTab = 0;
        set toolbarTab(value) {
            this.quickVar(this.toolbar, {
                "tab-1": 0,
                "tab-2": 0,
                "tab-3": 0,
            });

            this.toolbar.style.setProperty(`--tab-${value + 1}`, 1);
            this._toolbarTab = value;

            this.sendEvent("tabSwitched", { tab: value });
        }
        get toolbarTab() {
            return this._toolbarTab;
        }

        //History
        history = [];
        historyIndex = 0;

        //CSS classes
        toolClass = "artimus-button artimus-sideBarButton artimus-tool ";
        layerClass = "artimus-button artimus-sideBarButton artimus-layer ";
        toolClassSelected = "artimus-button-selected artimus-tool-selected ";
        layerClassSelected = "artimus-button-selected artimus-layer-selected ";

        //Selection stuff
        #selection = [];
        set selection(value) { this.setSelection(value); }
        get selection() { return this.#selection; }

        selectionMinX = 0;
        selectionMinY = 0;

        selectionMaxX = 0;
        selectionMaxY = 0;

        time = 0;
        selectionAnimation = 0;
        selectionPath = new Path2D();
        hasSelection = false;
        
        #selectionOnPreview = false
        set selectionOnPreview(value) {
            if (value == true) this.applySelectionToPreview();
            else this.clearSelectionFromPreview();
        }

        get selectionOnPreview() {
            return this.#selectionOnPreview;
        }

        lastPosition = [ 0, 0 ];

        //And finally...
        projectStorage = {};

        //Objects and data needed for the artimus format
        tEncoder = new TextEncoder();
        tDecoder = new TextDecoder();

        webgl = { shaders: {}, positionBuffer: null, selectionBuffer: null, compositeTexture: null, previewTexture: null, hiddenTexture: null };

        //Finally just a small profiler thing.
        performance = {
            fps: 0,
            delta: 0
        };

        gridData = {
            color1: [ 0.9, 0.9, 0.9 ],
            color2: [ 0.8, 0.8, 0.8 ],
            size: 8
        }

        updatePosition() {
            //Setup some CSS
            this.quickVar(this.container, {
                "scrollX": `${this.scrollX}px`,
                "scrollY": `${this.scrollY}px`,
                "zoom": this.zoom,
                "canvasWidth": `${this.width}px`,
                "canvasHeight": `${this.height}px`
            });
            
            this.invZoom = 1 / this.#zoom;

            this.dirty = true;
        }

        //General helper functions ported from Coffee Engine
        quickCSS(element, css) {
            if (Array.isArray(element)) {
                for (let elID in element) {
                    editor.quickCSS(element[elID], css);
                }
            }

            if (!(element instanceof HTMLElement)) return element;

            for (let key in css) {
                element.style[key] = css[key];
            }

            return element;
        }

        //Quickly sets css variables
        quickVar(element, variables) {
            if (Array.isArray(element)) {
                for (let elID in element) {
                    editor.quickVar(element[elID], variables);
                }
            }

            if (!(element instanceof HTMLElement)) return element;

            for (let key in variables) {
                element.style.setProperty(`--${key}`, variables[key]);
            }

            return element;
        }

        //Grab fonts available for use in the editor, if we can't get all
        //fonts grab a small assorted list of fonts.
        getFonts() {
            return new Promise((resolve, reject) => {
                if (window.queryLocalFonts) window.queryLocalFonts().then((fontList) => resolve([
                    { family: "Serif", fullName: "Serif", postscriptName: "Serif", style: "Regular" },
                    { family: "Sans-serif", fullName: "Sans-serif", postscriptName: "Sans-serif", style: "Regular" },
                    { family: "Monospace", fullName: "Monospace", postscriptName: "Monospace", style: "Regular" },
                    { family: "Cursive", fullName: "Cursive", postscriptName: "Cursive", style: "Regular" },
                    { family: "Fantasy", fullName: "Fantasy", postscriptName: "Fantasy", style: "Regular" },
                    ...fontList
                ]));
                else resolve([
                    { family: "Serif", fullName: "Serif", postscriptName: "Serif", style: "Regular" },
                    { family: "Sans-serif", fullName: "Sans-serif", postscriptName: "Sans-serif", style: "Regular" },
                    { family: "Monospace", fullName: "Monospace", postscriptName: "Monospace", style: "Regular" },
                    { family: "Cursive", fullName: "Cursive", postscriptName: "Cursive", style: "Regular" },
                    { family: "Fantasy", fullName: "Fantasy", postscriptName: "Fantasy", style: "Regular" },
                ])
            })
        }

        //Now for the meat and potatoes
        constructor() {
            //Look for existing CUGI if one doesn't exist, add it.
            if (!window.CUGI) {
                window.CUGI = {};

                const CUGIScript = document.createElement("script");
                CUGIScript.src = "https://coffee-engine.github.io/CUGI/dist/CUGI.js";
                document.body.appendChild(CUGIScript);
            }

            //The cugi font input
            CUGI.types["artimus-font"] = (data) => {
                const { target, key } = data;
                const button = document.createElement("button");

                button.innerText = target[key];
                button.className = "CUGI-artimus-font";
                
                button.onclick = () => {
                    artimus.fontPopup(this).then(font => {
                        target[key] = font;
                        button.innerText = target[key];
                    })
                }

                return button;
            }

            this.createLayout();
            this.addControls();

            //Create layers array
            this.layers = [];

            this.setupCanvases();
            this.resize(640, 480);
            this.createLayer();

            this.fileReader = new FileReader();

            artimus.activeWorkspaces.push(this);

            const workspace = this;

            let start = 0;
            const loop = (ts) => {
                if (!workspace) return;

                workspace.renderLoop.call(workspace, (ts - start) / 1000);
                start = ts;
                requestAnimationFrame(loop);
            }

            //Setup our grid then loop
            this.refreshGridPattern();
            loop(0.016);

            this.refreshTranslation();
        }

        setupCanvases() {
            //Set up our canvi? canvases? canvo?
            if (window.OffscreenCanvas) {
                this.editingCanvas = new OffscreenCanvas(1, 1);
                this.previewCanvas = new OffscreenCanvas(1, 1);
                this.compositeCanvas = new OffscreenCanvas(1, 1);
            }
            else {
                this.editingCanvas = document.createElement("canvas");
                this.previewCanvas = document.createElement("canvas");
                this.compositeCanvas = document.createElement("canvas");
            }

            //We use webgl for the fullview since offscreen canvas' are rather performant, and also useful.
            this.GL = this.canvas.getContext("webgl", { alpha: false, premultipliedAlpha: false, depth: false, stencil: false, antialias: false });

            this.setupWebGLSetters();

            this.editGL = this.editingCanvas.getContext("2d", { willReadFrequently: true, desynchronized: true  });
            this.compositeGL = this.compositeCanvas.getContext("2d", { desynchronized: true });
            this.previewGL = this.previewCanvas.getContext("2d", { desynchronized: true });

            //Now time to setup the webgl texture
            this.webgl.compositeTexture = this.setupSimpleTexture();
            this.webgl.previewTexture = this.setupSimpleTexture();
            this.webgl.hiddenTexture = this.setupSimpleTexture();

            //Setup the blending
            this.GL.enable(this.GL.BLEND);
            this.GL.blendFunc(this.GL.SRC_ALPHA, this.GL.ONE_MINUS_SRC_ALPHA);

            //Setup vertices
            this.webgl.positionBuffer = this.GL.createBuffer();
            this.webgl.selectionBuffer = this.GL.createBuffer();
            
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.webgl.positionBuffer);
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array([
                0, 0,
                0, 1,
                1, 1,

                0, 0,
                1, 0,
                1, 1
            ]), this.GL.STATIC_DRAW);
            this.GL.enableVertexAttribArray(0);
            this.GL.vertexAttribPointer(0, 2, this.GL.FLOAT, false, 0, 0);


            this.addWebGLShader("main", `
            attribute mediump vec2 a_position;

            varying mediump vec2 v_texCoord;

            void main() {
                gl_Position = vec4((a_position - 0.5) * vec2(2.0, -2.0), 0, 1);
                v_texCoord = a_position;
            }
            `,`
            uniform sampler2D u_main_tex;
            uniform mediump vec3 u_background_1;
            uniform mediump vec3 u_background_2;
            uniform mediump int u_grid_size;

            uniform lowp int u_render_mode;
            uniform mediump float u_time;

            varying mediump vec2 v_texCoord;

            int mod(int a, int b) {
                return a - ((a/b) * b);
            }

            void main() {
                //If we have a background draw the background and the image
                if (u_render_mode == 1) {
                    mediump int offset = int(gl_FragCoord.x);
                    if (mod(int(gl_FragCoord.y), u_grid_size * 2) >= u_grid_size) { offset += u_grid_size; }
                    offset = mod(offset, u_grid_size * 2);

                    if (offset >= u_grid_size) { gl_FragColor = vec4(u_background_1, 1); }
                    else { gl_FragColor = vec4(u_background_2, 1); }

                    highp vec4 sampled = texture2D(u_main_tex, v_texCoord);
                    gl_FragColor.xyz = mix(gl_FragColor.xyz, sampled.xyz, sampled.a);
                }
                else if (u_render_mode == 2) {
                    //If hidden do the animation
                    gl_FragColor = texture2D(u_main_tex, v_texCoord);
                    gl_FragColor.w *= (sin(u_time * 5.0) * 0.2) + 0.7;
                }
                else {
                    //Otherwise draw just the image
                    gl_FragColor = texture2D(u_main_tex, v_texCoord);
                }
            }
            `).use();
            
            //For the selection line
            this.addWebGLShader("selection", `
            attribute mediump vec3 a_position;

            varying mediump float v_distance;
            uniform mediump float u_selection_animation;

            void main() {
                gl_Position = vec4((a_position.xy - 0.5) * vec2(2.0, -2.0), 0, 1);
                v_distance = a_position.z;
            }
            `,`
            uniform mediump float u_selection_animation;
            uniform mediump vec3 u_selection_color;

            varying mediump float v_distance;

            void main() {
                gl_FragColor = vec4(u_selection_color, 1);
                mediump float animationPoint = mod(v_distance + u_selection_animation, 7.0);

                if (animationPoint > 3.0) {
                    if (animationPoint < 5.0) { gl_FragColor.w = max(0.0, (5.0 - animationPoint) / 2.0); }
                    else { gl_FragColor.w = max(0.0, (animationPoint - 5.0) / 2.0); }
                }
            }
            `).use();
        }

        //webGL fun stuff
        setupSimpleTexture() {
            const texture = this.GL.createTexture();
            this.GL.bindTexture(this.GL.TEXTURE_2D, texture);
            this.GL.texParameterf(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.NEAREST);
            this.GL.texParameterf(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.NEAREST);
            this.GL.texParameterf(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
            this.GL.texParameterf(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);

            return texture;
        }

        setupWebGLSetters() {
            this.setters = {};

            //Ints
            this.setters[this.GL.INT] = (location, value) => { this.GL.uniform1i(location, value); }
            this.setters[this.GL.UNSIGNED_INT] = (location, value) => { this.GL.uniform1ui(location, value); }

            //Floats
            this.setters[this.GL.FLOAT] = (location, value) => { this.GL.uniform1f(location, value); }
            this.setters[this.GL.FLOAT_VEC2] = (location, value) => { this.GL.uniform2fv(location, value); }
            this.setters[this.GL.FLOAT_VEC3] = (location, value) => { this.GL.uniform3fv(location, value); }
            this.setters[this.GL.FLOAT_VEC4] = (location, value) => { this.GL.uniform4fv(location, value); }

            this.setters[this.GL.FLOAT_MAT2] = (location, value) => { this.GL.uniformMatrix2fv(location, value); }
            this.setters[this.GL.FLOAT_MAT3] = (location, value) => { this.GL.uniformMatrix3fv(location, value); }
            this.setters[this.GL.FLOAT_MAT4] = (location, value) => { this.GL.uniformMatrix4fv(location, value); }

            this.setters[this.GL.SAMPLER_2D] = (location, value, { samplerID }) => {
                this.GL.activeTexture(this.GL[`TEXTURE${samplerID}`]);
                this.GL.bindTexture(this.GL.TEXTURE_2D, value);
                this.GL.uniform1i(location, samplerID);
            }
        }

        addWebGLShader(id, vertexSrc, fragmentSrc) {
            const vertex = this.GL.createShader(this.GL.VERTEX_SHADER);
            this.GL.shaderSource(vertex, vertexSrc);
            this.GL.compileShader(vertex);
            
            if (!this.GL.getShaderParameter(vertex, this.GL.COMPILE_STATUS)) {
                console.error(`shader not compiled!\nclearing memory\nCompile Log\n***\n${this.GL.getShaderInfoLog(vertex)}\n***`);
                this.GL.deleteShader(vertex);
                return;
            }

            const fragment = this.GL.createShader(this.GL.FRAGMENT_SHADER);
            this.GL.shaderSource(fragment, fragmentSrc);
            this.GL.compileShader(fragment);
            
            if (!this.GL.getShaderParameter(fragment, this.GL.COMPILE_STATUS)) {
                console.error(`shader not compiled!\nclearing memory\nCompile Log\n***\n${this.GL.getShaderInfoLog(fragment)}\n***`);
                this.GL.deleteShader(vertex);
                this.GL.deleteShader(fragment);
                return;
            }

            const program = this.GL.createProgram();

            this.GL.attachShader(program, vertex);
            this.GL.attachShader(program, fragment);

            this.GL.linkProgram(program);

            //? could potentially be better?
            if (!this.GL.getProgramParameter(program, this.GL.LINK_STATUS)) {
                console.error(`shader not compiled!\nerror in program linking!\nclearing memory\nlink log\n***\n${gl.getProgramInfoLog(program)}\n***`);
                this.GL.deleteShader(vertex);
                this.GL.deleteShader(fragment);
                this.GL.deleteProgram(program);
                return;
            }
            
            //Delete the shader if it exists.
            if (this.webgl.shaders[id]) this.removeWebGLShader(id);

            //Setup shader stuff.
            const shader = {
                program: program,
                vertex: vertexSrc,
                fragment: fragmentSrc,
                vertexShader: vertex,
                fragmentShader: fragment,
                use: () => this.GL.useProgram(shader.program),

                setUniforms: (values) => {
                    const keys = Object.keys(values);
                    for (let keyID = 0; keyID < keys.length; keyID++) {
                        const key = keys[keyID];
                        if (shader.uniforms[key]) {
                            const uniform = shader.uniforms[key];
                            this.setters[uniform.type](uniform.location, values[key], uniform);
                        }
                    }
                }
            };

            //Get indicies and count
            const uniformCount = this.GL.getProgramParameter(program, this.GL.ACTIVE_UNIFORMS);
            shader.shaderIndicies = Array(uniformCount).keys();
            shader.uniforms = {};

            //Get uniforms in array
            let sampler2D = 0;
            for (let idx = 0; idx < uniformCount; idx++) {
                const data = this.GL.getActiveUniform(program, idx);
                data.location = this.GL.getUniformLocation(program, data.name);

                if (data.type == this.GL.SAMPLER_2D) {
                    data.samplerID = sampler2D;
                    sampler2D++;
                }
                
                shader.uniforms[data.name] = data;
            }

            this.webgl.shaders[id] = shader;
            return this.webgl.shaders[id];
        }

        removeWebGLShader(shader) {
            if (typeof shader == "string") shader = this.webgl.shaders[shader];

            if (typeof shader == "object") {
                if (shader.program) this.GL.deleteProgram(shader.program);
                if (shader.vertexShader) this.GL.deleteShader(shader.vertexShader);
                if (shader.fragmentShader) this.GL.deleteShader(shader.fragmentShader);
            }
        }

        refreshGridPattern() {
            //webGL :)
            const c1 = artimus.HexToRGB(artimus.getCSSVariable("grid-1"));
            const c2 = artimus.HexToRGB(artimus.getCSSVariable("grid-2"));

            this.gridData = {
                color1: [ c1.r / 255, c1.g / 255, c1.b / 255 ],
                color2: [ c2.r / 255, c2.g / 255, c2.b / 255 ],
                size: 8
            }
        }

        renderLoop(delta) {
            this.GL.viewport(0, 0, this.width, this.height);

            //Set performance and time data.
            this.performance.fps = 1 / delta;
            this.performance.delta = delta;

            //Get view bounds
            let { width, height } = this.canvasArea.getBoundingClientRect();
            width /= 2;
            height /= 2;

            //Calculate render bounds based upon the view area.
            const halfCanvWidth = this.width / 2;
            const halfCanvHeight = this.height / 2;
            this.viewBounds = [
                Math.floor((halfCanvWidth-this.scrollX) - (width * this.invZoom)),
                Math.floor((halfCanvHeight-this.scrollY) - (height * this.invZoom)),
                Math.ceil((halfCanvWidth-this.scrollX) + (width * this.invZoom)),
                Math.ceil((halfCanvHeight-this.scrollY) + (height * this.invZoom))
            ];
            this.viewBounds[0] = Math.min(this.width - 1, Math.max(0, this.viewBounds[0]));
            this.viewBounds[1] = Math.min(this.height - 1, Math.max(0, this.viewBounds[1]));
            this.viewBounds[2] = Math.max(1, Math.min(this.width - this.viewBounds[0], this.viewBounds[2] - this.viewBounds[0]));
            this.viewBounds[3] = Math.max(1, Math.min(this.height - this.viewBounds[1], this.viewBounds[3] - this.viewBounds[1]));

            //The reason behind time and selection animation
            //Time is here as a global timer, as selection animation is for a specific animation that may restart.
            this.time += delta;

            //If we are dirty update our canvas as needed.
            if (this.dirty) {
                this.renderComposite(this.viewBounds);

                //Bind and edit the composite texture
                this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.compositeTexture);
                this.GL.texSubImage2D(this.GL.TEXTURE_2D, 0, ...this.viewBounds, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.compositeGL.getImageData(...this.viewBounds).data);
                
                this.sendEvent("redraw", { delta: delta, time: this.time, bounds: this.viewBounds });
                this.dirty = false;
            }

            //Set buffers to the position buffer/quad buffer.
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.webgl.positionBuffer);
            this.GL.vertexAttribPointer(0, 2, this.GL.FLOAT, false, 0, 0);
                
            const main = this.webgl.shaders.main;

            main.use();

            main.setUniforms({
                u_main_tex: this.webgl.compositeTexture,
                u_background_1: this.gridData.color1,
                u_background_2: this.gridData.color2,
                u_render_mode: 1,
                u_grid_size: this.gridData.size,
                u_time: this.time
            });
            
            this.GL.drawArrays(this.GL.TRIANGLES, 0, 6);

            //Render hidden layers
            if (!this.getLayerVisibility(this.currentLayer)) {
                //Do preview stuff
                this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.hiddenTexture);
                this.GL.texSubImage2D(this.GL.TEXTURE_2D, 0, ...this.viewBounds, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.editGL.getImageData(...this.viewBounds).data);

                main.setUniforms({
                    u_main_tex: this.webgl.hiddenTexture,
                    u_render_mode: 2
                });
                this.GL.drawArrays(this.GL.TRIANGLES, 0, 6);
            }

            //Do preview stuff
            this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.previewTexture);
            this.GL.texSubImage2D(this.GL.TEXTURE_2D, 0, ...this.viewBounds, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.previewGL.getImageData(...this.viewBounds).data);

            main.setUniforms({
                u_main_tex: this.webgl.previewTexture,
                u_render_mode: 0
            });
            this.GL.drawArrays(this.GL.TRIANGLES, 0, 6);

            if (this.hasSelection) {
                //Set buffers to the selection outline buffer thingy.
                this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.webgl.selectionBuffer);
                this.GL.vertexAttribPointer(0, 3, this.GL.FLOAT, false, 0, 0);

                this.selectionAnimation = (this.selectionAnimation + (delta * 7.5));
                const { r, g, b } = artimus.HexToRGB(getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline"));

                //Get our shader set needed info, and use it.
                const selection = this.webgl.shaders.selection;

                selection.use();
                selection.setUniforms({
                    u_selection_animation: this.selectionAnimation,
                    u_selection_color: [ r / 255, g / 255, b / 255 ],
                    u_time: this.time
                })

                
                this.GL.drawArrays(this.GL.LINE_STRIP, 0, (this.selection.length / 2) + 1);
            }

            //Send the tick event
            this.sendEvent("tick", { delta: delta, time: this.time, bounds: this.viewBounds });
        }

        renderComposite(bounds) {
            if (bounds == true) bounds = [0, 0, this.width, this.height];
            
            //Clear and get ready for compositing.
            this.compositeGL.clearRect(...bounds);

            //Draw the layers
            for (let layerID in this.layers) {
                const layer = this.layers[layerID];
                this.compositeGL.globalCompositeOperation = layer.blendMode || "source-over";

                if (layer.visibility) {
                    this.compositeGL.globalAlpha = layer.alpha;
                    if (layerID == this.currentLayer) this.compositeGL.drawImage(this.editingCanvas, ...bounds, ...bounds);
                    else {
                        const bitmap = layer.bitmap;
                        if (bitmap instanceof ImageBitmap) this.compositeGL.drawImage(bitmap, ...bounds, ...bounds);
                    }
                }
            }
            this.compositeGL.globalAlpha = 1;
        }

        createLayout() {
            //Create needed elements
            this.container = document.createElement("div");
            
            this.toolbar = document.createElement("div");
            this.toolbox = document.createElement("div");
            this.toolPropertyHolder = document.createElement("div");
            this.layerHolder = document.createElement("div");

            this.layerList = document.createElement("div");
            this.layerCreationHolder = document.createElement("div");
            this.layerCreationName = document.createElement("input");
            this.layerCreationButton = document.createElement("button");
            this.layerCreationButton.innerText = "✓";

            this.toolbarTabs = document.createElement("div");
            this.toolTab = document.createElement("button");
            this.propertyTab = document.createElement("button");
            this.layerTab = document.createElement("button");

            this.toolTab.appendChild(artimus.elementFromString(artimus.toolIcon));
            this.propertyTab.appendChild(artimus.elementFromString(artimus.propertiesIcon));
            this.layerTab.appendChild(artimus.elementFromString(artimus.layerIcon));

            this.canvasArea = document.createElement("div");
            this.canvas = document.createElement("canvas");
            
            //Fix for it resizing it's parents
            //this.canvas.style.width = "1px";
            //this.canvas.style.height = "1px";
            
            //Now we can style our children
            this.container.className = "artimus-container";

            this.toolbar.className = "artimus-toolbar";
            this.toolbox.className = "artimus-sideBarList artimus-toolbox";
            this.toolPropertyHolder.className = "artimus-sideBarList artimus-toolPropertyHolder";
            this.layerHolder.className = "artimus-sideBarList artimus-layerHolder";

            this.layerList.className = "artimus-layerList";

            this.layerCreationHolder.className = "artimus-layerCreationHolder";
            this.layerCreationName.className = "artimus-layerCreationName";
            this.layerCreationButton.className = "artimus-button artimus-layerCreationButton";

            this.toolbarTabs.className = "artimus-toolbarTabs";

            this.toolTab.className = "artimus-button artimus-toolbarTab";
            this.toolTab.children[0].classList = "artimus-toolIcon artimus-tabIcon"

            this.propertyTab.className = "artimus-button artimus-toolbarTab";
            this.propertyTab.children[0].classList = "artimus-toolIcon artimus-tabIcon"

            this.layerTab.className = "artimus-button artimus-toolbarTab";
            this.layerTab.children[0].classList = "artimus-toolIcon artimus-tabIcon"

            this.canvasArea.className = "artimus-canvasArea";
            this.canvas.className = "artimus-canvas";
            
            this.container.appendChild(this.toolbar);
            this.toolbar.appendChild(this.toolbox);
            this.toolbar.appendChild(this.toolPropertyHolder);
            this.toolbar.appendChild(this.layerHolder);

            this.layerHolder.appendChild(this.layerList);
            this.layerHolder.appendChild(this.layerCreationHolder);
            this.layerCreationHolder.appendChild(this.layerCreationName);
            this.layerCreationHolder.appendChild(this.layerCreationButton);

            this.container.appendChild(this.toolbarTabs);
            this.toolbarTabs.appendChild(this.toolTab);
            this.toolbarTabs.appendChild(this.propertyTab);
            this.toolbarTabs.appendChild(this.layerTab);

            this.container.appendChild(this.canvasArea);
            this.canvasArea.appendChild(this.canvas);

            this.layerCreationName.onkeydown = (event) => {
                if (event.key == "Enter") {
                    this.createLayer(this.layerCreationName.value);
                    this.layerCreationName.value = "";
                }
            }

            this.layerCreationButton.onclick = () => {
                if (!this.layerExists(this.layerCreationName.value)) {
                    this.createLayer(this.layerCreationName.value);
                    this.layerCreationName.value = "";
                }
            }

            this.toolTab.onclick = () => { this.toolbarTab = 0; }
            this.propertyTab.onclick = () => { this.toolbarTab = 1; }
            this.layerTab.onclick = () => { this.toolbarTab = 2; }

            this.updatePosition();
        }

        pickColorAt(x, y) {
            let red = 255; let green = 255; let blue = 255; let alpha = 255;

            if (artimus.pickType == "composite") [red, green, blue, alpha] = this.compositeGL.getImageData(x, y, 1, 1).data;
            else [red, green, blue, alpha] = this.editGL.getImageData(x, y, 1, 1).data;
            const converted = artimus.RGBToHex({ r:red, g:green, b:blue, a:alpha });
            return converted;
        }

        processHotkey(hotkey) {
            switch (typeof hotkey) {
                case "string":
                    this[hotkey]();
                    break;

                case "object":
                    //Allow hotkeys to be arrays of commands
                    if (Array.isArray(hotkey)) for (let command in hotkey) {
                        this.processHotkey(hotkey[command]);
                    }
                    //Allow objects to be used
                    else {
                        //Parse arguments if available.
                        let args = [];
                        if (Array.isArray(hotkey.arguments)) args = [...hotkey.arguments];

                        //Function determination using any function from this as a fallback if need be
                        if (typeof hotkey.function == "function") hotkey.function(this, ...args);
                        else if (typeof this[hotkey.function] == "function") this[hotkey.function](...args);
                    }
                    break;

                case "function":
                    hotkey(this);
                    break;
            
                default:
                    break;
            }
        }

        //Control stuffs
        fingersDown = 0;
        panning = false;
        controlSets = {
            kbMouse: {
                mouseDown: (event) => {
                    switch (event.button) {
                        case 0:
                            if (event.target != this.canvas) return;
                            if (this.toolFunction.mouseDown && !this.toolDown) this.toolFunction.mouseDown(this.editGL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                            this.toolDown = true;
                            break;

                        case 2:
                            if (!this.toolFunction) return;
                            if (!this.toolFunction.colorProperties) return;
                            if (event.target != this.canvas) return;
                            const color = this.pickColorAt(...this.getCanvasPosition(event.clientX, event.clientY, true));

                            //Loop colors
                            for (let key in this.toolFunction.colorProperties) {
                                this.toolProperties[this.toolFunction.colorProperties[key]] = color;
                            }

                            //Refresh options
                            this.refreshToolOptions();
                            break;

                        case 1:
                            this.panning = true;
                            break;
                    
                        default:
                            break;
                    }
                },

                mouseUp: (event) => {
                    switch (event.button) {
                        case 0:
                            const position = this.getCanvasPosition(event.clientX, event.clientY);
                            if (this.toolFunction.mouseUp && this.toolDown) this.toolFunction.mouseUp(this.editGL, ...position, this.toolProperties);
                            if (this.toolFunction.preview) {
                                this.previewGL.clearRect(...this.viewBounds);
                                this.toolFunction.preview(this.previewGL, ...position, this.toolProperties);
                            }
                            
                            //For the undoing
                            if (this.toolDown && this.tool && this.toolFunction.constructive) {
                                this.updateLayerHistory();
                                this.dirty = true;
                            }
                            this.toolDown = false; 
                            break;
                        
                        case 1:
                            this.panning = false;
                            break;
                    
                        default:
                            break;
                    }
                    
                    
                },

                mouseMove: (event) => {
                    if (this.panning) {
                        this.scrollX += event.movementX * this.invZoom;
                        this.scrollY += event.movementY * this.invZoom;
                    }

                    const position = this.getCanvasPosition(event.clientX, event.clientY);
                    this.lastPosition = position;
                    
                    if (this.toolFunction.preview) {
                        //For previews
                        this.previewGL.clearRect(...this.viewBounds);
                        this.toolFunction.preview(this.previewGL, ...position, this.toolProperties);
                    }

                    if (this.toolDown && this.toolFunction.mouseMove) {
                        this.toolFunction.mouseMove(this.editGL, ...position, event.movementX * this.invZoom, event.movementY * this.invZoom, this.toolProperties);
                        if (this.toolFunction.constructive) this.dirty = true;
                    }
                },

                mouseWheel: (event) => {
                    event.preventDefault();
                    if (event.ctrlKey) {
                        this.zoom += event.deltaY / -100;
                    }
                    else if (event.shiftKey) {
                        this.scrollX -= (event.deltaY) * this.invZoom;
                        this.scrollY -= (event.deltaX) * this.invZoom;
                        this.zoom += event.deltaZ / -100;
                    }
                    else {
                        this.scrollX -= (event.deltaX) * this.invZoom;
                        this.scrollY -= (event.deltaY) * this.invZoom;
                        this.zoom += event.deltaZ / -100;
                    }
                },

                keyPressed: (event) => {
                    if (!(artimus.unfocusedHotkeys || this.focused)) return;

                    //Get the initial state
                    let keyDescription = event.key.toLowerCase();
                    //Make sure it isn't one of the modifier keys
                    if (!artimus.modifierKeys.includes(keyDescription)) {
                        if (event.altKey) keyDescription = `alt+${keyDescription}`;
                        if (event.shiftKey) keyDescription = `shift+${keyDescription}`;
                        if (event.ctrlKey) keyDescription = `ctrl+${keyDescription}`;

                        //Just incase...
                        if (event.metaKey) keyDescription = `meta+${keyDescription}`;

                        if (artimus.hotkeys[keyDescription]){
                            event.preventDefault();
                            this.processHotkey(artimus.hotkeys[keyDescription]);
                        }
                    }

                    if (event.key.toLowerCase() == "shift") { this.shiftHeld = true; }

                    if (this.toolFunction.keyPressed) {
                        if (this.toolFunction.keyPressed(this.editGL, event, this.toolProperties)) event.preventDefault();

                        this.previewGL.clearRect(...this.viewBounds);
                        this.toolFunction.preview(this.previewGL, ...this.lastPosition, this.toolProperties);                        
                    }
                },

                keyReleased: (event) => {
                    if (event.key.toLowerCase() == "shift") { this.shiftHeld = false; }

                    if (this.toolFunction.keyReleased) {
                        if (this.toolFunction.keyReleased(this.editGL, event, this.toolProperties)) event.preventDefault();

                        this.previewGL.clearRect(...this.viewBounds);
                        this.toolFunction.preview(this.previewGL, ...this.lastPosition, this.toolProperties);                        
                    }
                }
            },

            //Mobile support
            touch: {
                lastDrew: [0,0],
                touches: {},
                hadMoved: false,
                
                fingerDown: (event) => {
                    event.preventDefault();
                    this.fingersDown++;

                    //Update the touches
                    for (let touchID in Array.from(event.changedTouches)) {
                        const touch = event.changedTouches[touchID];
                        
                        this.controlSets.touch.touches[touch.identifier] = {
                            lx: touch.clientX,
                            ly: touch.clientY,
                            obj: touch
                        }
                    }
                },

                fingerMove: (event) => {
                    event.preventDefault();

                    let firstTouch = event.changedTouches[0];
                    const touches = Array.from(event.changedTouches);
                    
                    switch ((this.toolFunction) ? this.fingersDown : 0) {
                        //2 Finger movement.
                        case 2:{
                            this.controlSets.touch.hadMoved = true;
                            
                            //Update the touches
                            for (let touchID in Array.from(event.changedTouches)) {
                                const touch = event.changedTouches[touchID];
                                
                                this.controlSets.touch.touches[touch.identifier].obj = touch;
                            }

                            firstTouch = this.controlSets.touch.touches[0];
                            const secondTouch = this.controlSets.touch.touches[1];

                            const firstVelocity = [
                                (firstTouch.obj.clientX - firstTouch.lx),
                                (firstTouch.obj.clientY - firstTouch.ly)
                            ]

                            const secondVelocity = [
                                (secondTouch.obj.clientX - secondTouch.lx),
                                (secondTouch.obj.clientY - secondTouch.ly)
                            ]

                            //Get the dot of the movement;
                            const moveDot = (secondVelocity[0] * firstVelocity[0]) + (secondVelocity[1] * firstVelocity[1]);

                            if (moveDot < 0) {
                                //Get change in distance for zooming, maybe rotation sometime in the future
                                const lastDist = Math.sqrt(Math.pow(secondTouch.lx - firstTouch.lx, 2) + Math.pow(secondTouch.ly - firstTouch.ly, 2))
                                const newDist = Math.sqrt(Math.pow(secondTouch.obj.clientX - firstTouch.obj.clientX, 2) + Math.pow(secondTouch.obj.clientY - firstTouch.obj.clientY, 2))
                            
                                // (change) / ((MinorAxis) / 2.5)
                                const zoomAmnt = 
                                (newDist - lastDist) / 
                                (((window.innerWidth < window.innerHeight) ? window.innerWidth : window.innerHeight) / 
                                    (2.5 * this.zoom));
                            
                                this.zoom += zoomAmnt;
                            }
                            this.scrollX += (firstVelocity[0] + secondVelocity[0]) * (this.invZoom / this.fingersDown);
                            this.scrollY += (firstVelocity[1] + secondVelocity[1]) * (this.invZoom / this.fingersDown);

                            break;}

                        //Panning
                        default:
                            this.controlSets.touch.hadMoved = true;
                            
                            for (let touchID in touches) {
                                const touch = touches[touchID];
                                const heldData = this.controlSets.touch.touches[touch.identifier];
                                this.scrollX += (touch.clientX - heldData.lx) * (this.invZoom / this.fingersDown);
                                this.scrollY += (touch.clientY - heldData.ly) * (this.invZoom / this.fingersDown);
                            }
                            break;

                        //Drawing
                        case 1:
                            if (event.target != this.canvas) return;

                            //Give a 8 pixel buffer if we had moved before we start drawing again,
                            //Just to make sure the person wants to draw.
                            if (this.controlSets.touch.hadMoved) return;

                            const position = this.getCanvasPosition(firstTouch.clientX, firstTouch.clientY);

                            //Initilize drawing if we haven't
                            if (!this.toolDown) {
                                if (this.toolFunction.mouseDown) this.toolFunction.mouseDown(this.editGL, ...position, this.toolProperties);
                                this.toolDown = true;
                            }
                            else {
                    
                                if (this.toolFunction.preview) {
                                    //For previews
                                    this.previewGL.clearRect(...this.viewBounds);
                                    this.toolFunction.preview(this.previewGL, ...position, this.toolProperties);
                                }

                                if (this.toolFunction.mouseMove) this.toolFunction.mouseMove(this.editGL, ...position, position[0] - this.controlSets.touch.lastDrew[0], position[1] - this.controlSets.touch.lastDrew[1], this.toolProperties);
                            }

                            if (this.toolFunction.constructive) this.dirty = true;

                            this.lastPosition = position;
                            this.controlSets.touch.lastDrew = position;
                            break;
                    }
                    
                    //Update the touches
                    for (let touchID in Array.from(event.changedTouches)) {
                        const touch = event.changedTouches[touchID];
                        
                        this.controlSets.touch.touches[touch.identifier] = {
                            lx: touch.clientX,
                            ly: touch.clientY,
                            obj: touch
                        }
                    }
                },

                fingerUp: (event) => {
                    this.fingersDown--;

                    if (this.fingersDown == 0) {
                        if (this.toolDown) {
                            if (this.toolFunction.mouseUp) this.toolFunction.mouseUp(this.editGL, ...this.controlSets.touch.lastDrew, this.toolProperties);
                            if (this.toolFunction.preview) {
                                this.previewGL.clearRect(...this.viewBounds);
                                this.toolFunction.preview(this.previewGL, ...this.controlSets.touch.lastDrew, this.toolProperties);
                            }
                            
                            //For the undoing
                            if (this.toolFunction.constructive) this.dirty = true;
                            if (this.tool) this.updateLayerHistory();

                            this.toolDown = false; 
                        }

                        if (this.controlSets.touch.hadMoved) this.controlSets.touch.hadMoved = false;
                    }
                },
            },

            pen: {
                //Experimental S-Pen support, unsure about other stylus devices.
                penMove: (event) => {
                    //Mostly air action here.
                    if (event.pointerType == "pen" && event.pressure == 0) {
                        const position = this.getCanvasPosition(event.clientX, event.clientY);
                        if (this.toolFunction.preview) {
                            //For previews
                            this.previewGL.clearRect(...this.viewBounds);
                            this.toolFunction.preview(this.previewGL, ...position, this.toolProperties);
                        }

                        if (event.buttons == 1) {
                            if (!this.toolFunction) return;
                            if (!this.toolFunction.colorProperties) return;
                            if (event.target != this.canvas) return;
                            const color = this.pickColorAt(...this.getCanvasPosition(event.clientX, event.clientY, true));

                            //Loop colors
                            for (let key in this.toolFunction.colorProperties) {
                                this.toolProperties[this.toolFunction.colorProperties[key]] = color;
                            }

                            //Refresh options
                            this.refreshToolOptions();
                        }
                    }
                }
            }
        }

        requestKeyboard() {
            if (navigator.virtualKeyboard) {
                navigator.virtualKeyboard.show()
            }
        }

        addControls() {
            //Drawing
            this.canvas.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
            });

            this.canvasArea.addEventListener("mousedown", this.controlSets.kbMouse.mouseDown);
            this.container.addEventListener("mouseup", this.controlSets.kbMouse.mouseUp);
            this.canvasArea.addEventListener("mousemove", this.controlSets.kbMouse.mouseMove);
            this.canvasArea.addEventListener("wheel", this.controlSets.kbMouse.mouseWheel, { passive: false });

            document.addEventListener("mousedown", () => { this.focused = false; });
            this.container.addEventListener("mousedown", (event) => { event.stopPropagation(); this.focused = true; });

            document.addEventListener("keydown", this.controlSets.kbMouse.keyPressed);
            document.addEventListener("keyup", this.controlSets.kbMouse.keyReleased);

            this.canvasArea.addEventListener("touchstart", this.controlSets.touch.fingerDown);
            this.canvasArea.addEventListener("touchmove", this.controlSets.touch.fingerMove);
            this.canvasArea.addEventListener("touchend", this.controlSets.touch.fingerUp);

            this.canvasArea.addEventListener("pointermove", this.controlSets.pen.penMove);
        }

        refreshTranslation() {
            this.layerCreationName.placeholder = artimus.translate("inputPlaceholder", "layer");

            this.refreshTools();
            this.refreshToolOptions();
        }

        //Canvas movement
        setCanvasPosition(x, y) {
            this.#scrollX = -x;
            this.#scrollX = -y;
        }

        getCanvasPosition(x, y) {
            const {top, left, right, bottom} = this.canvas.getBoundingClientRect();
            return [Math.floor(((x -left) / (right - left)) * this.canvas.width), Math.floor(((y - top) / (bottom - top)) * this.canvas.height)];
        }

        //Tools
        refreshToolOptions() {
            this.toolPropertyHolder.innerHTML = "";

            if (!this.toolFunction.CUGI) return;
            this.toolPropertyHolder.appendChild(CUGI.createList(this.toolFunction.CUGI(this), {
                preprocess: (item) => {
                    item.text = artimus.translate(item.translationKey || item.key || item.text, "toolProperty") || item.text || item.key;
                    return item;
                }
            }));
        }

        refreshTools() {
            this.toolButtons = {};
            this.toolbox.innerHTML = "";
            this.selectedElement = null;

            for (let toolID in artimus.tools) {
                //Get tool and setup button;
                const tool = artimus.tools[toolID].prototype;
                const button = document.createElement("button");

                this.toolButtons[toolID] = button;

                //Set icon and text if needed
                if (typeof tool.icon == "string") {
                    let icon = null;

                    //For svgs
                    if (tool.icon.startsWith("<svg version=\"")) icon = artimus.elementFromString(tool.icon);
                    else {
                        icon = document.createElement("img");
                        icon.src = tool.icon;
                    }

                    if (icon instanceof HTMLElement || icon instanceof SVGElement) {
                        //? dunno why classname is not supported for SVG
                        icon.classList = "artimus-toolIcon";
                        button.appendChild(icon);
                    }
                }

                //?Labels are easy but I'm going to group the append with the other append and classNames
                const label = document.createElement("p");
                label.innerText = tool.name || artimus.translate(toolID, "tool");

                button.onclick = () => {
                    this.tool = toolID;
                }

                //Add cugi related things
                button.CUGI_CONTEXT = () => {
                    return [
                        { type: "button", text: "use", translationKey: "use", onclick: () => {
                            button.onclick();
                        }},
                        { type: "button", text: "useWithDefaults", translationKey: "useWithDefaults", onclick: () => {
                            button.onclick();
                            this.toolProperties = Object.assign(this.toolProperties, this.toolFunction.properties);
                            this.refreshToolOptions();
                        }}
                    ];
                }

                button.CUGI_PREPROCESS = (item) => {
                    item.text = artimus.translate(item.translationKey || item.key || item.text, "toolDropdown") || item.text || item.key;
                    return item;
                }

                //Then setup items
                button.className = (toolID == this.tool) ? this.toolClass + this.toolClassSelected : this.toolClass;
                label.className = "artimus-toolLabel";
                this.toolbox.appendChild(button);
                button.appendChild(label);
            }

            this.sendEvent("toolsRefreshed", { tools: artimus.tools });
        }

        //For selections
        setSelection(newSelection) {
            if (this.#selection.length == 0) this.editGL.save();
            else {
                this.editGL.restore();
                this.editGL.save();
            }

            //Reset animation
            this.selectionAnimation = 0;

            //Make sure it is a polygon
            if (!Array.isArray(newSelection)) {
                console.warn("Selection is not an array!", newSelection);
                return this.clearSelection();
            }
            if (newSelection.length < 6) {
                console.warn("Selection is not a polygon!", newSelection);
                return this.clearSelection();
            }

            //Make sure we use pairs of 2
            if (newSelection.length % 2 == 1) {
                console.warn("Selection is not x y pairs!", newSelection);
                return this.clearSelection();
            }

            this.#selection = newSelection;

            //Prepare for measurement
            this.selectionMinX = Infinity;
            this.selectionMinY = Infinity;
            this.selectionMaxX = -Infinity;
            this.selectionMaxY = -Infinity;

            for (let i = 0; i < this.selection.length; i+=2) {
                this.#selection[i] = this.#selection[i];
                this.#selection[i + 1] = this.#selection[i + 1];

                if (this.#selection[i] < this.selectionMinX) { this.selectionMinX = Math.floor(this.#selection[i]) }
                if (this.#selection[i + 1] < this.selectionMinY) { this.selectionMinY = Math.floor(this.#selection[i + 1]) }

                if (this.#selection[i] > this.selectionMaxX) { this.selectionMaxX = Math.floor(this.#selection[i]) }
                if (this.#selection[i + 1] > this.selectionMaxY) { this.selectionMaxY = Math.floor(this.#selection[i + 1]) }
            }

            this.updateSelectionPath();
        }

        clearSelection() {
            this.#selection = [];
            this.selectionAnimation = 0;
            this.updateSelectionPath();
        }

        updateSelectionPath() {
            this.selectionPath = new Path2D();

            if (this.selection.length > 0) {
                this.hasSelection = true;

                //Create selection path, also record data for the gl path.
                const toGL = [];
                let distance = 0;

                for (let i = 0; i < this.selection.length; i+=2) {
                    if (i == 0) this.selectionPath.moveTo(Math.floor(this.selection[i]) + 0.5, Math.floor(this.selection[i + 1]) + 0.5);
                    else {
                        this.selectionPath.lineTo(Math.floor(this.selection[i]) + 0.5, Math.floor(this.selection[i + 1]) + 0.5);
                        distance += Math.sqrt(Math.pow(this.selection[i] - this.selection[i - 2], 2) + Math.pow(this.selection[i + 1] - this.selection[i - 1], 2));
                    }

                    toGL.push((this.selection[i] + 0.5) / this.width, (this.selection[i + 1] + 0.5) / this.height, distance);
                }
                //Calculate the final distance
                distance += Math.sqrt(Math.pow(this.selection[0] - this.selection[this.selection.length - 2], 2) + Math.pow(this.selection[1] - this.selection[this.selection.length - 1], 2));

                //Finally end it
                this.selectionPath.lineTo(this.selection[0] + 0.5, this.selection[1] + 0.5);
                toGL.push((this.selection[0] + 0.5) / this.width, (this.selection[1] + 0.5) / this.height, distance);

                this.editGL.clip(this.selectionPath, artimus.windRule);

                //update the buffer
                this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.webgl.selectionBuffer);
                this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(toGL), this.GL.STATIC_DRAW);

                this.sendEvent("selected", { selection: this.selection });
            }
            else {
                this.editGL.restore();
                this.hasSelection = false;

                this.sendEvent("selectionCleared", {});
            }
        }

        applySelectionToPreview() {
            if (this.selection.length > 0) {
                if (!this.selectionOnPreview) this.previewGL.save();
                this.previewGL.clip(this.selectionPath, artimus.windRule);
                this.#selectionOnPreview = true;
            }
            else this.clearSelectionFromPreview();
        }

        clearSelectionFromPreview() {
            if (this.selectionOnPreview) {
                this.previewGL.restore();
                this.#selectionOnPreview = false;
            }
        }

        //Layer manipulation, for use inside of the library itself but exposed for people to use for their own purposes
        setLayer(ID, then) {
            return new Promise((resolve, reject) => {
                ID = this.getLayerIndex(ID);

                if (typeof ID == "number") {
                    //Save current data to the layer position
                    const oldLayer = this.layers[this.#currentLayer];
                    const label = oldLayer.label;

                    //Clean up data and save layer data to previous layer.
                    this.layers[this.#currentLayer].dataRaw = this.editGL.getImageData(0, 0, this.width, this.height);
                    this.transferLayerData(oldLayer, this.layers[this.#currentLayer]);

                    this.updateLayer(this.#currentLayer, () => {
                        this.#currentLayer = ID;

                        //Now setup stuff we need/want like blitting the newly selected layer onto the editing canvas
                        const current = this.layers[this.#currentLayer];
                        this.editGL.putImageData(current.dataRaw, 0, 0);

                        label.className = this.layerClass;
                        current.label.className = this.layerClass + this.layerClassSelected;

                        if (then) then();
                        resolve();

                        this.sendEvent("layerSwitched", { layer: this.layers[ID], id: ID });
                    });
                }
                else {
                    reject(`Couldn't find or update layer ${ID}`);
                }
            });
        }

        getLayerIndex(ID) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                return ID;
            }

            return;
        }

        getLayer(ID) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                return this.layers[ID];
            }

            return;
        }

        createLayer(name, noSwitch) {
            const layer = new artimus.layer(this.width, this.height, name || (`${artimus.translate("layer#", "layer").replace("#", this.layers.length + 1)}`), this, noSwitch);
            this.sendEvent("layerCreated", { layer: layer, duplicate: false });
            return layer;
        }

        duplicateLayer(name, noSwitch) {
            const oldLayer = this.layers.find(layer => layer.name === name);
            const newLayer = new artimus.layer(this.width, this.height, artimus.translate("copy", "layer").replace("[NAME]", oldLayer.name), this, noSwitch);

            newLayer.dataRaw.data.set(oldLayer.dataRaw.data); // Copy the image data between the layers
            newLayer.alpha = oldLayer.alpha;
            newLayer.visibility = oldLayer.visibility;
            newLayer.blendMode = oldLayer.blendMode;

            this.sendEvent("layerCreated", { layer: layer, duplicate: true });
        }

        _createLayerElement(layerData) {
            const element = document.createElement("div");
            element.className = "artimus-layerWrapper";
            element.targetLayer = layerData.name;
            layerData.element = element;

            const label = document.createElement("button");
            label.className = this.layerClass;
            label.innerText = layerData.name;
            label.onclick = () => this.setLayer(element.targetLayer);
            layerData.label = label;

            //Create CUGI bindings for the button, more specifically the label
            label.CUGI_CONTEXT = () => {
                return [
                    { type: "button", text: "importLayer", onclick: () => this.importFromPC(false) },
                    { type: "button", text: "delete", onclick: () => this.removeLayer(element.targetLayer) },
                    { type: "button", text: "properties", onclick: () => (artimus.layerPropertyMenu)(this, this.getLayer(element.targetLayer)) },
                    { type: "button", text: "duplicate", onclick: () => this.duplicateLayer(element.targetLayer, false)}
                ]
            }

            label.CUGI_PREPROCESS = (item) => {
                item.text = artimus.translate(item.translationKey || item.key || item.text, "layerDropdown") || item.text || item.key;
                return item;
            }

            //This button changes depending on whether or not the layer was hidden
            const hideButton = document.createElement("button");
            hideButton.className = "artimus-button artimus-layerButton";
            hideButton.appendChild(artimus.elementFromString(artimus.hideIcon));
            hideButton.onclick = () => {
                this.setLayerVisibility(element.targetLayer, !this.getLayerVisibility(element.targetLayer));
                hideButton.className = "artimus-button artimus-layerButton " + ((this.getLayerVisibility(element.targetLayer)) ? "" : "artimus-button-selected")
                
                this.dirty = true;
            }

            hideButton.children[0].classList = "artimus-hideIcon";

            //This is the thing that holds the buttons that allow 
            // you to move the layer up and down, 
            // I may replace this with a drag and drop thing in the future
            const layerButtonHolder = document.createElement("div");
            layerButtonHolder.className = "artimus-layerButtonHolder";

            const upButton = document.createElement("button");
            upButton.className = "artimus-button artimus-layerButton artimus-layerButton-thin";
            upButton.appendChild(artimus.elementFromString(artimus.defaultArrow));
            upButton.onclick = () => {
                this.moveLayer(element.targetLayer, 1);
            }

            upButton.children[0].classList = "artimus-layerArrow artimus-layerArrow-up";

            const downButton = document.createElement("button");
            downButton.className = "artimus-button artimus-layerButton artimus-layerButton-thin";
            downButton.appendChild(artimus.elementFromString(artimus.defaultArrow));
            downButton.onclick = () => {
                this.moveLayer(element.targetLayer, -1);
            }

            downButton.children[0].classList = "artimus-layerArrow artimus-layerArrow-down";

            layerButtonHolder.appendChild(upButton);
            layerButtonHolder.appendChild(downButton);

            element.appendChild(hideButton);
            element.appendChild(layerButtonHolder);
            element.appendChild(label);

            return element;
        }

        setLayerVisibility(ID, to) {
            ID = this.getLayerIndex(ID);

            if (typeof ID == "number") this.layers[ID].visibility = to == true;
        }

        getLayerVisibility(ID) {
            ID = this.getLayerIndex(ID);

            if (typeof ID == "number") return this.layers[ID].visibility;
            return false;
        }

        moveLayer(ID, by) {
            ID = this.getLayerIndex(ID);

            if (typeof ID == "number") {
                const target = ID + by;
                if (target < 0 || target >= this.layers.length) return;

                const elFrom = this.layers[ID].element;
                const elTo = this.layers[target].element;

                const layerFrom = this.layers[ID];
                const layerTo = this.layers[target];

                this.layers[ID] = layerTo;
                this.layers[target] = layerFrom;

                elFrom.positionID = target;
                elTo.positionID = ID;

                if (ID == this.currentLayer) {
                    this.#currentLayer = target;
                }
                else if (target == this.currentLayer) {
                    this.#currentLayer = ID;
                }

                const parent = elFrom.parentElement;

                if (ID == target - 1) {
                    parent.removeChild(elTo);
                    parent.insertBefore(elTo, elFrom);
                }
                else if (target == ID - 1) {
                    parent.removeChild(elFrom);
                    parent.insertBefore(elFrom, elTo);  
                }
                else {
                    parent.removeChild(elFrom);
                    parent.removeChild(elTo);

                    if (target + 1 >= this.layers.length) parent.appendChild(elFrom);
                    else parent.insertBefore(elFrom, this.layers[target + 1].element);

                    if (ID + 1 >= this.layers.length) parent.appendChild(elTo);
                    else parent.insertBefore(elTo, this.layers[ID + 1].element);
                }
            }
        }

        updateLayer(ID, then) {
            return new Promise((resolve, reject) => {
                ID = this.getLayerIndex(ID);

                if (typeof ID == "number") {
                    this.layers[ID].updateBitmap().then(newBitmap => {
                        if (then) then(newBitmap);
                        resolve(newBitmap);
                        this.dirty = true;
                    });
                }
                else {
                    reject(`Couldn't find or update layer ${ID}`);
                }
            });
        }

        colorsOfLayer(ID, includeAlpha) {
            ID = this.getLayerIndex(ID);

            if (typeof ID == "number") {
                const dataRaw = this.layers[ID].dataRaw;

                includeAlpha = (typeof includeAlpha == "boolean") ? includeAlpha : true;

                //Faster than a generator and a map.filter to use data.reduce
                let layerColours = dataRaw.data.reduce((ac, _, ind) => {
                    //Check for two things, we are the R value, and that we aren't alpha if we are not looking for alpha
                    if (ind % 4 == 0 && (includeAlpha || dataRaw.data[ind + 3] > 0)) ac.add((
                        ((includeAlpha) ? (dataRaw.data[ind + 3] << 24 >>> 0) : 0) + 
                        (dataRaw.data[ind + 2] << 16 >>> 0) + 
                        (dataRaw.data[ind + 1] << 8 >>> 0) + 
                        dataRaw.data[ind]
                    ));
                    return ac;
                }, new Set());

                //Map the value back. ^ up there is really noisy
                if (includeAlpha) {
                    layerColours = [...layerColours].map((val) => [
                        val & 0x000000ff,
                        (val & 0x0000ff00) >>> 8,
                        (val & 0x00ff0000) >>> 16,
                        (val & 0xff000000) >>> 24
                    ]);
                }
                else {
                    layerColours = [...layerColours].map((val) => [
                        val & 0x000000ff,
                        (val & 0x0000ff00) >>> 8,
                        (val & 0x00ff0000) >>> 16
                    ]);
                }

                return layerColours;
            }

            return [];
        }

        //Legacy history function
        updateLayerHistory() {
            this.addHistoricalEvent("imageChange", {
                data: this.editGL.getImageData(0, 0, this.width, this.height),
                rect: [0, 0, this.width, this.height]
            });
        }

        transferLayerData(from, to) {
            to.name = from.name;
            to.element = from.element;
            to.label = from.label;
        }

        renameLayer(ID, name) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                this.sendEvent("layerRenamed", { layer: this.layers[ID], id: ID, oldName: this.layers[ID].name, name: name });
                this.layers[ID].rename(name);
            }
        }

        resizeLayerByRect(ID, x, y, width, height, editingData) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                this.layers[ID].resizeByRect(ID == this.currentLayer, x, y, width, height, editingData);
            }
        }

        resizeLayerByAnchor(ID, anchor, width, height, editingData) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                this.layers[ID].resizeByAnchor(ID == this.currentLayer, anchor, width, height, editingData);
            }
        }

        removeLayer(ID) {
            //Make sure we don't remove our only layer
            if (this.layers.length <= 1) return;

            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (ID == this.currentLayer) return;

            if (typeof ID == "number") {
                if (this.#currentLayer > ID) {
                    this.#currentLayer -= 1;
                }

                this.layers[ID].dispose(ID);
                this.sendEvent("layerRemoved", { layerID: ID });
            }
        }

        layerExists(name) {
            return this.layers.findIndex((layer) => layer.name == name) != -1;
        }

        cropToSelection() {
            //Relatively simple, check for a selection then call resize with the crop mode.
            if (this.hasSelection) this.resizeByRect(
                this.selectionMinX,
                this.selectionMinY,
                this.selectionMaxX - this.selectionMinX + 1,
                this.selectionMaxY - this.selectionMinY + 1,
            );
        }

        //Resizing in style
        resize(width, height, anchor) { 
            if (anchor) this.resizeByAnchor(width, height, anchor);
            else this.resizeByRect(0, 0, width, height);
        }

        _resizeCanvases(width, height) {
            //Clear the selection if we have one
            this.clearSelection();

            //Get editing data before resizing due to resizing removing all image data;
            const editingData = (this.editGL) ? this.editGL.getImageData(0, 0, this.width, this.height) : null;

            this.#width = width;
            this.#height = height;

            this.canvas.width = width;
            this.canvas.height = height;

            this.previewCanvas.width = width;
            this.previewCanvas.height = height;
            
            this.editingCanvas.width = width;
            this.editingCanvas.height = height;
            
            this.compositeCanvas.width = width;
            this.compositeCanvas.height = height;

            //Finally set smoothing
            this.previewGL.imageSmoothingEnabled = false;
            this.compositeGL.imageSmoothingEnabled = false;
            this.editGL.imageSmoothingEnabled = false;

            return editingData;
        }

        _updateTextures() {
            this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.compositeTexture);
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.compositeCanvas);

            this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.previewTexture);
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.previewCanvas);

            this.GL.bindTexture(this.GL.TEXTURE_2D, this.webgl.hiddenTexture);
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.editingCanvas);
        }

        resizeByRect(x, y, width, height) {
            if (x < 0 || typeof x != "number") x = 0;
            else if (x >= this.width) x = this.width - 1;

            if (y < 0 || typeof y != "number") x = 0;
            else if (y >= this.height) y = this.height - 1;

            if (width < 1 || typeof width != "number") width = 1;
            if (height < 1 || typeof height != "number") height = 1;

            const editingData = this._resizeCanvases(width, height);
            for (let index = 0; index < this.layers.length; index++) {
                this.resizeLayerByRect(index, x, y, this.#width, this.#height, editingData);
            }

            //Update textures
            this._updateTextures();
            this.dirty = true;
            this.sendEvent("resized", { x: x, y: y, width: width, height: height, type: "rect"});
        }

        resizeByAnchor(width, height, anchor) {
            //Get anchor data
            anchor = anchor || artimus.resizeAnchors.TOP_LEFT;
            if (!Array.isArray(anchor)) anchor = artimus.resizeAnchors[anchor] || artimus.resizeAnchors.TOP_LEFT

            //Copy the data
            anchor = [...(anchor)];

            if (width < 1 || typeof width != "number") width = 1;
            if (height < 1 || typeof height != "number") height = 1;

            const editingData = this._resizeCanvases(width, height);
            for (let index = 0; index < this.layers.length; index++) {
                this.resizeLayerByAnchor(index, anchor, this.#width, this.#height, editingData);
            }

            this.scrollX = this.scrollX;
            this.scrollY = this.scrollY;
            this.updatePosition();

            //Update textures
            this._updateTextures();
            this.dirty = true;
            this.sendEvent("resized", { width: width, height: height, anchor: anchor, type: "anchor"});
        }

        undo() {
            if (this.toolFunction.undo && this.toolFunction.undo(this.editGL, this.previewGL, this.toolProperties)) return true;

            if (this.historyIndex >= this.history.length - 1) return;
            this.historyIndex++;

            this.editGL.putImageData(this.history[this.historyIndex], 0, 0);
            this.dirty = true;

            this.sendEvent("undo", { historyIndex: this.historyIndex });
        }

        redo() {
            if (this.toolFunction.redo && this.toolFunction.redo(this.editGL, this.previewGL, this.toolProperties)) return true;

            if (this.historyIndex <= 0) return;
            this.historyIndex--;

            this.editGL.putImageData(this.history[this.historyIndex], 0, 0);
            this.dirty = true;

            this.sendEvent("redo", { historyIndex: this.historyIndex });
        }

        addHistoricalEvent(type, data) {
            if (this.historyIndex > 0) {
                this.history.splice(0, this.historyIndex);
            }

            this.historyIndex = 0;
            this.history.splice(0, 0, new artimus.historicalEvent(type, data, this));
            if (this.history.length > artimus.maxHistory) {
                this.history.pop();
            }
        }

        copy() {
            let toCopy = [];
            let imgData = {};
            
            //Get data we want to copy, and if possible copy over the selection
            if (!this.hasSelection) {
                imgData = this.editGL.getImageData(0, 0, this.width, this.height);
                toCopy.push( 0, 0, 0 );
            }
            else {
                imgData = this.editGL.getImageData(
                    this.selectionMinX, this.selectionMinY,
                    this.selectionMaxX - this.selectionMinX + 1,
                    this.selectionMaxY - this.selectionMinY + 1
                );

                const selection = editor.workspace.selection;

                toCopy.push(
                    (selection.length >> 16),
                    ((selection.length >> 8) & 255),
                    (selection.length & 255)
                )

                for (let i = 0; i < selection.length; i++) {
                    toCopy.push(
                        ((selection[i] >> 8) & 255),
                        (selection[i] & 255),
                    );
                }
            }

            //Now we can copy over the actual image data;
            toCopy.push(
                ((imgData.width >> 8) & 255),
                (imgData.width & 255),
                ((imgData.height >> 8) & 255),
                (imgData.height & 255)
            )

            //It's quick and dirty but it contains the image and selection data.
            for (let i = 0; i < imgData.data.length; i++) { toCopy.push(imgData.data[i]); }

            //Now convert it to a hex string;
            let final = "";
            for (let i = 0; i < toCopy.length; i++) {
                final += artimus.hexArray[(toCopy[i] >> 4) & 15];
                final += artimus.hexArray[toCopy[i] & 15];
            };            

            //Now convert it to a base64 string;
            navigator.clipboard.writeText(artimus.clipboardMagic + final);
            //This is utterly stupid. Why is octet stream not supported to write on web browsers?
            this.sendEvent("copy", { copied: toCopy, hex: final });
        }

        paste() {
            //Pasting from the ascii copy/paste
            const textPaste = () => {
                navigator.clipboard.readText().then((text) => {
                    if (text.startsWith(artimus.clipboardMagic)) {
                        //Parse the data
                        const returned = text.substring(artimus.clipboardMagic.length, text.length);
                        const data = [];
                        for (let i = 0; i < returned.length; i+=2) { data.push(Number(`0x${returned.charAt(i)}${returned.charAt(i+1)}`)); }

                        //Now finally read it out
                        let idx = 2;
                        const selectionLength = (data[0] << 16) + (data[1] << 8) + data[2];
                        const selectionPath = [];

                        //Read out the selection data, and set it.
                        for (let i = 0; i < selectionLength; i++) {
                            selectionPath.push((data[idx + 1] << 8) + (data[idx + 2]));
                            idx += 2;
                        }

                        //Calculate size and read pixel data.
                        const width = (data[idx + 1] << 8) + (data[idx + 2]);
                        const height = (data[idx + 3] << 8) + (data[idx + 4]);
                        idx += 4;

                        let pixelData = [];
                        for (let i = 0; i < width*height*4; i++) {
                            pixelData.push(data[idx+1]);
                            idx++;
                        }

                        //Create the bitmap, and then use the selection.
                        createImageBitmap(new ImageData(new Uint8ClampedArray(pixelData), width, height)).then(bitmap => {
                            let sizeMultiplier = 1;

                            //Size down if needed to fit, but allow the user to scale up.
                            if (bitmap.width > this.width || bitmap.height > this.height) {
                                if (bitmap.width > this.width) sizeMultiplier = this.width / bitmap.width;
                                if (bitmap.height * sizeMultiplier > this.#height) sizeMultiplier *= this.height / (bitmap.height * sizeMultiplier);
                            }
                                
                            //Supress selection function and select the preferred move tool.
                            this.suppressSelectionFunction = true;
                            this.tool = artimus.preferredMoveTool;
                            this.selection = selectionPath;

                            //Then run onPaste if available.
                            if (this.toolFunction && this.toolFunction.paste) this.toolFunction.paste(this.GL, this.previewGL, bitmap, sizeMultiplier, this.toolProperties);

                            this.suppressSelectionFunction = false;

                            this.sendEvent("paste", { bitmap: bitmap, mode: "text" });
                        });
                    }
                })
            }

            //Make sure the browser supports readText
            if (navigator.clipboard.read) {
                navigator.clipboard.read().then((result) => {
                    let imageType = "";
                    let imageID = 0;

                    for (let itemID in result) {
                        const item = result[itemID];
                        const imageIndex = item.types.findIndex((item) => item.startsWith("image/"));
                        if (imageIndex != -1) {
                            imageID = itemID;
                            imageType = item.types[imageIndex];
                            break;
                        }
                    }

                    if (imageType) {
                        const item = result[imageID];
                        const performPaste = () => {
                            item.getType(imageType).then((imageBlob) => createImageBitmap(imageBlob).then(bitmap => {
                                    //Clear the selection then find the new bounds;
                                    this.clearSelection();
                                    let sizeMultiplier = 1;

                                    //Size down if needed to fit, but allow the user to scale up.
                                    if (bitmap.width > this.width || bitmap.height > this.height) {
                                        if (bitmap.width > this.width) sizeMultiplier = this.width / bitmap.width;
                                        if (bitmap.height * sizeMultiplier > this.#height) sizeMultiplier *= this.height / (bitmap.height * sizeMultiplier);
                                    }
                                
                                    //Supress selection function and select the preferred move tool.
                                    this.suppressSelectionFunction = true;
                                    this.tool = artimus.preferredMoveTool;

                                    //Set the new selection
                                    this.setSelection([
                                        0, 0,
                                        0, bitmap.height * sizeMultiplier,
                                        bitmap.width * sizeMultiplier, bitmap.height * sizeMultiplier,
                                        bitmap.width * sizeMultiplier, 0
                                    ]);

                                    //Then run onPaste if available.
                                    if (this.toolFunction && this.toolFunction.paste) this.toolFunction.paste(this.GL, this.previewGL, bitmap, sizeMultiplier, this.toolProperties);

                                    this.suppressSelectionFunction = false;
                                })
                            );

                            this.sendEvent("paste", { item: item, mode: "image" });
                        }

                        //If we prefer a new layer use a new layer.
                        if (artimus.preferredPasteLayer == "new") {
                            const layer = this.createLayer("Pasted", true);
                            this.setLayer(layer.name).then(performPaste);
                        }
                        else performPaste();
                        
                    }
                    else textPaste();
                })
                .catch((err) => {
                    console.error("Can't read clipboard!\n", err);
                })
            }
            else textPaste();
        }

        new(width, height, then) {
            this.scrollX = 0;
            this.scrollY = 0;

            //Remove layers
            this.#currentLayer = 0;
            for (let ID = this.layers.length - 1; ID > 0; ID--) {
                this.removeLayer(Number(ID));
            }

            //Then clear our current layer
            this.editGL.clearRect(0, 0, this.width, this.height);
            this.updateLayer(this.#currentLayer, () => {
                this.resize(width, height);
                this.currentLayer = 0;

                if (then) then();
            });

            this.historyIndex = 0;
            this.history = [];
            this.fileSystemHandle = null;

            this.sendEvent("new", { width: width, height: height });
        }
        
        //Artimus Files
        //==-- MODES --==//
        //0 : Standard : All colours 6 bytes per strip
        //      COUNT : 2 bytes
        //      COLOR : 4 bytes
        //1 : 256 palette : 256 colours max, 3 bytes per strip, beginning header with 1 + n bytes
        //      -- Header
        //      COLORS : 1 byte
        //      PALETTE : N * 4 bytes
        //      -- Contents
        //      COUNT : 2 bytes
        //      COLOR : 1 byte
        //2 : Single Color : 1 colour max, yknow this one is self explanitory...
        //     COLOR : 4 bytes
        //3 : Single Color, w alpha : 1 colour max, yknow this one is self explanitory...
        //      -- Header
        //      COLOR : 3 bytes
        //      -- Contents
        //      COUNT : 2 bytes
        //      ALPHA : 1 byte
        encodingModes = [
            //FC
            (data, bytesPerLayer, palette, colours) => {
                let colour = [-1, -1, -1, -1];
                let count = 0;
                let savedBytes = 0;

                for (let i = 0; i < bytesPerLayer; i+=4) {
                    //Count colours
                    if ((
                        colour[0] == colours[i] &&
                        colour[1] == colours[i + 1] &&
                        colour[2] == colours[i + 2] &&
                        colour[3] == colours[i + 3]) &&
                        (count + 1) < Math.pow(2, 16)
                    ) count++;
                    else {
                        //If the colour is not the same, or we are almost out of space we can begin anew
                        if (count > 0) {
                            data.push(
                                (count & 0xff00) >> 8,
                                (count & 0x00ff),

                                ...colour
                            )
                        }
                        
                        savedBytes += 6;

                        //The begin anew part
                        colour = [colours[i], colours[i + 1], colours[i + 2], colours[i + 3]];
                        count = 1;
                    }
                }

                //Push the data once we hit the edge
                data.push(
                    (count & 0xff00) >> 8,
                    (count & 0x00ff),

                    ...colour
                )

                savedBytes += 6;
                return savedBytes;
            },
            
            //256 color
            (data, bytesPerLayer, palette, colours) => {
                let colour = [-1, -1, -1, -1];
                let count = 0;
                let savedBytes = 0;

                //Start from 0 to get full range
                data.push(palette.length - 1);
                data.push(palette.flat(1));

                for (let i = 0; i < bytesPerLayer; i+=4) {
                    //Count colours
                    if ((
                        colour[0] == colours[i] &&
                        colour[1] == colours[i + 1] &&
                        colour[2] == colours[i + 2] &&
                        colour[3] == colours[i + 3]) &&
                        (count + 1) < Math.pow(2, 16)
                    ) count++;
                    else {
                        //If the colour is not the same, or we are almost out of space we can begin anew
                        if (count > 0) {
                            data.push(
                                (count & 0xff00) >> 8,
                                (count & 0x00ff),

                                palette.findIndex((val) => (
                                    val[0] == colour[0] && 
                                    val[1] == colour[1] &&
                                    val[2] == colour[2] &&
                                    val[3] == colour[3]
                                ))
                            )
                        }
                        
                        savedBytes += 6;

                        //The begin anew part
                        colour = [colours[i], colours[i + 1], colours[i + 2], colours[i + 3]];
                        count = 1;
                    }
                }

                //Push the data once we hit the edge
                data.push(
                    (count & 0xff00) >> 8,
                    (count & 0x00ff),

                    palette.findIndex((val) => (
                        val[0] == colour[0] && 
                        val[1] == colour[1] &&
                        val[2] == colour[2] &&
                        val[3] == colour[3]
                    ))
                )

                savedBytes += 6;
                return savedBytes;
            },

            //1 Color... pretty simple
            (data, bytesPerLayer, palette, colours) => {
                data.push(...palette[0]);
                return 4;
            },

            //1 color with alpha channel
            (data, bytesPerLayer, palette, colours) => {
                let alpha = -1;
                let count = 0;
                let savedBytes = 0;

                //Start from 0 to get full range
                data.push(...palette[0]);

                for (let i = 0; i < bytesPerLayer; i+=4) {
                    //Count colours
                    if ((alpha == colours[i + 3]) &&
                        (count + 1) < Math.pow(2, 16)
                    ) count++;
                    else {
                        //If the alpha is not the same, or we are almost out of space we can begin anew
                        if (count > 0) {
                            data.push(
                                (count & 0xff00) >> 8,
                                (count & 0x00ff),
                                alpha
                            )
                        }
                        
                        savedBytes += 7;

                        //The begin anew part
                        alpha = colours[i + 3];
                        count = 1;
                    }
                }

                //Push the data once we hit the edge
                data.push(
                    (count & 0xff00) >> 8,
                    (count & 0x00ff),
                    alpha
                )

                savedBytes += 6;
                return savedBytes;
            }
        ]

        //These align with encoding modes
        decodingModes = [
            (data, imageData, index, bytesPerLayer) => {
                let filled = 0;

                while (filled < bytesPerLayer) {
                    const stripSize = (data[index + 1] << 8) + (data[index + 2]);
                    const stripColor = [
                        data[index + 3],
                        data[index + 4],
                        data[index + 5],
                        data[index + 6]
                    ];

                    let extended = Array(stripSize);
                    extended.fill(stripColor);
                    imageData.set(extended.flat(2), filled);
                    filled += stripSize * 4;

                    index += 6;
                }

                return index;
            },
            
            (data, imageData, index, bytesPerLayer) => {
                let filled = 0;

                const palette = [];
                const paletteSize = data[index + 1] + 1;

                index++;
                for (let i = 0; i < paletteSize; i++) { 
                    palette.push([data[index + 1], data[index + 2], data[index + 3], data[index + 4]]);
                    index += 4;
                }

                while (filled < bytesPerLayer) {
                    const stripSize = (data[index + 1] << 8) + (data[index + 2]);

                    let extended = Array(stripSize);
                    extended.fill(palette[data[index + 3]]);
                    imageData.set(extended.flat(2), filled);
                    filled += stripSize * 4;

                    index += 3;
                }

                return index;
            },

            (data, imageData, index, bytesPerLayer) => {
                const colour = [data[index + 1], data[index + 2], data[index + 3], data[index + 4]]

                let extended = Array(bytesPerLayer / 4);
                extended.fill(colour);
                imageData.set(extended.flat(2), 0);

                return index + 4;
            },
            
            (data, imageData, index, bytesPerLayer) => {
                let filled = 0;

                const colour = [data[index + 1], data[index + 2], data[index + 3]]
                index += 3;

                while (filled < bytesPerLayer) {
                    const stripSize = (data[index + 1] << 8) + (data[index + 2]);

                    let extended = Array(stripSize);
                    extended.fill([...colour, data[index + 3]]);
                    imageData.set(extended.flat(2), filled);
                    filled += stripSize * 4;

                    index += 3;
                }

                return index;
            },
        ]

        //These align with the artimus format
        layerReaders = [
            1, //Numbers redirect so 0 would redirect to 1
            (data, layer, width, height, bytesPerLayer, index) => {
                //Decode name and blend mode
                const nameLength = (data[index + 1] << 16) + (data[index + 2] << 8) + (data[index + 3]);
                const blendMode = artimus.blendModes[data[index + 4]];
                index += 4;

                //Extract name bytes and decode
                let name = [];
                for (let i = 0; i < nameLength; i++) {
                    name.push(data[index + i + 1]);
                }

                index += name.length;
                name = this.tDecoder.decode(new Uint8Array(name));

                //Parse the image now
                let imageData = new Uint8ClampedArray(bytesPerLayer);
                let filled = 0;

                while (filled < bytesPerLayer) {
                    const stripSize = (data[index + 1] << 8) + (data[index + 2]);
                    const stripColor = [
                        data[index + 3],
                        data[index + 4],
                        data[index + 5],
                        data[index + 6]
                    ];

                    let extended = Array(stripSize);
                    extended.fill(stripColor);
                    imageData.set(extended.flat(2), filled);
                    filled += stripSize * 4;

                    index += 6;
                }

                this.createLayer(name, true);

                //Set layer data
                this.layers[layer + 1].dataRaw = new ImageData(imageData, width, height);
                this.layers[layer + 1].blendMode = blendMode;

                this.updateLayer(layer + 1);

                return index;
            },
            //Format v2
            (data, layer, width, height, bytesPerLayer, index) => {
                //Decode name and blend mode
                const nameLength = (data[index + 1] << 16) + (data[index + 2] << 8) + (data[index + 3]);
                const encodingMode = data[index + 4];
                const blendMode = artimus.blendModes[data[index + 5]];
                index += 5;

                //Extract name bytes and decode
                let name = [];
                for (let i = 0; i < nameLength; i++) {
                    name.push(data[index + i + 1]);
                }

                index += name.length;
                name = this.tDecoder.decode(new Uint8Array(name));

                //Parse the image now
                let imageData = new Uint8ClampedArray(bytesPerLayer);
                
                index = this.decodingModes[encodingMode](data, imageData, index, bytesPerLayer);

                this.createLayer(name, true);

                //Set layer data
                this.layers[layer + 1].dataRaw = new ImageData(imageData, width, height);
                this.layers[layer + 1].blendMode = blendMode;

                this.updateLayer(layer + 1);

                return index;
            },
            //Format v3
            (data, layer, width, height, bytesPerLayer, index) => {
                //Decode name and blend mode
                const nameLength = (data[index + 1] << 16) + (data[index + 2] << 8) + (data[index + 3]);
                const encodingMode = data[index + 4];
                const visibility = data[index + 5] == 1;
                const blendMode = artimus.blendModes[data[index + 6]];
                index += 6;

                //Extract name bytes and decode
                let name = [];
                for (let i = 0; i < nameLength; i++) {
                    name.push(data[index + i + 1]);
                }

                index += name.length;
                name = this.tDecoder.decode(new Uint8Array(name));

                //Parse the image now
                let imageData = new Uint8ClampedArray(bytesPerLayer);
                
                index = this.decodingModes[encodingMode](data, imageData, index, bytesPerLayer);

                this.createLayer(name, true);

                //Set layer data
                this.layers[layer + 1].dataRaw = new ImageData(imageData, width, height);
                this.layers[layer + 1].blendMode = blendMode;

                this.updateLayer(layer + 1);
                this.setLayerVisibility(layer + 1, visibility);

                return index;
            },

            //Format v4
            (data, layer, width, height, bytesPerLayer, index) => {
                //Decode name and blend mode
                const nameLength = (data[index + 1] << 16) + (data[index + 2] << 8) + (data[index + 3]);
                const encodingMode = data[index + 4];
                const visibility = data[index + 5] == 1;
                const blendMode = artimus.blendModes[data[index + 6]];
                const alpha = data[index + 7] / 255;
                index += 7;

                //Extract name bytes and decode
                let name = [];
                for (let i = 0; i < nameLength; i++) {
                    name.push(data[index + i + 1]);
                }

                index += name.length;
                name = this.tDecoder.decode(new Uint8Array(name));

                //Parse the image now
                let imageData = new Uint8ClampedArray(bytesPerLayer);
                
                index = this.decodingModes[encodingMode](data, imageData, index, bytesPerLayer);

                this.createLayer(name, true);

                //Set layer data
                this.layers[layer + 1].dataRaw = new ImageData(imageData, width, height);
                this.layers[layer + 1].blendMode = blendMode;
                this.layers[layer + 1].alpha = alpha;

                this.updateLayer(layer + 1);
                this.setLayerVisibility(layer + 1, visibility);

                return index;
            },
        ];
        
        importArtimus(input, replaceFile) {
            const data = new Uint8Array(input);

            //Make sure it is an artimus image
            if (
                data[0] == artimus.magic[0] &&
                data[1] == artimus.magic[1] &&
                data[2] == artimus.magic[2] &&
                data[3] == artimus.magic[3]
            ) {
                const handleImport = () => {
                    //Calculate size based upon the Tri-fecta.
                    const width = (data[5] << 16) + (data[6] << 8) + (data[7]);
                    const height = (data[8] << 16) + (data[9] << 8) + (data[10]);

                    //If we are replacing the file resize.
                    if (replaceFile) this.resize(width, height);

                    //Count bytes
                    const bytesPerLayer = width * height * 4;
                    const layerCount = (data[11] << 8) + data[12];
                    const format = (data[4]);

                    console.log(`Artimus format is ${format}!`);

                    let idx = 12;

                    //layer 1 is set to NaN as to not confuse it with an actual layer
                    if (replaceFile) this.layers[0].name = NaN;
                    
                    //Loop through layers, and read them with whatever format of reader is needed;
                    let layerReader = this.layerReaders[format];
                    if (typeof layerReader == "number") this.layerReaders[layerReader];
                    if (typeof layerReader != "function") {
                        console.log(`Invalid layer reader ${layerReader} with origin of ${this.layerReaders[format]} on format ${format}`);
                        return;
                    }

                    const fileLayers = this.layers.length;
                    
                    //Prevent recalculation of for loop ending.
                    const forEnd = (replaceFile ? layerCount : layerCount+fileLayers-1);
                    for (let layer = (replaceFile ? 0 : this.layers.length-1); layer < forEnd; layer++) {
                        idx = layerReader(data, layer, width, height, bytesPerLayer, idx);
                    }

                    if (replaceFile) this.setLayer(1).then(() => {
                        this.removeLayer(0)
                        this.setLayer(0);
                    });

                    if (
                        data[idx + 1] == artimus.jsonMagic[0] &&
                        data[idx + 2] == artimus.jsonMagic[1] &&
                        data[idx + 3] == artimus.jsonMagic[2] &&
                        data[idx + 4] == artimus.jsonMagic[3]
                    ) {
                        idx += 4;
                        
                        try {
                            const parsed = JSON.parse(this.tDecoder.decode(data.slice(idx + 1, data.length)));
                            this.projectStorage = parsed;
                        } catch (error) {
                            console.error("Json header could possibly be corrupted :(");
                        }
                    }


                }

                if (replaceFile) this.new(
                (data[5] << 16) + (data[6] << 8) + (data[7]),
                (data[8] << 16) + (data[9] << 8) + (data[10]),
                handleImport
                );
                else handleImport();

                this.sendEvent("import", { file: input });
            }
            else console.error("Artimus File invalid!");
        }

        exportArtimus() {
            return new Promise((resolve, reject) => {
                //Just a simple measure of how many bytes we will need to take up
                let bytesPerLayer = this.width * this.height * 4;
                const layerCount = this.layers.length;
                
                //==-- HEADER FORMAT --==//
                //Magic  : 4 bytes : Should be COFE
                //Format : 1 byte  : For versioning and revisions
                //Width  : 3 bytes
                //Height : 3 bytes
                //Layers : 2 bytes
                let data = new Array(
                    ...artimus.magic,
                    4,
                    
                    //Conver both width and height into their 3 byte components
                    (this.width & 0xff0000) >> 16,
                    (this.width & 0x00ff00) >> 8,
                    (this.width & 0x0000ff),
                    
                    (this.height & 0xff0000) >> 16,
                    (this.height & 0x00ff00) >> 8,
                    (this.height & 0x0000ff),

                    //And the layer count
                    (layerCount & 0xff00) >> 8,
                    (layerCount & 0x00ff),
                );

                //==-- LAYER FORMAT --==//
                //Name Length : 3 bytes : Nobody should be more than 16777216 bytes... Right?
                //Encoding Mode : 1 byte
                //Visibility    : 1 byte : Will probably be shared with individual transparency in the future
                //Blend Mode  : 1 byte
                //Alpha : 1 byte : snaps to, could make more precise in the future if need be (100/255)
                //Name String : N bytes
                //Data        : A bytes
                for (let layerID in this.layers) {
                    const {name, blendMode, dataRaw, visibility, alpha} = this.layers[layerID];
                    const encodedName = this.tEncoder.encode(name);

                    //Get colors for determining an encoding method. See VV for a list
                                                                //==-- MODES --==//
                    let layerColours = this.colorsOfLayer(Number(layerID));
                    let noAlphaColours = this.colorsOfLayer(Number(layerID), false);
                    let preferAlpha = true;

                    //Find the mode finally
                    let encodingMode = 0;
                    if (layerColours.length == 1) encodingMode = 2; // Solid colour
                    else if (noAlphaColours.length == 1) { preferAlpha = false; encodingMode = 3; }// Single Colour w Alpha
                    else if (layerColours.length <= 256) encodingMode = 1; // Paletted

                    console.log(`Saving layer ${name} with mode ${encodingMode}`)
                    //Add layer header
                    data.push(
                        (encodedName.length & 0xff0000) >> 16,
                        (encodedName.length & 0x00ff00) >> 8,
                        (encodedName.length & 0x0000ff),
                        (encodingMode & 0xff),

                        (visibility) ? 1 : 0,

                        artimus.blendModes.indexOf(blendMode) || 0,
                        Math.max(Math.min(255, Math.floor(alpha * 255)), 0),
                        ...encodedName,
                    );

                    //Now parse the layer data
                    console.log(`Reading ${bytesPerLayer} bytes, for ${name}`);

                    const savedBytes = this.encodingModes[encodingMode](data, bytesPerLayer, (preferAlpha) ? layerColours : noAlphaColours, dataRaw.data) || "unknown";

                    console.log(`Layer ${name} compressed to ${savedBytes} bytes`);
                }

                data.push(
                    ...artimus.jsonMagic,

                    ...this.tEncoder.encode(JSON.stringify(this.projectStorage))
                )

                //With the slight, and somewhat strange compression I added above I'm sure this will be good
                const file = new Uint8Array(data.flat(5));
                this.fileReader.onload = () => {
                    resolve(this.fileReader.result);
                    this.sendEvent("export", { raw: file, format: "artimus", file: this.fileReader.result });
                };
                this.fileReader.readAsDataURL(new Blob([file]));
            });
        }

        //Image import export
        importTypes = {
            "artimus": "readAsArrayBuffer"
        };

        // Will be set upon file save/load
        fileSystemHandle = null;

        importFromImage(image, replaceFile) {
            let extension = image.name.split(".");
            extension = extension[extension.length - 1];
            
            this.fileReader.onload = () => { this.onImageLoad(this.fileReader.result, extension, replaceFile); };
            this.fileReader[this.importTypes[extension] || "readAsDataURL"](image);
            this.sendEvent("import", { file: image });
        }

        importFromPC(replaceFile) {
            // Not yet widely available, so we will need to check we can use the file system access API
            if (window.showSaveFilePicker) return window.showOpenFilePicker({
                id: "artimus_file_location",
                multiple: false,
                startIn: "documents",
                types: [
                    {
                        "image/*": [".png", ".gif", ".jpeg", ".jpg", ".artimus"]
                    }
                ]
            }).then(fsHandle => {
                this.fileSystemHandle = fsHandle[0];
                fsHandle[0].getFile().then(file => this.importFromImage(file, replaceFile));
                this.sendEvent("importLocal", { file: fsHandle[0] });
            });

            else {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*, .artimus";

                const filePromise = new Promise((resolve) => {
                    fileInput.onchange = () => {
                        this.importFromImage(fileInput.files[0], replaceFile);
                        this.sendEvent("importLocal", { file: fileInput.files[0] });
                        resolve();
                    };
                    fileInput.onError = () => { console.log('file load error wow'); }
                });

                fileInput.click();
                return filePromise;
            }
        }

        onImageLoad(data, extension, replaceFile) {
            switch (extension) {
                case "art":
                case "artimus":
                    this.importArtimus(data, replaceFile);
                    break;
            
                default:
                    const image = new Image();
                    image.onload = () => {
                        if (replaceFile) this.new(image.width, image.height, () => {
                            this.setLayer(0, () => {
                                this.editGL.drawImage(image, 0, 0);
                            });
                        });

                        else {
                            this.createLayer(`Layer ${this.layers.length+1}`, false);
                            this.setLayer(this.layers.length-1, () => {
                                this.editGL.drawImage(image, 0, 0, image.width, image.height); // Todo: Maybe prompt about resizing the canvas?
                            });
                        }
                    }

                    image.src = data;
                    break;
            }
        }

        export(format, options) {
            options = Object.assign({
                sizeMul: 1,
                background: false,
                backgroundColor: "#000000",
                quality: 1
            }, options);

            return new Promise((resolve, reject) => {
                format = format || "artimus";

                //Just render the frame, and update the layer
                this.renderComposite(true);

                //Force update it aswell
                this.setLayer(this.currentLayer).then(() => {
                    switch (format) {
                        case "art":
                        case "artimus":
                            return this.exportArtimus().then(item => resolve(item));
                        
                        default:
                            artimus.exportCanvas.width = Math.max(1, Math.min(8192, this.width * options.sizeMul));
                            artimus.exportCanvas.height = Math.max(1, Math.min(8192, this.height * options.sizeMul));
                            artimus.exportGL.imageSmoothingEnabled = false;

                            artimus.exportGL.fillStyle = options.backgroundColor || "#000000";
                            if (options.background) artimus.exportGL.fillRect(0, 0, artimus.exportCanvas.width, artimus.exportCanvas.height);
                            else artimus.exportGL.clearRect(0, 0, artimus.exportCanvas.width, artimus.exportCanvas.height);

                            //Draw the final composite
                            artimus.exportGL.drawImage(this.compositeCanvas, 0, 0, artimus.exportCanvas.width, artimus.exportCanvas.height);

                            const dataURI = artimus.exportCanvas.toDataURL(artimus.extensionToMIME[format] || artimus.extensionToMIME.png, options.quality);
                            resolve(dataURI);
                            this.sendEvent("export", { raw: dataURI, format: format, options: options });
                            
                            //Reset export canvas and return;
                            artimus.exportCanvas.width = 1;
                            artimus.exportCanvas.height = 1;
                            return;
                    }
                });
            });
        }

        exportToPC(format, options) {
            format = format || "artimus";
            const { forceDialogue, name } = options || {};

            this.export(format, options).then(value => {
                // Not yet widely available, so we will need to check we can use the file system access API
                if (window.showSaveFilePicker) {
                    // Fetch the dataURL to convert it to a byte stream
                    fetch(value).then(response => response.arrayBuffer().then(async buffer => {
                        let fileName;
                        if (this.fileSystemHandle) fileName = (await this.fileSystemHandle.getFile()).name;

                        // Show the file system handle in the following conditions:
                        // The handle doesn't yet exist, so either we haven't saved yet or it hasn't been imported
                        // We want to force the dialogue, such as for changing the save location
                        // The file that the handle is pointing to is different than what we are saving, such as exporting a png
                        if (!this.fileSystemHandle || forceDialogue || fileName.slice(fileName.lastIndexOf(".")+1) !== format) {
                            window.showSaveFilePicker({
                                id: "artimus_file_location",
                                startIn: "documents",
                                suggestedName: `${name || "picture"}.${format}`,
                                types: [
                                    {
                                        accept: {
                                            "image/*": ["." + format]
                                        }
                                    }
                                ]
                            }).then(fsHandle => {
                                // Reuse the handler for .artimus files for convenience
                                if (format === "artimus") this.fileSystemHandle = fsHandle;
                                fsHandle.createWritable().then(async writableStream => {
                                    await writableStream.write(buffer);
                                    await writableStream.close();
                                    this.sendEvent("exportLocal", { raw: value, file: this.fileSystemHandle, name: name || "picture", format: format, options: options });
                                });
                            });
                        }
                        else {
                            this.fileSystemHandle.createWritable().then(async writableStream => {
                                await writableStream.write(buffer);
                                await writableStream.close();
                                this.sendEvent("exportLocal", { raw: value, file: this.fileSystemHandle, name: name || "picture", format: format, options: options });
                            });
                        }
                    }));
                }
                else {
                    // This browser doesn't support saving with a file system dialogue
                    const link = document.createElement("a");
                    link.href = value;
                    link.download = `${name || "picture"}.${format}`;
                    link.click();
                    this.sendEvent("exportLocal", { raw: value, name: name || "picture", format: format, options: options });
                }

            });
        }
    },

    activeWorkspaces: [],

    globalRefreshTools: () => {
        for (let workspaceID in artimus.activeWorkspaces) {
            artimus.activeWorkspaces[workspaceID].refreshTools();
        }
    },

    inject: (element) => {
        if (!(element instanceof HTMLElement)) return;

        const workspace = new artimus.workspace();
        element.appendChild(workspace.container);

        return workspace;
    }
}

artimus.exportCanvas.width = 1;
artimus.exportCanvas.height = 1;
artimus.exportGL = artimus.exportCanvas.getContext("2d");
//--\\    /dist/tools/paintBrush.js    //--\\
artimus.tools.paintBrush = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70.5" height="70.5" viewBox="0,0,70.5,70.5"> <g transform="translate(-204.75002,-144.75)">    <g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal">        <path d="M204.75003,215.25v-70.5h70.5v70.5z" fill="none" stroke-width="0"/>        <path d="M220.9868,205.17696c1.77179,-0.89842 3.45323,-2.83003 3.92284,-4.18449c0.48941,-2.20805 2.09187,-5.70927 4.03585,-6.94886c1.41138,-1.79045 6.7982,-2.72387 8.25105,-0.51354c3.63129,2.41038 4.42564,4.90457 4.65906,6.97496c0.87449,2.30301 -2.19833,6.25534 -4.02505,7.55363c-2.70649,1.77061 -6.09868,1.76254 -9.25182,2.13584c-3.36677,0.39859 -5.03047,-0.4888 -7.98273,-1.41774c-0.53432,-0.4212 -3.55958,-2.15572 -3.34232,-2.965c0.23096,-0.8603 2.73102,-0.52502 3.38089,-0.60196l0.28441,-0.03367c0,0 0.02808,-0.00332 0.06782,0.00082z" fill="currentColor" stroke-width="0.5"/>        <path d="M254.7307,185.57527c-5.41655,12.21861 -8.83657,10.44178 -13.17454,8.51874c-4.33797,-1.92303 -7.95119,-3.26405 -2.53464,-15.48266c5.41655,-12.21861 17.81172,-30.68787 22.14969,-28.76483c4.33797,1.92304 -1.02396,23.51014 -6.4405,35.72876z" fill="currentColor" stroke-width="0"/></g></g></svg><!--rotationCenter:35.249975000000006:35.25000499999999-->'; }
    
    checkForEraserMode(toolProperties) {
        if (toolProperties.strokeColor.length == 9 && toolProperties.strokeColor.endsWith("00")) toolProperties.isEraser = true;
        else toolProperties.isEraser = false;
    }

    eraserCircular(gl, x, y, toolProperties) {
        //No
        if (toolProperties.strokeSize < 5) {
            const radius = Math.floor(toolProperties.strokeSize / 2);
            const move = Math.floor(toolProperties.strokeSize)
            gl.clearRect(x - radius, y - radius, move, move);
            return;
        }

        const radius = Math.floor(toolProperties.strokeSize / 2);
        const stepSize = Math.max(1, 90 / toolProperties.strokeSize);

        for (let i = 0; i < 90; i+=stepSize) {
            const width = Math.round(Math.max(1, Math.sin(artimus.degreeToRad(i)) * radius));
            const height = Math.round(Math.max(1, Math.cos(artimus.degreeToRad(i)) * radius));
            gl.clearRect(x - width, y - height, width * 2, height * 2);
        }
    }

    drawCircular(gl, x, y, toolProperties) {
        //No
        if (toolProperties.strokeSize < 5) {
            const radius = Math.floor(toolProperties.strokeSize / 2);
            const move = Math.floor(toolProperties.strokeSize)
            gl.fillRect(x - radius, y - radius, move, move);
            return;
        }

        const radius = Math.floor(toolProperties.strokeSize / 2);
        const stepSize = Math.max(1, 90 / toolProperties.strokeSize);

        for (let i = 0; i < 90; i+=stepSize) {
            const width = Math.round(Math.max(1, Math.sin(artimus.degreeToRad(i)) * radius));
            const height = Math.round(Math.max(1, Math.cos(artimus.degreeToRad(i)) * radius));
            gl.fillRect(x - width, y - height, width * 2, height * 2);
        }
    }

    mouseDown(gl, x, y, toolProperties) {
        //if (toolProperties.pixelBrush) { x--; y--; };
        //Set stroke properties
        gl.lineCap = "round";
        gl.lineJoin = "round";
        gl.lineWidth = toolProperties.strokeSize;
        gl.strokeStyle = toolProperties.strokeColor;
        gl.fillStyle = toolProperties.strokeColor;

        this.checkForEraserMode(toolProperties);

        //Then start drawing
        this.linePos = [x,y];

        //The three types
        if (toolProperties.isEraser) this.eraserCircular(gl, x, y, toolProperties);
        else if (!toolProperties.pixelBrush) {
            gl.moveTo(x,y);
            gl.beginPath();
            gl.lineTo(x,y);
            gl.stroke();
        }
        else {
            this.drawCircular(gl, x, y, toolProperties);
        }
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        const linePos = this.linePos;
        let distance = 1 / Math.sqrt(Math.pow(linePos[0] - x, 2.0) + Math.pow(linePos[1] - y, 2.0));

        //Decide how we are drawing the line
        if (toolProperties.isEraser) {
            //Draw the line
            for (let i = 0; i < 1; i+=distance) {
                const rx = Math.floor((linePos[0] + (x - linePos[0]) * i));
                const ry = Math.floor((linePos[1] + (y - linePos[1]) * i));

                this.eraserCircular(gl, rx, ry, toolProperties);
            }
            
            this.linePos = [x,y];
        }
        else if (toolProperties.pixelBrush) {
            //Draw the line
            for (let i = 0; i < 1; i+=distance) {
                const rx = Math.floor((linePos[0] + (x - linePos[0]) * i));
                const ry = Math.floor((linePos[1] + (y - linePos[1]) * i));

                this.drawCircular(gl, rx, ry, toolProperties);
            }
            
            this.linePos = [x,y];
        }
        //Smooth brush
        else {
            //Assure we don't overdraw
            distance = 1 / distance;
            if (distance > 0.5) {
                gl.lineTo(x,y);
                gl.stroke();

                gl.closePath(); //! We do it in this order or else firefox throws a fit.
                gl.beginPath();
                gl.moveTo(x,y);
                this.linePos = [x,y];
            }
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (toolProperties.pixelBrush) { x++; y++; };
        if (!toolProperties.pixelBrush) {
            gl.lineTo(x,y);
            gl.stroke();
            gl.moveTo(x,y);
            gl.closePath();
        }

        this.linePos = null;
    }

    preview(gl, x, y, toolProperties) {
        //Set stroke properties
        gl.lineCap = "round";
        gl.lineJoin = "round";
        gl.lineWidth = toolProperties.strokeSize;
        gl.strokeStyle = toolProperties.strokeColor;
        gl.fillStyle = toolProperties.strokeColor;

        this.checkForEraserMode(toolProperties);

        //For the smooth brush
        if (toolProperties.isEraser && !this.linePos) {
            gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-inline");
            gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");
            gl.lineWidth = 2;

            gl.moveTo(x,y);
            gl.beginPath();
            if (toolProperties.strokeSize > 1) gl.arc(x, y, (toolProperties.strokeSize / 2) - 1, 0, Math.PI * 2);
            else gl.rect(x, y, 1, 1);
            gl.stroke();
            gl.fill();
            gl.closePath();
        }
        else if (!toolProperties.pixelBrush) {
            gl.moveTo(x,y);
            gl.beginPath();
            gl.lineTo(x,y);
            gl.lineTo(x + 0.1,y + 0.1);
            gl.stroke();
            gl.closePath();
        }
        else {
            this.drawCircular(gl, x, y, toolProperties)
        }
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "strokeColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
    ]}

    colorProperties = [ "strokeColor" ];

    properties = {
        strokeColor: "#000000",
        strokeSize: 2,
        pixelBrush: false,
    }
}
//--\\    /dist/tools/sprayPaint.js    //--\\
artimus.tools.sprayPaint = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="85.95915" height="85.95915" viewBox="0,0,85.95915,85.95915"><g transform="translate(-197.02043,-137.02043)"><g stroke="none" stroke-width="0" stroke-miterlimit="10"><g><path d="M237.56815,212.15798c-1.71311,-4.66548 -15.63394,-40.05941 -15.63394,-40.05941l27.42722,-10.07099c0,0 13.92083,35.39393 15.63394,40.05941c0.25281,0.68849 -0.24174,1.43369 -1.37758,1.85077c-0.68467,0.2514 -1.01017,1.99635 -1.98062,2.35269c-5.24208,1.92484 -13.95692,5.12483 -18.62006,6.83709c-1.21414,0.44582 -2.67954,-0.64153 -3.21152,-0.44619c-0.94966,0.34871 -1.98463,0.16513 -2.23744,-0.52337z" fill="currentColor"/><path d="M221.25298,165.90214c0,0 -4.14933,-11.30025 -5.24952,-14.29649c-0.50445,-1.3738 0.51595,-3.60024 1.77955,-4.06422c2.06485,-0.75819 8.36189,-3.0704 13.97208,-5.1304c4.94303,-1.81503 6.43572,2.85996 6.43572,2.85996c0,0 4.54577,-1.98006 5.47268,0.54425c1.14456,3.11708 3.83682,10.44916 3.83682,10.44916z" fill="currentColor"/><path d="M241.94457,155.56777l-2.54391,-6.92806l9.34051,-3.42974l2.54391,6.92806z" fill="currentColor"/><path d="M197.02043,222.97957v-85.95915h85.95915v85.95915z" fill="none"/></g></g></g></svg><!--rotationCenter:42.97957434003874:42.97957434003874-->'; }
    
    spray(gl, x, y, toolProperties) {
        for (let i = 0; i < toolProperties.points; i++) {
            const dist = (toolProperties.radius) * Math.pow(Math.random(), 2);
            const angle = Math.random() * (2 * Math.PI);

            const dx = x + Math.floor(Math.sin(angle) * dist);
            const dy = y + Math.floor(Math.cos(angle) * dist);

            gl.fillStyle = toolProperties.color;
            gl.fillRect(dx, dy, 1, 1);
        }
    }

    mouseDown (gl, x, y, toolProperties) { this.spray(gl, x, y, toolProperties); toolProperties.down = true; }
    mouseMove (gl, x, y, vx, vy, toolProperties) { this.spray(gl, x, y, toolProperties); }
    mouseUp (gl, x, y, toolProperties) { toolProperties.down = false;}

    preview(gl, x, y, toolProperties) {
        if (!toolProperties.down) {
            gl.strokeStyle = artimus.getCSSVariable("eraser-outline");
            gl.fillStyle = artimus.getCSSVariable("eraser-inline");
            gl.lineWidth = 2;

            gl.beginPath();
            gl.ellipse(x, y, toolProperties.radius, toolProperties.radius, 0, 0, 2 * Math.PI);
            gl.fill();
            gl.stroke();
            gl.closePath();
        }
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "color", type: "color" },
        { target: artEditor.toolProperties, key: "radius", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "points", type: "int", min: 1 },
    ]}

    colorProperties = [ "color" ];

    properties = {
        color: "#ff0000",
        radius: 10,
        points: 5,
    }
}
//--\\    /dist/tools/eraser.js    //--\\
artimus.tools.eraser = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="36.51093" height="36.51093" viewBox="0,0,36.51093,36.51093"><g transform="translate(-221.74453,-161.74453)"><g stroke-miterlimit="10"><path d="M227.16521,186.83448c1.47201,-2.88916 8.06591,-15.8312 10.77023,-21.13904c0.7023,-1.37842 2.49531,-1.8217 3.84242,-1.13535c1.66161,0.84658 6.79208,3.46053 9.69748,4.94081c1.72103,0.87686 1.87542,2.56066 1.19576,3.89464c-2.66871,5.23796 -9.17135,18.00088 -10.77023,21.13904c-0.69377,1.36168 -1.93838,1.51307 -3.30225,0.81819c-3.2313,-1.64633 -8.91549,-4.54239 -10.53742,-5.36876c-0.8249,-0.42028 -1.45418,-2.05397 -0.896,-3.14953z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M237.93543,165.69544c0.7023,-1.37842 2.49531,-1.8217 3.84242,-1.13535c1.66161,0.84658 6.79208,3.46053 9.69748,4.94081c1.72103,0.87686 1.87542,2.56066 1.19576,3.89464c-2.66871,5.23796 -5.43602,10.10312 -5.43602,10.10312l-14.35532,-7.31396c0,0 2.35136,-5.18142 5.05568,-10.48926z" fill="currentColor" stroke="none" stroke-width="none"/><path d="M221.74453,198.25547v-36.51093h36.51093v36.51093z" fill="none" stroke="none" stroke-width="none"/></g></g></svg>'; }
    
    eraserCircular(gl, x, y, toolProperties) {
        //No
        if (toolProperties.strokeSize < 5) {
            const radius = Math.floor(toolProperties.strokeSize / 2);
            const move = Math.floor(toolProperties.strokeSize)
            gl.clearRect(x - radius, y - radius, move, move);
            return;
        }

        const radius = Math.floor(toolProperties.strokeSize / 2);
        const stepSize = Math.max(1, 90 / toolProperties.strokeSize);

        for (let i = 0; i < 90; i+=stepSize) {
            const width = Math.round(Math.max(1, Math.sin(artimus.degreeToRad(i)) * radius));
            const height = Math.round(Math.max(1, Math.cos(artimus.degreeToRad(i)) * radius));
            gl.clearRect(x - width, y - height, width * 2, height * 2);
        }
    }

    mouseDown(gl, x, y, toolProperties) {
        this.linePos = [x,y];

        //Calculations
        const halfSize = Math.floor(toolProperties.strokeSize / 2);
        const rx = x - halfSize;
        const ry = y - halfSize;
        if (toolProperties.circular) this.eraserCircular(gl, x, y, toolProperties);
        else gl.clearRect(rx,ry,toolProperties.strokeSize,toolProperties.strokeSize);
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        const strokeSize = toolProperties.strokeSize;
        const linePos = this.linePos;

        const halfSize = Math.floor(strokeSize / 2);
        const distance = 1 / Math.sqrt(Math.pow(linePos[0] - x, 2.0) + Math.pow(linePos[1] - y, 2.0));

        //Draw the line
        for (let i = 0; i < 1; i+=distance) {
            const rx = Math.floor((linePos[0] + (x - linePos[0]) * i) - halfSize);
            const ry = Math.floor((linePos[1] + (y - linePos[1]) * i) - halfSize);

            if (toolProperties.circular) this.eraserCircular(gl, rx + halfSize, ry + halfSize, toolProperties);
            else gl.clearRect(rx,ry,strokeSize,strokeSize);
        }

        this.linePos = [x,y];
    }

    mouseUp(gl, x, y, toolProperties) {
        this.linePos = null;
    }

    preview(gl, x, y, toolProperties) {
        //Calculations
        const halfSize = Math.floor(toolProperties.strokeSize / 2);
        const rx = x - halfSize;
        const ry = y - halfSize;

        if (!this.linePos) {
            if (toolProperties.circular && toolProperties.strokeSize > 3) {
                gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-inline");
                gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");
                gl.lineWidth = 2;

                gl.moveTo(x,y);
                gl.beginPath();
                if (toolProperties.strokeSize > 1) gl.arc(x, y, (toolProperties.strokeSize / 2) - 1, 0, Math.PI * 2);
                else gl.rect(x, y, 1, 1);
                gl.stroke();
                gl.fill();
                gl.closePath();
            }
            else {
                gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");
                gl.fillRect(rx,ry,toolProperties.strokeSize,toolProperties.strokeSize);

                if (toolProperties.strokeSize >= 3) {
                    gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-inline");
                    gl.fillRect(rx + 1,ry + 1,toolProperties.strokeSize - 2,toolProperties.strokeSize - 2);
                }
            }
        }
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "circular", type: "boolean" },
    ]}

    properties = {
        strokeSize: 2,
        circular: true,
    }
}
//--\\    /dist/tools/paintBucket.js    //--\\
artimus.tools.paintBucket = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="118.62312" height="118.62312" viewBox="0,0,118.62312,118.62312"><g transform="translate(-180.68844,-120.68844)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M206.88545,153.56346l45.57272,18.09505c0,0 -19.23228,45.38499 -22.37737,52.68799c-1.17446,2.72714 -6.58805,4.01735 -10.1454,2.65112c-5.19795,-1.99631 -20.08784,-7.7149 -29.75857,-11.42902c-5.107,-1.96138 -7.01752,-7.3726 -5.41078,-11.07232c4.13006,-9.51001 22.1194,-50.93282 22.1194,-50.93282z" fill="none" stroke="currentColor" stroke-width="8.5" stroke-linecap="round"/><path d="M223.97522,179.36566l-17.75996,-46.9131l12.06337,3.68603l9.71771,25.13202" fill="none" stroke="currentColor" stroke-width="8.5" stroke-linecap="round"/><path d="M268.77477,157.22889c3.94788,-0.6674 12.67299,0.90255 18.54715,4.14104c3.54973,1.957 8.63085,7.67998 8.46231,11.96793c-0.14335,3.64728 -5.10401,6.07102 -7.14621,6.23577c-4.69174,0.37849 -10.41826,-5.26039 -13.06099,-5.73818c-3.77463,-0.68244 -6.72444,0.24778 -10.47752,0.3855c-7.39699,0.27144 -13.69105,-0.30207 -20.23043,-4.04606c-1.66373,-1.35238 -7.55745,-6.36988 -7.55745,-6.36988c0,0 23.62505,-5.25108 31.46314,-6.57613z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linecap="butt"/><path d="M216.60316,179.36566c0,-3.88641 3.15056,-7.03696 7.03696,-7.03696c3.88641,0 7.03696,3.15056 7.03696,7.03696c0,3.88641 -3.15056,7.03696 -7.03696,7.03696c-3.88641,0 -7.03696,-3.15056 -7.03696,-7.03696z" fill="none" stroke="currentColor" stroke-width="8.5" stroke-linecap="butt"/><path d="M206.88545,153.56346l45.57272,18.09505c0,0 -19.23228,45.38499 -22.37737,52.68799c-1.17446,2.72714 -6.58805,4.01735 -10.1454,2.65112c-5.19795,-1.99631 -20.08784,-7.7149 -29.75857,-11.42902c-5.107,-1.96138 -7.01752,-7.3726 -5.41078,-11.07232c4.13006,-9.51001 22.1194,-50.93282 22.1194,-50.93282z" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M223.97522,179.36566l-17.75996,-46.9131l12.06337,3.68603l9.71771,25.13202" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M268.77477,157.22889c3.94788,-0.6674 12.67299,0.90255 18.54715,4.14104c3.54973,1.957 8.63085,7.67998 8.46231,11.96793c-0.14335,3.64728 -5.10401,6.07102 -7.14621,6.23577c-4.69174,0.37849 -10.41826,-5.26039 -13.06099,-5.73818c-3.77463,-0.68244 -6.72444,0.24778 -10.47752,0.3855c-7.39699,0.27144 -13.69105,-0.30207 -20.23043,-4.04606c-1.66373,-1.35238 -7.55745,-6.36988 -7.55745,-6.36988c0,0 23.62505,-5.25108 31.46314,-6.57613z" fill="currentColor" stroke="none" stroke-width="0.5" stroke-linecap="butt"/><path d="M216.60316,179.36566c0,-3.88641 3.15056,-7.03696 7.03696,-7.03696c3.88641,0 7.03696,3.15056 7.03696,7.03696c0,3.88641 -3.15056,7.03696 -7.03696,7.03696c-3.88641,0 -7.03696,-3.15056 -7.03696,-7.03696z" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="butt"/><path d="M180.68844,239.31156v-118.62312h118.62312v118.62312z" fill="none" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg><!--rotationCenter:59.31155955341217:59.31155955341211-->'; }
    
    coordToColourID(x, y, width) {
        return ((y * width) + x) * 4;
    }

    mixMult = 1 / 255;

    colorAt(data, x, y, width) {
        const targetCoord = this.coordToColourID(x, y, width);
        return [
            data[targetCoord],
            data[targetCoord + 1],
            data[targetCoord + 2],
            data[targetCoord + 3]
        ];
    }

    compareColor(gl, data, x, y, width, targetColor, toolProperties) {
        if (!this.inSelection(gl, x, y)) return false;
        
        const compareColor = this.colorAt(data, x, y, width);
        if (targetColor[3] == 0 && toolProperties.respectTransparency) return (targetColor[0] == compareColor[0] && targetColor[1] == compareColor[1] && targetColor[2] == compareColor[2] && compareColor[3] == targetColor[3]) || compareColor[3] < 240;
        else return (targetColor[0] == compareColor[0] && targetColor[1] == compareColor[1] && targetColor[2] == compareColor[2] && targetColor[3] == compareColor[3]);
    }

    mouseDown(gl, x, y, toolProperties) {
        //Get image data as array here so we don't run continous calls
        const {data, width, height} = gl.getImageData(0,0, gl.canvas.width, gl.canvas.height);
        const myColor = artimus.HexToRGB(toolProperties.fillColor);

        const targetColor = this.colorAt(data, x, y, width);
        if (targetColor[0] == myColor.r && targetColor[1] == myColor.g && targetColor[2] == myColor.b && targetColor[3] == myColor.a) return;

        const paintQueue = [[ x,y ]];

        while (paintQueue.length > 0) {
            let [rx, ry] = paintQueue[0];

            if (rx < 0 || rx >= width || ry < 0 || ry >= height) {
                paintQueue.splice(0, 1);
                continue;
            };

            let lowerBlocked = true;
            let upperBlocked = true;
            for (let wx = rx; wx < width; wx++) {
                //Get color
                if (this.compareColor(gl, data, wx, ry, width, targetColor, toolProperties)) {
                    let targetCoord = this.coordToColourID(wx, ry, width);
                    const mix = (targetColor[3] == 255) ? 1 : (1 - (data[targetCoord + 3] / 255));

                    data[targetCoord] += (myColor.r - data[targetCoord]) * mix;
                    data[targetCoord + 1] += (myColor.g - data[targetCoord + 1]) * mix;
                    data[targetCoord + 2] += (myColor.b - data[targetCoord + 2]) * mix;
                    if (myColor.a < 255) data[targetCoord + 3] += myColor.a;
                    else data[targetCoord + 3] = myColor.a;
                    
                    if (!lowerBlocked) {
                        if (!this.compareColor(gl, data, wx, ry + 1, width, targetColor, toolProperties)) lowerBlocked = true;
                    }
                    else {
                        if (this.compareColor(gl, data, wx, ry + 1, width, targetColor, {...toolProperties, respectTransparency: toolProperties.pierceTransparency})) {
                            paintQueue.push([wx, ry + 1]);
                            lowerBlocked = false;
                        }
                    }
                    
                    if (!upperBlocked) {
                        if (!this.compareColor(gl, data, wx, ry - 1, width, targetColor, toolProperties)) upperBlocked = true;
                    }
                    else {
                        if (this.compareColor(gl, data, wx, ry - 1, width, targetColor, {...toolProperties, respectTransparency: toolProperties.pierceTransparency})) {
                            paintQueue.push([wx, ry - 1]);
                            upperBlocked = false;
                        }
                    }
                }
                else break;
            }

            for (let wx = rx - 1; wx >= 0; wx--) {
                //Get color
                if (this.compareColor(gl, data, wx, ry, width, targetColor, toolProperties)) {
                    let targetCoord = this.coordToColourID(wx, ry, width);
                    const mix = (targetColor[3] == 255) ? 1 : (1 - (data[targetCoord + 3] / 255));

                    data[targetCoord] += (myColor.r - data[targetCoord]) * mix;
                    data[targetCoord + 1] += (myColor.g - data[targetCoord + 1]) * mix;
                    data[targetCoord + 2] += (myColor.b - data[targetCoord + 2]) * mix;
                    if (myColor.a < 255) data[targetCoord + 3] += myColor.a;
                    else data[targetCoord + 3] = myColor.a;
                    
                    if (!lowerBlocked) {
                        if (!this.compareColor(gl, data, wx, ry + 1, width, targetColor, toolProperties)) lowerBlocked = true;
                    }
                    else {
                        if (this.compareColor(gl, data, wx, ry + 1, width, targetColor, {...toolProperties, respectTransparency: toolProperties.pierceTransparency})) {
                            paintQueue.push([wx, ry + 1]);
                            lowerBlocked = false;
                        }
                    }
                    
                    if (!upperBlocked) {
                        if (!this.compareColor(gl, data, wx, ry - 1, width, targetColor, toolProperties)) upperBlocked = true;
                    }
                    else {
                        if (this.compareColor(gl, data, wx, ry - 1, width, targetColor, {...toolProperties, respectTransparency: toolProperties.pierceTransparency})) {
                            paintQueue.push([wx, ry - 1]);
                            upperBlocked = false;
                        }
                    }
                }
                else break;
            }

            paintQueue.splice(0, 1);
        }

        //Blit
        gl.putImageData(new ImageData(data, width, height), 0, 0);
    }

    preview(gl, x, y, toolProperties) {
        gl.fillStyle = toolProperties.fillColor,
        gl.fillRect(x, y, 1, 1);
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "fillColor", type: "color", gradient: true },
        { target: artEditor.toolProperties, key: "pierceTransparency", type: "boolean" },
    ]}

    colorProperties = [ "fillColor" ];

    properties = {
        fillColor: "#000000",
        respectTransparency: true,
        pierceTransparency: true,
    }
}
//--\\    /dist/tools/line.js    //--\\
artimus.tools.line = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117.67375" height="117.67375" viewBox="0,0,117.67375,117.67375"><g transform="translate(-181.16313,-121.16312)"><g fill="none" stroke-miterlimit="10"><path d="M181.16313,238.83687v-117.67375h117.67375v117.67375z" stroke="none" stroke-width="0" stroke-linecap="butt"/><path d="M195.20082,210.85752l89.59837,-61.71506" stroke="currentColor" stroke-width="9.5" stroke-linecap="round"/></g></g></svg><!--rotationCenter:58.83687282811721:58.836882828117226-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        this.start = [x, y];
    }

    drawLine(gl, sx, sy, ex, ey, toolProperties) {
        if (toolProperties.pixelBrush) {
            const strokeSize = toolProperties.strokeSize;
            const halfSize = Math.floor(strokeSize / 2);
            const distance = 1 / Math.ceil(Math.sqrt(Math.pow(sx - ex, 2.0) + Math.pow(sy - ey, 2.0)));

            gl.fillStyle = toolProperties.strokeColor;

            //Draw the line
            for (let i = 0; i < 1; i+=distance) {
                const rx = Math.round((sx + (ex - sx) * i) - halfSize);
                const ry = Math.round((sy + (ey - sy) * i) - halfSize);

                gl.fillRect(rx,ry,strokeSize,strokeSize);
            }

            gl.fillRect(ex - halfSize, ey - halfSize,strokeSize,strokeSize);
        }
        else {
            gl.strokeStyle = toolProperties.strokeColor;
            gl.lineWidth = toolProperties.strokeSize;
            gl.lineCap = "round";
            gl.lineJoin = "round";
            gl.beginPath();
            gl.moveTo(sx,sy);
            gl.lineTo(ex,ey);
            gl.stroke();
            gl.closePath();
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        this.drawLine(gl, ...this.start, x, y, toolProperties);
        this.start = null;
    }

    preview(gl, x, y, toolProperties) {
        if (this.start) {
            this.drawLine(gl, ...this.start, x, y, toolProperties);
        }
        else {
            this.drawLine(gl, x, y, x, y, toolProperties);
        }
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "strokeColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
    ]}

    colorProperties = [ "strokeColor" ];

    properties = {
        strokeColor: "#000000",
        strokeSize: 2,
        pixelBrush: false,
    }
}
//--\\    /dist/tools/curve.js    //--\\
artimus.tools.curve = class extends artimus.tools.line {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117.67375" height="117.67375" viewBox="0,0,117.67375,117.67375"><g transform="translate(-181.16313,-121.16312)"><g fill="none" stroke-miterlimit="10"><path d="M181.16313,238.83687v-117.67375h117.67375v117.67375z" stroke="none" stroke-width="0" stroke-linecap="butt"/><path d="M195.20082,211.04658c0,0 2.79019,-34.67254 29.19166,-48.10458c34.49444,-17.54943 60.40671,-13.61048 60.40671,-13.61048" stroke="currentColor" stroke-width="9.5" stroke-linecap="round"/></g></g></svg><!--rotationCenter:58.83687282811721:58.836882828117226-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        if (toolProperties.state == 0) {
            this.start = [x, y];
            this.end = [x, y];
        }
    }

    mouseMove(gl, x, y, toolProperties) {
        if (toolProperties.state == 0) {
            this.end = [x, y];
        }
    }

    drawLine(gl, sx, sy, ex, ey, cx, cy, toolProperties) {
        if (toolProperties.pixelBrush) {
            
            const strokeSize = toolProperties.strokeSize;
            const halfSize = Math.floor(strokeSize / 2);

            //Due to the line being denser than the base line, we will interpolate by the distance between all points
            const distance = 1 / (
                Math.sqrt(Math.pow(cx - ex, 2.0) + Math.pow(cy - ey, 2.0)) +
                Math.sqrt(Math.pow(sx - cx, 2.0) + Math.pow(sy - cy, 2.0))
            );

            //Draw the line
            let lx = sx;
            let ly = sy;

            for (let i = 0; i < 1; i+=distance) {
                //Quadratic curve formula by Chiragon
                //https://scratch.mit.edu/projects/1222346427/
                let ii = 1 - i;
                let ii2 = Math.pow(ii, 2);
                let i2 = Math.pow(i, 2);

                let rx = (ii2 * ((ii * sx) + (3 * i * cx))) + (((3 * ii * cx) + (i * ex)) * i2);
                let ry = (ii2 * ((ii * sy) + (3 * i * cy))) + (((3 * ii * cy) + (i * ey)) * i2);

                rx = Math.floor(rx);
                ry = Math.floor(ry);

                super.drawLine(gl, lx, ly, rx, ry, toolProperties);
                lx = rx;
                ly = ry;
            }
        }
        else {
            gl.strokeStyle = toolProperties.strokeColor;
            gl.lineWidth = toolProperties.strokeSize;
            gl.lineCap = "round";
            gl.lineJoin = "round";
            gl.beginPath();
            gl.moveTo(sx,sy);
            gl.quadraticCurveTo(cx, cy, ex,ey);
            gl.stroke();
            gl.closePath();
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (toolProperties.state == 1) {
            this.drawLine(gl, ...this.start, ...this.end, x, y, toolProperties);
            this.start = null;
            toolProperties.state = 0;
        }
        else {
            this.end = [x, y];
            toolProperties.state = 1;
        }
    }

    preview(gl, x, y, toolProperties) {
        if (this.start) {
            if (toolProperties.state == 0) this.drawLine(gl, ...this.start, x, y, x, y, toolProperties);
            else {
                gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
                gl.lineWidth = 1;
                gl.beginPath();
                gl.moveTo(this.start[0] + 0.5, this.start[1] + 0.5);
                gl.lineTo(x + 0.5, y + 0.5);
                gl.lineTo(this.end[0] + 0.5, this.end[1] + 0.5);
                gl.stroke();
                gl.closePath();

                this.drawLine(gl, ...this.start, ...this.end, x, y, toolProperties);
            }
        }
        else this.drawLine(gl, x, y, x + 0.1, y + 0.1, x, y, toolProperties);
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "strokeColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
    ]}

    colorProperties = [ "strokeColor" ];

    properties = {
        strokeColor: "#000000",
        strokeSize: 2,
        pixelBrush: false,
        state: 0,
    };
}
//--\\    /dist/tools/text.js    //--\\
artimus.tools.text = class extends artimus.tool {
    constructive = false;

    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19.23435" height="19.23435" viewBox="0,0,19.23435,19.23435"><g transform="translate(-230.38282,-170.38282)"><g stroke="none" stroke-width="0" stroke-miterlimit="10"><path d="M234.63295,174.36291v-1.51378h10.73411v3.00263c0,0 -0.38276,0 -0.84118,0c-0.14059,0 -0.28829,-1.48885 -0.43425,-1.48885c-1.69363,0 -9.45868,0 -9.45868,0z" fill="currentColor"/><path d="M235.90838,174.36291c-0.14596,0 -0.29366,1.48885 -0.43425,1.48885c-0.45843,0 -0.84118,0 -0.84118,0v-3.00263h10.73411v1.51378c0,0 -7.76505,0 -9.45868,0z" fill="currentColor"/><path d="M239.14269,187.14473v-13.02743h1.95411c0,0 0,8.7727 0,10.98026c0,0.37553 -0.15509,0.95902 2.04717,1.11664c0.5274,0.03775 0,0.93053 0,0.93053z" fill="currentColor"/><path d="M236.85602,187.15088c0,0 -0.5274,-0.89279 0,-0.93053c2.20226,-0.15762 2.04717,-0.74111 2.04717,-1.11664c0,-2.20756 0,-10.98026 0,-10.98026h1.95411v13.02742z" fill="currentColor"/><path d="M230.38282,189.61718v-19.23435h19.23435v19.23435z" fill="none"/></g></g></svg><!--rotationCenter:9.617176336678597:9.617176336678625-->'; }
    
    //Thank you https://stackoverflow.com/a/68372384
    cssFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1 1 1 1"/></feComponentTransfer></filter></svg>#f')`;

    deselected(gl, previewGL, toolProperties) {
        if (this.typing) this.renderText(gl, toolProperties);
    }

    mouseDown(gl, x, y, toolProperties) {
        //Comment this until a more reliable way of finding mobile is found, most likely a simple check for touch controls being used last.
        //this.workspace.requestKeyboard();

        this.x = x;
        this.y = y;

        this.mouseIsDown = true;

        if (!this.typing) {
            this.history = [ "" ];
            this.historyPosition = 0;

            this.text = "";
            this.typing = true;
            this.pointerPosition = 0;
        }
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        if (this.mouseIsDown) {
            this.x = x;
            this.y = y;
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.mouseIsDown) {
            this.x = x;
            this.y = y;
            this.mouseIsDown = false;
        }
    }

    renderText(gl, toolProperties, preview) {
        //Set attributes
        gl.fillStyle = toolProperties.fillColor;
        gl.strokeStyle = toolProperties.strokeColor;
        gl.lineWidth = toolProperties.strokeSize;
        gl.font = `${toolProperties.textSize}px ${toolProperties.font}`;

        if (toolProperties.bold) gl.font = `bold ${gl.font}`;
        if (toolProperties.italic) gl.font = `italic ${gl.font}`;

        //Ready the linemen
        const split = this.text.split("\n");
        const lineHeight = gl.measureText("■").width * toolProperties.lineSpacing;

        //ChAAARRRGEEEE!
        let y = this.y;
        let characterOffset = 0;

        if (toolProperties.pixelBrush) gl.filter = this.cssFilter;

        for (let line in split) {
            const lineText = split[line];

            if (preview) {
                const relativePointer = this.pointerPosition - characterOffset;
                if (relativePointer >= 0 && relativePointer <= lineText.length) {
                    if (toolProperties.pixelBrush) gl.filter = "none";

                    gl.lineWidth = 1;
                    gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");

                    const width = gl.measureText(lineText).width;
                    gl.strokeRect(this.x, y, width, 1);

                    const markerOffset = gl.measureText(lineText.substring(0, relativePointer)).width;
                    gl.strokeRect(this.x + markerOffset, y - (lineHeight - 2), 1, lineHeight - 3);

                    if (toolProperties.pixelBrush) gl.filter = this.cssFilter;

                    //Fix stroke style if need be
                    gl.strokeStyle = toolProperties.strokeColor;
                    gl.lineWidth = toolProperties.strokeSize;
                }
            }

            if (toolProperties.strokeSize > 0) {
                gl.strokeText(lineText, this.x, y);
            }
            gl.fillText(lineText, this.x, y);

            y += lineHeight;
            characterOffset += lineText.length + 1;
        }

        if (toolProperties.pixelBrush) gl.filter = "none";

        if (!preview) {
            this.workspace.updateLayerHistory();
            this.workspace.dirty = true;
        }
    }

    selected(gl, previewGL, toolProperties) {
        this.history = [ "" ];
    }

    insertCharacterAt(text, position, character) {
        //Doing this is strange, but it works
        return text.substring(0, position) + 
            character + 
            text.substring(position, text.length);
    }

    removeCharactersAt(text, position, amount) {
        //Doing this is strange, but it works
        if (amount > 0) return text.substring(0, position - amount) + text.substring(position, text.length);
        else return text.substring(0, position) + text.substring(position - amount, text.length);
    }

    keyPressed(gl, event, toolProperties) {
        if (this.typing) {
            const { key } = event;
            const text = this.text;

            if (key.length == 1) {
                if (key == " ") {
                    if (this.history.length - 1 > this.historyPosition) {
                        this.history.splice(this.historyPosition + 1, this.history.length);
                        console.log(this.history);
                    }

                    this.history.push(this.text);
                    this.historyPosition = this.history.length - 1;
                }
                this.text = this.insertCharacterAt(text, this.pointerPosition, key);
                this.pointerPosition++;
            }
            else {
                switch (key.toLowerCase()) {
                    //three basic keys
                    case "enter":
                        if (event.shiftKey) {
                            this.text = this.insertCharacterAt(text, this.pointerPosition, "\n");
                            this.pointerPosition++;
                        }
                        else {
                            this.renderText(gl, toolProperties);

                            this.typing = false;
                            this.text = "";
                            
                            this.workspace.dirty = true;
                        }
                        break;

                    case "backspace":
                        //Shift key support for those who don't have delete
                        if (event.shiftKey) this.text = this.removeCharactersAt(text, this.pointerPosition, -1);
                        else {
                            this.text = this.removeCharactersAt(text, this.pointerPosition, 1);
                            this.pointerPosition--;
                        }
                        break;

                    case "delete":
                        this.text = this.removeCharactersAt(text, this.pointerPosition, -1);
                        break;

                    //Tab
                    case "tab":
                        //Allow the use of shift tab to remove tabs
                        if (event.shiftKey) {
                            if (text.charAt(this.pointerPosition - 1) == " ") {
                                for (let i = 0; i < 4; i++) {
                                    this.text = this.removeCharactersAt(this.text, this.pointerPosition, 1);
                                    this.pointerPosition--;
                                    if (this.text.charAt(this.pointerPosition - 1) != " ") break;
                                }
                            }
                        }
                        else {
                            this.text = this.insertCharacterAt(text, this.pointerPosition, "    ");
                            this.pointerPosition+=4;
                        }
                        break;

                    //Pointer controls
                    case "arrowleft":
                        this.pointerPosition--;
                        break;

                    case "arrowright":
                        this.pointerPosition++;
                        break;

                    case "arrowup":
                        if (text.charAt(this.pointerPosition - 1) == "\n") this.pointerPosition--;
                        else while (text.charAt(this.pointerPosition - 1) != "\n" && this.pointerPosition > 0) {
                            this.pointerPosition--;
                        }
                        break;

                    case "arrowdown":
                        if (text.charAt(this.pointerPosition) == "\n") this.pointerPosition++;
                        else {
                            this.pointerPosition++
                            while (
                                text.charAt(this.pointerPosition - 1) != "\n" 
                                && this.pointerPosition < text.length
                            ) this.pointerPosition++;

                            if (this.pointerPosition != text.length) this.pointerPosition--;
                        }
                        break;
                
                    default:
                        break;
                }

                this.pointerPosition = Math.min(Math.max(this.pointerPosition, 0), this.text.length);
            }

            return true;
        }
    }

    undo(gl, previewGL, toolProperties) {
        if (!this.typing) return;

        if (this.historyPosition > 0) {
            if (this.historyPosition == this.history.length - 1 && 
                this.history[this.historyPosition] != this.text) this.history.push(this.text);

            console.log(this.history);

            this.historyPosition--;
            this.text = this.history[this.historyPosition];

            this.preview(previewGL, 0, 0, toolProperties);
            this.pointerPosition = Math.min(Math.max(this.pointerPosition, 0), this.text.length);
        }

        return true;
    }

    redo(gl, previewGL, toolProperties) {
        if (!this.typing) return;

        if (this.historyPosition < this.history.length - 1) {
            this.historyPosition++;
            this.text = this.history[this.historyPosition];

            this.preview(previewGL, 0, 0, toolProperties);
            this.pointerPosition = Math.min(Math.max(this.pointerPosition, 0), this.text.length);
        }

        return true;
    }

    preview(gl, x, y, toolProperties) {
        if (this.typing) this.renderText(gl, toolProperties, true);
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "font", type: "artimus-font"},
        { target: artEditor.toolProperties, key: "bold", type: "boolean" },
        { target: artEditor.toolProperties, key: "italic", type: "boolean" },

        { target: artEditor.toolProperties, key: "textSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "lineSpacing", type: "float" },

        { target: artEditor.toolProperties, key: "fillColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 0 },
        //{ target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
    ]}

    colorProperties = [ "strokeColor", "fillColor" ];

    properties = {
        font: "Monospace",
        bold: false,
        italic: false,
        textSize: 24,
        lineSpacing: 1.5,
        fillColor: "#000000",
        strokeColor: "#000000",
        strokeSize: 0,
        pixelBrush: false,
    }
}
//--\\    /dist/tools/jumble.js    //--\\
artimus.tools.jumble = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="153.92384" height="153.92384" viewBox="0,0,153.92384,153.92384"><g transform="translate(-163.03808,-103.03808)"><g stroke-miterlimit="10"><path d="M294.42454,152.19081c0,0 -12.56477,0.64938 -39.90761,1.06787c-13.99108,0.21413 -15.47284,55.35862 -28.33588,55.31166c-20.49912,-0.07486 -40.60558,-0.05202 -40.60558,-0.05202" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M285.90245,134.89291l17.04418,17.04417l-17.04418,17.04418z" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="butt"/><path d="M294.42454,207.80919c0,0 -12.56477,-0.64938 -39.90762,-1.06787c-0.75384,-0.01154 -1.47136,-0.18254 -2.1563,-0.49578" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M228.07626,151.84432c-0.60388,-0.27388 -1.23454,-0.41707 -1.89523,-0.41466c-20.49912,0.07486 -40.60557,0.05203 -40.60557,0.05203" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M285.90245,189.87722l17.04418,17.04417l-17.04418,17.04418z" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="butt"/><path d="M163.03808,256.96192v-153.92384h153.92384v153.92384z" fill="none" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg><!--rotationCenter:76.96192039595141:76.96192039595137-->'; }
    
    clampXY(x, y, clampToEdge) {
        if (clampToEdge) return [ 
            Math.min(Math.max(0, x), this.workspace.width - 1), 
            Math.min(Math.max(0, y), this.workspace.height - 1)
        ];
        else return [ x, y ];
    }

    jumblePixelsAt(gl, x, y, { jumbleSize, jumbleWholeSquare, mix, clampToEdge }) {
        //Calculations
        const halfSize = Math.floor(jumbleSize / 2);
        const [sx, sy] = this.clampXY(x - halfSize, y - halfSize, clampToEdge);
        const [ex, ey] = this.clampXY(x + halfSize, y + halfSize, clampToEdge);
        const [rx, ry] = [ Math.max(1, ex - sx), Math.max(1, ey - sy) ];

        const imageData = gl.getImageData(sx, sy, rx, ry);
        const data = imageData.data;

        //Detection for selection, since we do this a lot it's good to have this.
        const insideSelection = (this.workspace.hasSelection) ? 
            (x, y) => this.inSelection(gl, x + sx, y + sy) :
            () => true;

        //For my jumble, whole square
        if (jumbleWholeSquare) {
            const jumbled = [];
            //Randomize
            for (let i = 0; i < data.length; i+=4) {
                const sx = Math.floor(i / 4) % jumbleSize;
                const sy = Math.floor((i / 4) / jumbleSize);

                if (Math.random() > 0.5) jumbled.push([i, sx, sy]); 
                else jumbled.splice(0, 0, [i, sx, sy]); 
            }

            //Run the list back to front and jumble that shiz
            for (let wy = 0; wy < ry; wy++) { for (let wx = 0; wx < rx; wx++) {
                const [i1, sx, sy] = jumbled.pop();
                const i2 = ((wy * rx) + wx) * 4;

                const r1 = data[i1];
                const g1 = data[i1 + 1];
                const b1 = data[i1 + 2];
                const a1 = data[i1 + 3];

                const r2 = data[i2];
                const g2 = data[i2 + 1];
                const b2 = data[i2 + 2];
                const a2 = data[i2 + 3];
                
                if (insideSelection(sx, sy)) {
                    imageData.data[i1]     += (r2 - r1) * mix;
                    imageData.data[i1 + 1] += (g2 - g1) * mix;
                    imageData.data[i1 + 2] += (b2 - b1) * mix;
                    imageData.data[i1 + 3] += (a2 - a1) * mix;
                }
                
                if (insideSelection(wx, wy)) {
                    imageData.data[i2]     += (r1 - r2) * mix;
                    imageData.data[i2 + 1] += (g1 - g2) * mix;
                    imageData.data[i2 + 2] += (b1 - b2) * mix;
                    imageData.data[i2 + 3] += (a1 - a2) * mix;
                }
            }}
        }
        //For Chiragon's jumble, little bits.
        //We may or may not have argued for 30 minutes on this... I'm sorry for getting so heated
        //I decided to make a happy little compromise between our ideas.
        else {
            for (let i = 0; i < jumbleSize * 2; i++) {
                const i1 = artimus.iRandRange(0, data.length / 4) * 4;
                const i2 = artimus.iRandRange(0, data.length / 4) * 4;

                const x1 = (i % rx);
                const y1 = Math.floor(i / rx);
                const x2 = (i % rx);
                const y2 = Math.floor(i / rx);

                const r1 = data[i1];
                const g1 = data[i1 + 1];
                const b1 = data[i1 + 2];
                const a1 = data[i1 + 3];

                const r2 = data[i2];
                const g2 = data[i2 + 1];
                const b2 = data[i2 + 2];
                const a2 = data[i2 + 3];

                if (insideSelection(x1, y1)) {
                    imageData.data[i1]     += (r2 - r1) * mix;
                    imageData.data[i1 + 1] += (g2 - g1) * mix;
                    imageData.data[i1 + 2] += (b2 - b1) * mix;
                    imageData.data[i1 + 3] += (a2 - a1) * mix;
                }
                
                if (insideSelection(x2, y2)) {
                    imageData.data[i2]     += (r1 - r2) * mix;
                    imageData.data[i2 + 1] += (g1 - g2) * mix;
                    imageData.data[i2 + 2] += (b1 - b2) * mix;
                    imageData.data[i2 + 3] += (a1 - a2) * mix;
                }
            }
        }

        gl.putImageData(imageData, sx, sy);
    }

    mouseDown(gl, x, y, toolProperties) { this.jumblePixelsAt(gl, x, y, toolProperties); }
    mouseMove(gl, x, y, vx, vy, toolProperties) { this.jumblePixelsAt(gl, x, y, toolProperties); }

    preview(gl, x, y, toolProperties) {
        //Calculations
        const halfSize = Math.floor(toolProperties.jumbleSize / 2);
        const rx = x - halfSize;
        const ry = y - halfSize;

        gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");
        gl.fillRect(rx,ry,toolProperties.jumbleSize,toolProperties.jumbleSize);

        if (toolProperties.jumbleSize >= 3) {
            gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-inline");
            gl.fillRect(rx + 1,ry + 1,toolProperties.jumbleSize - 2,toolProperties.jumbleSize - 2);
        }
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "jumbleSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "jumbleWholeSquare", type: "boolean" },
        { target: artEditor.toolProperties, key: "clampToEdge", type: "boolean" },
        { target: artEditor.toolProperties, key: "mix", type: "slider", min: 0, max: 1, step: 0.05 },
    ]}

    properties = {
        jumbleSize: 10,
        jumbleWholeSquare: false,
        clampToEdge: false,
        mix: 1,
    }
}
//--\\    /dist/tools/selectionRectangle.js    //--\\
artimus.tools.selectionRectangle = class extends artimus.tool {
    constructive = false;
    
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="43.78882" height="43.78882" viewBox="0,0,43.78882,43.78882"><g transform="translate(-218.10559,-158.10559)"><g fill="none" stroke-miterlimit="10"><path d="M224.72126,195.60047l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M225.38759,188.40561l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M226.05565,181.19199l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M226.72197,173.99712l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M249.09768,193.24798l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M242.05076,193.9283l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M234.98549,194.61038l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M227.93858,195.2907l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M255.26475,164.41328l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M248.21784,165.0936l-3.21652,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M241.15258,165.77568l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M234.10566,166.456l-3.21653,0.31053" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M252.97389,189.28619l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M253.64021,182.09132l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M254.30827,174.87771l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M254.9746,167.68284l0.30414,-3.28406" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M218.10559,201.89441v-43.78882h43.78882v43.78882z" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg><!--rotationCenter:21.894410590842682:21.894410590842682-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        this.start = [x, y];
    }

    getRect(sx, sy, ex, ey) {
        let width = ex - sx;
        let height = ey - sy;

        if (this.shiftHeld) {
            if (Math.abs(width) < Math.abs(height)) {
                if (artimus.preferGreaterAxis) width = Math.abs(height) * ((width < 0) ? -1 : 1);
                else height = Math.abs(width) * ((height < 0) ? -1 : 1);
            }
            else {
                if (artimus.preferGreaterAxis) height = Math.abs(width) * ((height < 0) ? -1 : 1);
                else width = Math.abs(height) * ((width < 0) ? -1 : 1);
            }
        }

        return [sx, sy, width, height];
    }

    getStrokeRect(sx, sy, ex, ey) {
        const [x, y, width, height] = this.getRect(sx, sy, ex, ey);
        return [x + 0.5, y + 0.5, width, height];
    }

    getRectArray(sx, sy, ex, ey) {
        const [x, y, width, height] = this.getRect(sx, sy, ex, ey);

        return [
            x, y,
            x + width, y,
            x + width, y + height,
            x, y + height
        ];
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.start) {
            if (this.start[0] == x && this.start[1] == y) this.workspace.clearSelection();
            else this.workspace.setSelection(this.getRectArray(...this.start, x, y));
        }

        this.start = null;
    }

    preview(gl, x, y, toolProperties) {
        if (this.start) {
            gl.setLineDash([4, 2]);
            gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.lineWidth = 1;

            gl.strokeRect(...this.getStrokeRect(...this.start, x, y));
            gl.setLineDash([]);
        }
        else {
            gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.fillRect(x, y, 1, 1);
        }
    }
}
//--\\    /dist/tools/selectionCircle.js    //--\\
artimus.tools.selectionCircle = class extends artimus.tool {
    constructive = false;
    
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117.67375" height="117.67375" viewBox="0,0,117.67375,117.67375"><g transform="translate(-181.16313,-121.16312)"><g stroke-miterlimit="10"><path d="M181.16313,238.83687v-117.67375h117.67375v117.67375z" fill="none" stroke="none" stroke-width="0" /><path d="M192.04716,179.99999c0,-26.48362 21.46922,-47.95284 47.95284,-47.95284c26.48362,0 47.95284,21.46922 47.95284,47.95284c0,26.48362 -21.46922,47.95284 -47.95284,47.95284c-26.48362,0 -47.95284,-21.46922 -47.95284,-47.95284z" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="16 8" /></g></g></svg><!--rotationCenter:58.83687282811721:58.836882828117226-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        this.start = [x, y];
    }

    getEllipse(sx, sy, ex, ey) {
        let width = ex - sx;
        let height = ey - sy;

        if (this.shiftHeld) {
            if (Math.abs(width) < Math.abs(height)) {
                if (artimus.preferGreaterAxis) width = Math.abs(height) * ((width < 0) ? -1 : 1);
                else height = Math.abs(width) * ((height < 0) ? -1 : 1);
            }
            else {
                if (artimus.preferGreaterAxis) height = Math.abs(width) * ((height < 0) ? -1 : 1);
                else width = Math.abs(height) * ((width < 0) ? -1 : 1);
            }
        }

        width /= 2;
        height /= 2;

        return [sx + width, sy + height, Math.abs(width), Math.abs(height)];
    }

    getEllipseStroke(sx, sy, ex, ey) {
        const [x, y, width, height] = this.getEllipse(sx, sy, ex, ey);
        return [x + 0.5, y + 0.5, width, height];
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.start) {
            if (this.start[0] == x && this.start[1] == y) this.workspace.clearSelection();
            else {
                const [cx, cy, rx, ry] = this.getEllipse(...this.start, x, y);

                const points = [];

                //This is probably good enough.
                //! Shown above is sloth
                for (let i = 0; i < 360; i++) {
                    let rad = artimus.degreeToRad(i);
                    points.push(
                        (Math.sin(rad) * rx) + cx,
                        (Math.cos(rad) * ry) + cy
                    )
                }

                this.workspace.setSelection(points);
            }
        }

        this.start = null;
    }

    preview(gl, x, y, toolProperties) {
        if (this.start) {
            gl.setLineDash([4, 2]);
            gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.lineWidth = 1;

            gl.beginPath();
            gl.ellipse(...this.getEllipseStroke(...this.start, x, y), 0, 0, 2 * Math.PI);
            gl.stroke();
            gl.setLineDash([]);
        }
        gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        gl.fillRect(x, y, 1, 1);
    }
}
//--\\    /dist/tools/selectionLasso.js    //--\\
artimus.tools.selectionLasso = class extends artimus.tool {
    constructive = false;
    
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117.67375" height="117.67375" viewBox="0,0,117.67375,117.67375"><g transform="translate(-181.16313,-121.16312)"><g fill="none" stroke-miterlimit="10"><path d="M181.16313,238.83687v-117.67375h117.67375v117.67375z" stroke="none" stroke-width="0" stroke-dasharray=""/><path d="M190.55159,167.6298c0,-15.56525 1.83406,-5.71715 13.32556,-14.47754c8.06081,-6.14505 23.47548,-14.19121 21.09515,-3.53546c-3.94639,17.6663 8.50634,38.00487 27.04476,35.2442c13.58945,-2.02369 34.44021,-17.2312 34.44021,-17.2312c0,0 8.79123,19.53258 -3.76922,33.32304c-8.43364,9.25953 -37.45465,14.6298 -44.18362,14.6298c-11.05852,0 2.10751,-15.4448 2.10751,-15.4448c0,0 -18.69154,3.11012 -32.79013,-4.66286c-10.33925,-5.70034 -17.27021,-21.31908 -17.27021,-27.84518z" stroke="currentColor" stroke-width="5" stroke-dasharray="16,8"/></g></g></svg><!--rotationCenter:58.83687282811721:58.836882828117226-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        this.path = [x, y];
        this.drawing = true;
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        if (this.drawing) {
            const last = this.path.length - 2;
            const ex = [this.path[last]];
            const ey = [this.path[last + 1]];

            //Make sure that we are only adding more path when the pixel is moved.
            if (Math.sqrt((Math.pow(ex - x, 2)) + Math.pow(ey - y, 2)) >= 1) this.path.push(x, y);
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.path) {
            this.path.push(x, y);
            if (this.path.length == 0) this.workspace.clearSelection();
            else this.workspace.setSelection(this.path);
        }

        this.path = null;
        this.drawing = false;
    }

    preview(gl, x, y, toolProperties) {
        if (this.drawing) {
            gl.setLineDash([4, 2]);
            gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.lineWidth = 1;

            //Set line
            gl.beginPath();

            //Define the path
            for (let i = 0; i<this.path.length; i+=2) {
                if (i == 0) gl.moveTo(this.path[i] + 0.5, this.path[i + 1] + 0.5);
                else gl.lineTo(this.path[i] + 0.5, this.path[i + 1] + 0.5);
                gl.moveTo(this.path[i] + 0.5, this.path[i + 1] + 0.5)
            }
            gl.lineTo(this.path[0] + 0.5, this.path[1] + 0.5);
            
            //Then draw and reset
            gl.stroke();
            gl.closePath();
            gl.setLineDash([]);
        }
        else {
            gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.fillRect(x, y, 1, 1);
        }
    }
}
//--\\    /dist/tools/move.js    //--\\
artimus.tools.move = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="75.93583" height="75.93583" viewBox="0,0,75.93583,75.93583"><g transform="translate(-202.03209,-142.03209)"><g stroke-width="0" stroke-miterlimit="10"><path d="M216.20738,187.03519l-1.85673,-12.92663l49.19724,-1.1261l1.85673,12.92663z" fill="currentColor" stroke="currentColor"/><path d="M245.3687,170.74569l-13.43814,0.30759l-2.0906,-14.55479l13.43814,-0.30759z" fill="currentColor" stroke="currentColor"/><path d="M234.5469,189.26829l13.43814,-0.30759l2.0906,14.55479l-13.43814,0.30759z" fill="currentColor" stroke="currentColor"/><path d="M203.40364,181.13846l10.67294,-10.24891l2.78023,19.35606z" fill="currentColor" stroke="none"/><path d="M265.83902,189.12443l-2.78023,-19.35606l13.53758,9.69474z" fill="currentColor" stroke="none"/><path d="M245.31971,215.20336l-12.03899,-11.4072l20.12198,-0.46058z" fill="currentColor" stroke="none"/><path d="M246.63488,156.21782l-20.12198,0.46058l8.69384,-11.88177z" fill="currentColor" stroke="none"/><path d="M202.03209,217.96791v-75.93583h75.93583v75.93583z" fill="none" stroke="none"/></g></g></svg>'; }
    constructive = false;

    tp = (Math.PI * 2);

    updatePositions() {
        let { selectionMinX, selectionMinY, selectionMaxX, selectionMaxY } = this.workspace;

        this.x = (this.workspace.hasSelection) ? selectionMinX : 0;
        this.y = (this.workspace.hasSelection) ? selectionMinY : 0;
        this.width = (this.workspace.hasSelection) ? selectionMaxX - selectionMinX : this.workspace.width;
        this.height = (this.workspace.hasSelection) ? selectionMaxY - selectionMinY : this.workspace.height;
    }

    updateHistory() {
        if (this.historyPosition < this.undoQueue.length - 1) this.undoQueue.splice(this.historyPosition + 1, this.undoQueue.length);

        this.undoQueue.push({
            matrix: [...this.matrix],
            selection: [...this.workspace.selection]
        });

        this.historyPosition = this.undoQueue.length - 1;
    }

    drawImage(gl) {
        //Calculate values needed for our matrix
        //Set the image and draw the matrix
        gl.setTransform(...this.matrix);
        gl.drawImage(this.bitmap, 0, 0);
        gl.setTransform(1, 0, 0, 1, 0, 0);
    }

    selected(gl, previewGL, toolProperties) {
        let { selectionMinX, selectionMinY, selectionMaxX, selectionMaxY } = this.workspace;
        
        this.ready = false;

        if (this.workspace.hasSelection) this.imageData = gl.getImageData(selectionMinX, selectionMinY, selectionMaxX - selectionMinX, selectionMaxY - selectionMinY);
        else {
            //Set data needed if we are doing the whole screen
            this.imageData = gl.getImageData(0, 0, this.workspace.width, this.workspace.height);

            //Add a selection.
            this.workspace.selection = [ 0,0, this.workspace.width,0, this.workspace.width,this.workspace.height, 0,this.workspace.height ]
            selectionMinX = 0; selectionMinY = 0;
            selectionMaxX = this.workspace.width; selectionMaxY = this.workspace.height;
        }

        if (selectionMaxX - selectionMinX > 0 && selectionMaxY - selectionMinY > 0) {
            createImageBitmap(this.imageData).then(bitmap => {
                this.bitmapReady(previewGL, bitmap, toolProperties);
                
                gl.clearRect(
                    selectionMinX,
                    selectionMinY,
                    selectionMaxX - selectionMinX,
                    selectionMaxY - selectionMinY
                );
            });
        }
    }

    //Pretty similar to selections
    paste(gl, previewGL, bitmap, sizeMultiplier, toolProperties) {
        this.bitmapReady(previewGL, bitmap, toolProperties);
        this.matrix[0] *= sizeMultiplier;
        this.matrix[3] *= sizeMultiplier;
    }

    bitmapReady(previewGL, bitmap, toolProperties) {
        
        this.bitmap = bitmap;
        this.ready = true;
        this.updatePositions();

        //Setup initial variables
        this.imageX = this.x;
        this.imageY = this.y;
        this.imageWidth = this.width;
        this.imageHeight = this.height;
    
        //This is used for the actual transformation of the image
        this.matrix = [
            1, 0, 
            0, 1,
            this.x, this.y,
        ];

        this.angle = 0;
        this.initialAngle = 0;
        this.undoQueue = [];
        this.historyPosition = 0;
        
        this.updateHistory();

        this.preview(previewGL, ...this.workspace.lastPosition, toolProperties);
        this.workspace.dirty = true;
    }

    deselected(gl, previewGL, toolProperties) {
        this.drawImage(gl);
        this.workspace.dirty = true;
        this.workspace.updateLayerHistory();
    }

    isInCircle(x, y, cx, cy, radius) { return Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2)) <= radius; }
    drawCircle(gl, x, y, radius, fill) {
        gl.beginPath();
        gl.ellipse(x + 0.5, y + 0.5, radius, radius, 0, 0, 2 * Math.PI);
        if (fill) gl.fill();
        gl.stroke();
        gl.closePath();
    }

    isInRect(x, y, sx, sy, width, height) { return (x >= sx && y >= sy) && (x <= sx + width && y <= sy + height); }
    drawRect(gl, x, y, width, height, fill) {
        gl.strokeRect(x, y, width, height);
        if (fill) gl.fillRect(x, y, width, height);
    }

    get rotatePoints() {
        return [
            [this.x, this.y],
            [this.x + this.width, this.y],
            [this.x + this.width, this.y + this.height],
            [this.x, this.y + this.height]
        ]
    }

    get resizePoints() {
        //Format, bounding box | X, Y, width, height
        //        Direction    | DX, DY, TX, TY
        const minX = Math.min(Math.max(0, this.x - 5), this.workspace.width - 5);
        const maxX = Math.min(Math.max(0, this.x + this.width), this.workspace.width - 5);
        const midX = Math.min(Math.max(6, this.x + (this.width / 3)), this.workspace.width - (this.width / 3) - 6);

        const minY = Math.min(Math.max(0, this.y - 5), this.workspace.height - 5);
        const maxY = Math.min(Math.max(0, this.y + this.height), this.workspace.height - 5);
        const midY = Math.min(Math.max(6, this.y + (this.height / 3)), this.workspace.height - (this.height / 3) - 6);
        
        return [
            [midX, minY, this.width / 3, 5,
            0, -1, 0, this.y + this.height],
            [midX, maxY, this.width / 3, 5,
            0, 1, 0, this.y],
            [minX, midY, 5, this.height / 3,
            -1, 0, this.x + this.width, 0],
            [maxX, midY, 5, this.height / 3,
            1, 0, this.x, 0]
        ]
    }

    mouseDown(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = true;
            this.mode = "";
            this.resizing = false;
            this.initialSelection = [...this.workspace.selection];
            this.initialMatrix = [...this.matrix]
            this.initialWidth = this.width;
            this.initialHeight = this.height;

            //Check to see if we are touching one of the rotation circles, if so rotate it.
            for (let i in this.rotatePoints) {
                if (this.isInCircle(x, y, ...this.rotatePoints[i], 3)) {
                    this.mode = "rotating";

                    this.cx = this.x + (this.width / 2);
                    this.cy = this.y + (this.height / 2);
                    this.initialAngle = Math.atan2(this.cy - y, this.cx - x);
                    this.angle = Math.atan2(this.cy - y, this.cx - x) - this.initialAngle;
                    return;
                }
            }

            //If we fail the rotation check, do the resizing check
            for (let i in this.resizePoints) {
                const [rx, ry, rw, rh, dx, dy, cx, cy] = this.resizePoints[i];
                if (this.isInRect(x, y, rx, ry, rw, rh)) {
                    this.mode = "resizing";

                    this.cx = cx;
                    this.cy = cy;
                    this.dx = dx;
                    this.dy = dy;

                    this.resizedWidth = this.width;
                    this.resizedHeight = this.height;
                    return;
                }
            }
        }
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        if (this.dragging) {
            switch (this.mode) {
                case "resizing":{
                    //For accurate bounding
                    this.resizedWidth += vx * this.dx;
                    this.resizedHeight += vy * this.dy;

                    const stretchX = (this.resizedWidth / this.initialWidth);
                    const stretchY = (this.resizedHeight / this.initialHeight);

                    if (this.dx != 0) {
                        this.matrix[0] = this.initialMatrix[0] * stretchX;
                        this.matrix[2] = this.initialMatrix[2] * stretchX;
                        this.matrix[4] = ((this.initialMatrix[4] - this.cx) * stretchX) + this.cx;
                    }

                    if (this.dy != 0) {
                        this.matrix[1] = this.initialMatrix[1] * stretchY;
                        this.matrix[3] = this.initialMatrix[3] * stretchY;
                        this.matrix[5] = ((this.initialMatrix[5] - this.cy) * stretchY) + this.cy;
                    }

                    /*

                    //Get matrix ready for multiplication
                    const from = [
                        this.initialMatrix[0],
                        this.initialMatrix[2],
                        this.initialMatrix[4] - this.cx,
                        this.initialMatrix[1],
                        this.initialMatrix[3],
                        this.initialMatrix[5] - this.cy
                    ]

                    const toMatrix = [
                        stretchX, 0, 0,
                        0, stretchY, 0,
                        0, 0, 1
                    ]

                    //Multiply, for some reason canvas 2d matrixs are down oriented in terms of the direction the array goes so that is one reason from exists.
                    this.matrix[0] = (from[0] * toMatrix[0]) + (from[1] * toMatrix[3]) + (from[2] * toMatrix[6]);
                    this.matrix[2] = (from[0] * toMatrix[1]) + (from[1] * toMatrix[4]) + (from[2] * toMatrix[7]);
                    this.matrix[4] = (from[0] * toMatrix[2]) + (from[1] * toMatrix[5]) + (from[2] * toMatrix[8]);
                    this.matrix[1] = (from[3] * toMatrix[0]) + (from[4] * toMatrix[3]) + (from[5] * toMatrix[6]);
                    this.matrix[3] = (from[3] * toMatrix[1]) + (from[4] * toMatrix[4]) + (from[5] * toMatrix[7]);
                    this.matrix[5] = (from[3] * toMatrix[2]) + (from[4] * toMatrix[5]) + (from[5] * toMatrix[8]);

                    this.matrix[4] += this.cx;
                    this.matrix[5] += this.cy;

                    */

                    const selection = this.workspace.selection;

                    for (let i = 0; i < this.initialSelection.length; i+=2) {
                        const x = this.initialSelection[i] - this.cx;
                        const y = this.initialSelection[i + 1] - this.cy;

                        selection[i] = (x * stretchX) + this.cx;
                        selection[i + 1] = (y * stretchY) + this.cy; 
                    }

                    this.workspace.selection = selection;
                    this.updatePositions();
                    break;}

                case "rotating":{
                    //Find offset angle
                    this.angle = Math.atan2(this.cy - y, this.cx - x) - this.initialAngle;
                    if (this.shiftHeld) this.angle = (Math.floor((this.angle / this.tp) * 24) / 24) * this.tp;
                    
                    const sin = Math.sin(-this.angle);
                    const cos = Math.cos(-this.angle);

                    this.matrix[0] = this.initialMatrix[1] * sin + this.initialMatrix[0] * cos;
                    this.matrix[1] = this.initialMatrix[1] * cos - this.initialMatrix[0] * sin;
                    this.matrix[2] = this.initialMatrix[3] * sin + this.initialMatrix[2] * cos;
                    this.matrix[3] = this.initialMatrix[3] * cos - this.initialMatrix[2] * sin;

                    this.matrix[4] = this.initialMatrix[4] - this.cx;
                    this.matrix[5] = this.initialMatrix[5] - this.cy;

                    let old = this.matrix[4];
                    this.matrix[4] = (this.matrix[5] * sin) + (old * cos) + this.cx;
                    this.matrix[5] = (this.matrix[5] * cos) - (old * sin) + this.cy;

                    //Move selection points
                    const selection = this.workspace.selection;
                    for (let i = 0; i < this.initialSelection.length; i+=2) {
                        const x = this.initialSelection[i] - this.cx;
                        const y = this.initialSelection[i + 1] - this.cy;

                        selection[i] = (y * sin + x * cos) + this.cx;
                        selection[i + 1] = (y * cos - x * sin) + this.cy; 
                    }

                    //Update our selection
                    this.workspace.selection = selection;
                    this.updatePositions();
                    break;}
            
                default:
                    //Move the image and the selection points
                    this.matrix[4] += vx;
                    this.matrix[5] += vy;

                    if (this.workspace.hasSelection) {
                        const selection = this.workspace.selection;
                        for (let i = 0; i < selection.length; i+=2) {
                            selection[i] += vx;
                            selection[i + 1] += vy; 
                        }

                        this.workspace.selection = selection;
                        this.updatePositions();
                    }

                    if (this.shiftHeld) {
                        this.drawImage(gl);
                        this.workspace.dirty = true;
                        this.flailedCards = true;
                    }
                    break;
            }
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = false;
            this.updateHistory();
        }

        if (this.flailedCards) {
            this.workspace.updateLayerHistory();
            this.flailedCards = false;
        }
    }

    moveToUndo() {
        //Undo.
        this.workspace.selection = [...this.undoQueue[this.historyPosition].selection];
        this.matrix = [...this.undoQueue[this.historyPosition].matrix];

        this.updatePositions();
    }

    undo(gl, previewGL, toolProperties) {
        if (this.historyPosition > 0) this.historyPosition -= 1;
        this.moveToUndo();
        return true;
    }

    redo(gl, previewGL, toolProperties) {
        if (this.historyPosition < this.undoQueue.length - 1) this.historyPosition += 1;
        this.moveToUndo();
        return true;
    }

    preview(gl, x, y, toolProperties) {
        //Set the image and draw the matrix
        this.workspace.applySelectionToPreview();
        this.drawImage(gl);
        this.workspace.clearSelectionFromPreview();
        
        gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        gl.lineWidth = 1;

        for (let i in this.rotatePoints) {
            const [px, py] = this.rotatePoints[i];
            this.drawCircle(gl, px, py, 3, this.isInCircle(x, y, px, py, 3));
        }

        for (let i in this.resizePoints) {
            const [rx, ry, rw, rh] = this.resizePoints[i];
            this.drawRect(gl, rx, ry, rw, rh, this.isInRect(x, y, rx, ry, rw, rh));
        }

        //Create bounding outline
        gl.beginPath();
        gl.moveTo(this.x, this.y);
        gl.lineTo(this.x + this.width, this.y);
        gl.lineTo(this.x + this.width, this.y + this.height);
        gl.lineTo(this.x, this.y + this.height);
        gl.lineTo(this.x, this.y);
        gl.stroke();
        gl.closePath();
    }

    properties = {
        strokeColor: "#000000",
        strokeSize: 2,
        pixelBrush: false,
    }
}
//Export artimus.
export default artimus;


//--\\    /dist/default.css //--\\

artimus.defaultStyleElement = document.createElement("style");
artimus.defaultStyleElement.innerHTML = `body {
    --artimus-eraser-outline: #438eff;
    --artimus-eraser-inline: #d0d0ff;

    --artimus-grid-1: #bbbbff;
    --artimus-grid-2: #7878a4;

    --artimus-selection-outline: #438eff;

    --artimus-background-1: #e2e2ff;
    --artimus-background-2: #d0d0ff;
    --artimus-background-3: #bbbbff;

    --artimus-button-normal: #e2e2ff;
    --artimus-button-hover: #c2c2ff;
    --artimus-button-click: #438eff;
    --artimus-button-selected: #aaaaff;

    --artimus-text: #29053a;
    --artimus-icon: #29053a;
}

.artimus-container {
    --tab-1: 1;
    --tab-2: 0;
    --tab-3: 0;

    display: grid;
    grid-template-columns: 200px 0px 1fr;

    width: 100%;
    height: 100%;

    background-color: var(--artimus-background-2);

    color: var(--artimus-text);

    transition: 300ms grid-template-columns;
}

.artimus-toolbar {
    display: grid;
    grid-template-rows: 33.3333% 33.3333% 33.3333%;
    height: 100%;

    background-color: var(--artimus-background-1);

    max-height: 100%;
    min-height: 0px;

    transition: 300ms grid-template-rows;
}

.artimus-toolbarTabs {
    display: grid;
    grid-template-rows: 33.3333% 33.3333% 33.3333%;
    height: 100%;

    background-color: var(--artimus-background-1);

    max-height: 100%;
    min-height: 0px;

    transition: 300ms grid-template-rows;
    
    overflow: hidden;
}

.artimus-sideBarList {
    margin: 8px;
    padding: 4px;

    border-radius: 16px;
    background-color: var(--artimus-background-2);
    display: flex;
    flex-direction: column;

    overflow-y: auto;
}

.artimus-sideBarList:nth-child(1) { --tab-open: var(--tab-1); }
.artimus-sideBarList:nth-child(2) { --tab-open: var(--tab-2); }
.artimus-sideBarList:nth-child(3) { --tab-open: var(--tab-3); }

@media (max-height: 424px) {
    .artimus-container {
        grid-template-columns: 180px 48px 1fr;
    }

    .artimus-toolbar {
        grid-template-rows: calc(var(--tab-1) * 100%) calc(var(--tab-2) * 100%) calc(var(--tab-3) * 100%);
    }

    .artimus-sideBarList {
        margin: calc(8px * var(--tab-open));
        padding: calc(4px * var(--tab-open));
    }
}

.artimus-canvasArea {
    overflow: hidden;
    position: relative;
}

.artimus-canvas {
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    image-rendering: pixelated;

    /* Weird chromium Win-11 bug */
    filter: blur(0);

    transform: translate(-50%, -50%) scale(var(--zoom)) translate(var(--scrollX), var(--scrollY));
    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0%;
}

.artimus-layerHolder {
    display: grid;
    grid-template-rows: calc(100% - 30px) 30px;
}

.artimus-layerWrapper {
    display: flex;
}

.artimus-layerList {
    display: flex;
    flex-direction: column-reverse;
    overflow-y: auto;
}

.artimus-layerCreationHolder {
    height: 24px;
    display: grid;
    max-width: 100%;
    grid-template-columns: calc(100% - 24px) 24px;
    margin-top: 4px;
    margin-bottom: 2px;
}

.artimus-button {
    background-color: var(--artimus-button-normal);
    color: var(--artimus-text);
    transition: 300ms background-color;

    border-width: 0px;
    border-style: solid;
    border-color: var(--artimus-background-2);
    border-radius: 16px;
}

.artimus-button:hover {
    background-color: var(--artimus-button-hover);
}

.artimus-button:active {
    background-color: var(--artimus-button-click);
    transition: 0ms background-color;
}

.artimus-button-selected {
    background-color: var(--artimus-button-selected);
}

.artimus-layerCreationButton {
    border-radius: 8px;
}

.artimus-layerCreationName {
    width: calc(100% - 12px);
    border-radius: 16px;
}

.artimus-layerButtonHolder {
    display: flex;
    flex-direction: column;
}

.artimus-layerButton {
    min-width: 24px;
    max-height: 24px;
    aspect-ratio: 1;
    height: auto;

    padding: 0px;

    border-radius: 16px;

    overflow: hidden;
}

.artimus-layerButton-thin {
    width: 24px;
    height: auto;
    aspect-ratio: 2/1;

    border-radius: 16px;

    overflow: hidden;
}

.artimus-layerArrow { 
    width: 100%;

    position: relative;

    top: 50%;
    left: 50%;
}

.artimus-hideIcon {
    width: 100%;
    height: 100%;
}

.artimus-layerArrow-down { transform: scale(1, -1) translate(-50%, 50%); }
.artimus-layerArrow-up { transform: translate(-50%, -50%); }

.artimus-sideBarButton {
    display: flex;
    width: 100%;

    justify-content: left;
    align-items: center;

    border-radius: 16px;

    margin-bottom: 4px;

    color: var(--artimus-text);
}

.artimus-toolbarTab {
    width: 100%;
    height: 100%;

    margin: 0px;
    padding: 0px;

    display: flex;
    align-items: center;
}

.artimus-toolIcon {
    width: 32px;
    height: 32px;

    margin-right: 16px;

    pointer-events: none;

    color: var(--artimus-icon);
}

.artimus-toolLabel {
    margin: 0px;
    text-align: center;

    pointer-events: none;
}

.artimus-tabIcon {
    width: 48px;
    height: 48px;
    margin-left: auto;
    margin-right: auto;
}

.artimus-layer {
    margin: 0px;
}


/* CUGI items */
.artimus-toolbar .CUGI-PropertyHolder {
    display: flex;
    margin: 2px;
    padding: 0px;

    font-family: monospace;
    font-weight: bold;
}

input[type="number"] {
    width: 48px;
}

.CUGI-Label {
    margin: 2px;
}

.CUGI-Popup {
    position: absolute;

    left: var(--x);
    top: var(--y);

    background-color: var(--artimus-background-1);
    border-width: 2px;
    border-radius: 20px;
    border-color: var(--artimus-background-3);
    border-style: solid;

    z-index: 99999;

    animation: 250ms CUGI-Popup-Open ease-out;
    overflow: hidden;
}

.CUGI-Button {
    width: 100%;
    text-align: left;
    padding-left: 8px;
    padding-right: 8px;

    background-color: var(--artimus-button-normal);
    transition: 300ms background-color;
}

.CUGI-Button:hover {
    background-color: var(--artimus-button-hover);
}

.CUGI-Button:active {
    background-color: var(--artimus-button-click);
    transition: 0ms background-color;
}

.CUGI-Slider {
    width: 50%;
}

@keyframes CUGI-Popup-Open {
    0% {
        scale: 1 0;
        translate: 0 -50%;
        opacity: 0%;
    }
    100% {
        scale: 1 1;
        translate: 0 0%;
        opacity: 100%;
    }
}

/* ? Portrait Screens ? */
@media screen and (min-height: 100vw) {
    /* Move tool bar to the top */
    .artimus-container {
        grid-template-rows: 200px 0px 1fr;
        grid-template-columns: auto;

        transition: 300ms grid-template-rows;
    }

    .artimus-toolbar {
        display: grid;
        grid-template-columns: 33.3333% 33.3333% 33.3333%;
        grid-template-rows: auto;
        width: 100%;
        height: 200px;

        max-height: 100%;
        min-height: 0px;
        transition: 300ms grid-template-columns;
    }

    @media (max-width: 50vh) {
        .artimus-container {
            grid-template-rows: 180px 48px 1fr;
        }

        .artimus-toolbar {
            grid-template-columns: calc(var(--tab-1) * 100%) calc(var(--tab-2) * 100%) calc(var(--tab-3) * 100%);
        }
    
        .artimus-toolbarTabs {
            grid-template-columns: 33.3333% 33.3333% 33.3333%;
            grid-template-rows: auto;

            transition: 300ms grid-template-columns;
        }

        .artimus-sideBarList {
            margin: calc(8px * var(--tab-open));
            padding: calc(4px * var(--tab-open));
        }
    }
}`;
document.head.appendChild(artimus.defaultStyleElement);