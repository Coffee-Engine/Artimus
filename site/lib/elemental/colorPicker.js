(function() {
    //Just a color library, made more-so for not repeating the same equations over and over again.
    elemental.colorLib = {
        BrightestChannel: (Color) => {
            if (typeof Color == "string") {
                const split = elemental.colorLib.HexToRGB(Color);

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
                const split = elemental.colorLib.HexToRGB(Color);

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
            const CMax = elemental.colorLib.BrightestChannel(RGB);
            const CMin = elemental.colorLib.DarkestChannel(RGB);

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
            return elemental.colorLib.RGBToHex(elemental.colorLib.HSVToRGB(HSV));
        },

        HexToHSV: (Hex) => {
            return elemental.colorLib.RGBToHSV(elemental.colorLib.HexToRGB(Hex));
        },

        //The object was tweaking if I'm honest with out.
        color: class {
            //Hex code, very simple, but the conversion to others is strange.
            #hex = "#000000";
            set hex(value) {
                this.#hex = value;
                
                const { r, g, b } = elemental.colorLib.HexToRGB(value);
                const { h, s, v } = elemental.colorLib.HexToHSV(value);

                this.#r = r;
                this.#g = g;
                this.#b = b;

                this.#h = h;
                this.#s = s;
                this.#v = v;
            }
            get hex() { return this.#hex; }

            //RGB code, simple, but repetitive.
            #r = 0;
            set r(value) {
                this.#r = value;
                this.updateForRGB();
            }
            get r() { return this.#r; }

            #g = 0;
            set g(value) {
                this.#g = value;
                this.updateForRGB();
            }
            get g() { return this.#g; }

            #b = 0;
            set b(value) {
                this.#b = value;
                this.updateForRGB();
            }
            get b() { return this.#b; }

            //HSV code, also simple, but repetitive.
            #h = 0
            set h(value) {
                this.#h = value;
                this.updateForHSV();
            }
            get h() { return this.#h; }

            #s = 0;
            set s(value) {
                this.#s = value;
                this.updateForHSV();
            }
            get s() { return this.#s; }

            #v = 0;
            set v(value) {
                this.#v = value;
                this.updateForHSV();
            }
            get v() { return this.#v; }

            updateForRGB() {
                this.#hex = elemental.colorLib.RGBToHex({ r: this.r, g: this.g, b: this.b });
                const { h, s, v } = elemental.colorLib.RGBToHSV({ r: this.r, g: this.g, b: this.b });
                this.#h = h;
                this.#s = s;
                this.#v = v;
            }

            updateForHSV() {
                this.#hex = elemental.colorLib.HSVToHex({ h: this.h, s: this.s, v: this.v });
                const { r, g, b } = elemental.colorLib.HSVToRGB({ h: this.h, s: this.s, v: this.v });
                this.#r = r;
                this.#g = g;
                this.#b = b;
            }

            //For some reason css doesn't support hsv? So just add simple hsl support.
            get HSL() {
                const l = Math.max(0, Math.min(1, this.v * (1 - (this.s / 2))));
                return {
                    h: this.h,
                    s: (l == 0 || l == 1) ? 0 : (this.v  - l)/Math.min(l, 1-l),
                    l: l
                }
            }
        }
    };

    //Set up our color picker.
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = "elemental-color-picker-container";
    
    const colorPickerSatBrightPicker = document.createElement("div");
    colorPickerSatBrightPicker.className = "elemental-color-picker-satBrightPicker";
    
    const colorPickerDragger = document.createElement("div");
    colorPickerDragger.className = "elemental-color-picker-colorPickerDragger";

    const hueSlider = document.createElement("div");
    hueSlider.className = "elemental-color-picker-hueSlider";
    
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

    colorPickerSatBrightPicker.appendChild(colorPickerDragger);

    firstAdjust.appendChild(firstSlider);
    secondAdjust.appendChild(secondSlider);
    thirdAdjust.appendChild(thirdSlider);

    colorPickerAdjustHolders.appendChild(firstAdjust);
    colorPickerAdjustHolders.appendChild(secondAdjust);
    colorPickerAdjustHolders.appendChild(thirdAdjust);

    colorPickerContainer.appendChild(colorPickerSatBrightPicker);
    colorPickerContainer.appendChild(hueSlider);
    colorPickerContainer.appendChild(colorPickerAdjustHolders);

    //For doing visual adjustments
    const adjustSliders = (valueName, value) => {
        switch (valueName) {
            case "r": currentColor.r = Math.floor(value * 255); break;
            case "g": currentColor.g = Math.floor(value * 255); break;
            case "b": currentColor.b = Math.floor(value * 255); break;
            case "h": currentColor.h = value * 360; break;
            case "s": currentColor.s = value; break;
            case "v": currentColor.v = value; break;
            case "hex": currentColor.hex = value; break;
        }

        firstSlider.style.setProperty("--x", `${currentColor.r / 2.55}%`);
        secondSlider.style.setProperty("--x", `${currentColor.g / 2.55}%`);
        thirdSlider.style.setProperty("--x", `${currentColor.b / 2.55}%`);

        firstAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ r: 0, g: currentColor.g, b: currentColor.b }));
        firstAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ r: 255, g: currentColor.g, b: currentColor.b }));

        secondAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ g: 0, r: currentColor.r, b: currentColor.b }));
        secondAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ g: 255, r: currentColor.r, b: currentColor.b }));

        thirdAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ b: 0, r: currentColor.r, g: currentColor.g }));
        thirdAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ b: 255, r: currentColor.r, g: currentColor.g }));

        firstSlider.style.setProperty("--color", currentColor.hex);
        secondSlider.style.setProperty("--color", currentColor.hex);
        thirdSlider.style.setProperty("--color", currentColor.hex);
        colorPickerDragger.style.setProperty("--color", currentColor.hex);

        colorPickerSatBrightPicker.style.setProperty("--color", elemental.colorLib.HSVToHex({ h: currentColor.h, s: 1, v: 1 }));

        colorPickerDragger.style.setProperty("--x", `${currentColor.s * 100}%`);
        colorPickerDragger.style.setProperty("--y", `${(1 - currentColor.v) * 100}%`);

        const { s, l } = currentColor.HSL;
        hueSlider.style.setProperty("--saturation", `${s * 100}%`);
        hueSlider.style.setProperty("--lightness", `${l * 100}%`);
    };

    const sliderFunctionality = (initEvent, parent, valueName) => {
        initEvent.stopPropagation();
        initEvent.preventDefault();

        const moveSlider = (event) => {
            event.stopPropagation();
            event.preventDefault();

            //Get bounds and calculate new value
            const { left, width, right } = parent.getBoundingClientRect();
            const percentage = (Math.max(left, Math.min(event.clientX, right)) - left) / width;
            adjustSliders(valueName, percentage);
        }

        const dropSlider = (event) => {
            document.body.removeEventListener("mousemove", moveSlider);
            document.body.removeEventListener("mouseup", dropSlider);
            document.body.removeEventListener("mouseleave", dropSlider);
        }

        document.body.addEventListener("mousemove", moveSlider);
        document.body.addEventListener("mouseup", dropSlider);
        document.body.addEventListener("mouseleave", dropSlider);
    };

    firstSlider.onmousedown = (event) => sliderFunctionality(event, firstAdjust, "r");
    secondSlider.onmousedown = (event) => sliderFunctionality(event, secondAdjust, "g");
    thirdSlider.onmousedown = (event) => sliderFunctionality(event, thirdAdjust, "b");

    //Now for clicking off the actual prompt.
    let currentColorPicker, currentColor;
    const clickOff = (event) => {
        if (event.target == currentColorPicker || colorPickerContainer.contains(event.target)) return;

        document.body.removeChild(colorPickerContainer);
        window.removeEventListener("mousedown", clickOff);
    }
    
    const popupColorPicker = (colorPicker, x, y) => {
        if (!colorPickerContainer.parentElement) document.body.appendChild(colorPickerContainer);
        colorPickerContainer.style.setProperty("--x", `${x}px`);
        colorPickerContainer.style.setProperty("--y", `${y}px`);

        currentColorPicker = colorPicker;
        currentColor = new elemental.colorLib.color();
        currentColor.hex = colorPicker.value;
        adjustSliders("no-op", 0);
        
        window.addEventListener("mousedown", clickOff);
    };

    //Define a custom color picker
    elemental.newElement("Color Picker", {
        class: class extends HTMLElement {
            static observedAttributes = ["value"];

            get value() { return this.getAttribute("value"); }

            constructor() {
                super();
                
                this.onclick = () => {
                    const clientRect = this.getBoundingClientRect();
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
            grid-template-columns: 50% 10% 40%;
        }

        .elemental-color-picker-satBrightPicker {
            --color: #f00;

            margin: 4px;
            border: 2px #dfdfdf inset;
            background: linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, var(--color) 100%);
        }

        .elemental-color-picker-colorPickerDragger {
            --color: #000000;
            --x: 0%;
            --y: 0%;

            position: relative;
            left: var(--x);
            top: var(--y);

            width: 10px;
            height: 10px;

            border: 2px #dfdfdf outset;
            border-radius: 100%;

            transform: translate(-50%, -50%);

            background-color: var(--color);        
        }
        
        .elemental-color-picker-hueSlider {
            --saturation: 100%;
            --lightness: 50%;

            margin: 4px 2px 4px 0px;
            border: 2px #dfdfdf inset;

            background: linear-gradient(to bottom, 
                hsla(0deg, var(--saturation), var(--lightness), 100%) 0%,
                hsla(36deg, var(--saturation), var(--lightness), 100%) 10%,
                hsla(72deg, var(--saturation), var(--lightness), 100%) 20%,
                hsla(108deg, var(--saturation), var(--lightness), 100%) 30%,
                hsla(144deg, var(--saturation), var(--lightness), 100%) 40%,
                hsla(180deg, var(--saturation), var(--lightness), 100%) 50%,
                hsla(216deg, var(--saturation), var(--lightness), 100%) 60%,
                hsla(252deg, var(--saturation), var(--lightness), 100%) 70%,
                hsla(288deg, var(--saturation), var(--lightness), 100%) 80%,
                hsla(324deg, var(--saturation), var(--lightness), 100%) 90%,
                hsla(360deg, var(--saturation), var(--lightness), 100%) 100%
            );
        }

        .elemental-color-picker-adjustHolder {
            display: grid;
            grid-template-rows: 25% 25% 25% 25%;
        }

        .elemental-color-picker-adjust  {
            --combinedLow: #000000;
            --color: #ff0000;

            margin: 4px 4px 2px 2px;
            border: 2px #dfdfdf inset;

            overflow: hidden;
            display: block;
        }

        .elemental-color-picker-firstAdjust { 
            --color: #ff0000;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        .elemental-color-picker-secondAdjust { 
            --color: #00ff00;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        .elemental-color-picker-thirdAdjust {
            --color: #0000ff;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }

        .elemental-color-picker-slider {
            --color: #000000;

            --x: 0%;
            margin-left: var(--x);

            width: 4px;
            height: calc(100% - 4px);
            border: 2px #dfdfdf outset;

            transform: translate(-50%, 0%);

            background-color: var(--color);
        }
        `
    });
})();