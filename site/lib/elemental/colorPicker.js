(function() {
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = "elemental-color-picker-container";
    
    const colorPickerSatBrightPicker = document.createElement("div");
    colorPickerSatBrightPicker.className = "elemental-color-picker-satBrightPicker";
    
    const colorPickerAdjustHolders = document.createElement("div");
    colorPickerAdjustHolders.className = "elemental-color-picker-adjustHolder";
    
    const firstAdjust = document.createElement("div");
    firstAdjust.className = "elemental-color-picker-adjust elemental-color-picker-firstAdjust";
    
    const firstSlider = document.createElement("div");
    firstSlider.className = "elemental-color-picker-slider";
    
    const secondAdjust = document.createElement("div");
    secondAdjust.className = "elemental-color-picker-adjust elemental-color-picker-secondAdjust";
    
    const secondSlider = document.createElement("div");
    secondSlider.className = "elemental-color-picker-slider";
    
    const thirdAdjust = document.createElement("div");
    thirdAdjust.className = "elemental-color-picker-adjust elemental-color-picker-thirdAdjust";
    
    const thirdSlider = document.createElement("div");
    thirdSlider.className = "elemental-color-picker-slider";

    firstAdjust.appendChild(firstSlider);
    secondAdjust.appendChild(secondSlider);
    thirdAdjust.appendChild(thirdSlider);

    colorPickerAdjustHolders.appendChild(firstAdjust);
    colorPickerAdjustHolders.appendChild(secondAdjust);
    colorPickerAdjustHolders.appendChild(thirdAdjust);

    colorPickerContainer.appendChild(colorPickerSatBrightPicker);
    colorPickerContainer.appendChild(colorPickerAdjustHolders);

    let currentColorPicker;
    const clickOff = (event) => {
        if (event.target == currentColorPicker || colorPickerContainer.contains(event.target)) return;

        document.body.removeChild(colorPickerContainer);
        window.removeEventListener("click", clickOff);
    }
    
    const popupColorPicker = (colorPicker, x, y) => {
        if (!colorPickerContainer.parentElement) document.body.appendChild(colorPickerContainer);
        colorPickerContainer.style.setProperty("--x", `${x}px`);
        colorPickerContainer.style.setProperty("--y", `${y}px`);

        currentColorPicker = colorPicker;
        window.addEventListener("click", clickOff);
    };

    //Define a custom color picker
    elemental.newElement("Color Picker", {
        class: class extends HTMLElement {
            static observedAttributes = ["value"];
            constructor() {
                super();
                
                this.onclick = () => {
                    const clientRect = this.getBoundingClientRect()
                    popupColorPicker(this, clientRect.left, clientRect.top);
                }
            }

            attributeChangedCallback(name, old, value) {
                this.style.setProperty("--color", value);
            }
        },

        css: `
        <el> {
            --color: #ff0000;

            display: inline-block;
            vertical-align: text-top;

            aspect-ratio: 1;

            width: auto;
            height: 0.75em;

            border: 0.125em #dfdfdf outset;

            background-color: var(--color);
        }

        <el>:hover { border-color: #afafaf; }
        <el>:active { border-style: inset; }

        .elemental-color-picker-container {
            --x: 0px;
            --y: 0px;

            position: absolute;
            top: var(--y);
            left: var(--x);

            aspect-ratio: 2/1;
            height: 96px;

            background-color: #efefef;
            border: 2px #dfdfdf outset;

            z-index: 9999;

            display: grid;
            grid-template-columns: 50% 50%;
        }

        .elemental-color-picker-satBrightPicker {
            margin: 4px;
            border: 2px #dfdfdf inset;
            background: linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, #f00 100%);
        }

        .elemental-color-picker-adjustHolder {
            display: grid;
            grid-template-rows: 25% 25% 25% 25%;
        }

        .elemental-color-picker-adjust  {
            margin: 4px 4px 2px 2px;
            border: 2px #dfdfdf inset;

            background: linear-gradient(to right, #000 0%, #f00 100%);

            overflow: hidden;
            display: block;
        }

        .elemental-color-picker-slider {
            --color: #000000;

            width: 4px;
            height: calc(100% - 4px);
            border: 2px #dfdfdf outset;

            transform: translate(-50%, 0%);

            background-color: var(--color);
        }
        `
    });
})();