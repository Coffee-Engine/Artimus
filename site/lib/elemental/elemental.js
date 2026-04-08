/*===---
MIT License

Copyright (c) 2026 Obvious Studios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
---===*/

/*  1 : dist/elemental.js  */
{
//Elemental, the quick and dirty way to define HTML elements using JS;
(function() {
    let defaultCSS = "";
    window.elemental = {
        elements: {},

        newElement: (name, options) => {
            if (!name || !options) return;

            //Define the new element
            let definedElement = class extends HTMLElement {};
            if (!options.class) {
                definedElement = class extends HTMLElement {

                    constructor() { super(); this.created(this); }

                    adoptedCallback() { this.adopted(this, this.parentElement != null, this.parentElement); }
                    
                    attributeChangedCallback(name, oldValue, newValue) { this.attributeChanged(this, name, oldValue, newValue); }

                    created() {}
                    adopted(added, parentElement) {}
                    attributeChanged() {}
                };

                if (options.created) definedElement.prototype.created = options.created;
                if (options.adopted) definedElement.prototype.adopted = options.adopted;
                if (options.attributeChanged) definedElement.prototype.attributeChanged = options.attributeChanged;
                if (options.attributes) definedElement.prototype.observedAttributes = options.attributes;
            }
            else definedElement = options.class;

            //Get the safe name and css prefix
            const safeName = name.toLowerCase().replaceAll(/\s/g, "-");
            options.prefix = options.prefix || `elemental-${safeName}-`;
            definedElement.prototype.cssPrefix = options.prefix;

            //Add css is available
            if (options.css) {
                defaultCSS += `\n/*${name}*/\n${options.css
                    .replaceAll("<el>", safeName)
                    .replaceAll("<element-name>", safeName)
                    .replaceAll("<pr>", `.${options.prefix}`)
                    .replaceAll("<prefix>", `.${options.prefix}`)
                }`;
                elemental.styleElement.innerHTML = defaultCSS;
            }
            
            customElements.define(safeName, definedElement, {
                extends: options.extends
            });

            //Add entries for the desired name and the safe name;
            elemental.elements[name] = definedElement;
            elemental.elements[safeName] = definedElement;

            return definedElement;
        },

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
            let DOM = elemental.DOMParser.parseFromString(`<elementalSanitizer>${svg}</elementalSanitizer>`, "application/xml");
            if (DOM.documentElement.tagName == "parsererror") return "<p>Invalid DOM</p>";

            //Search through children, and give the final result
            const children = [...DOM.querySelectorAll("*")];
            for (let childID = 0; childID < children.length; childID++) {
                const child = children[childID];
                if (elemental.badElements.includes(child.tagName.toLowerCase())) child.parentElement.removeChild(child);

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
        }
    }

    elemental.styleElement = document.createElement("style");
    document.head.insertBefore(elemental.styleElement, document.head.children[0]);
})();
}
/*  2 : dist/colorPicker.js  */
{
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

                //split into two. Check to see if one matches the description of a hex code, otherwise discard. And return pink
                const spl1 = Hex.match(/[a-f\d]/g);
                const spl2 = Hex.match(/[a-f\d][a-f\d]/g);
                let pref = spl2;

                if (spl1.length >= 3 && spl1.length <= 4) pref = spl1.map((val) => parseInt(val, 16) * 17);
                else if (spl2.length >= 3 && spl2.length <= 4) pref = spl2.map((val) => parseInt(val, 16));
                else return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 255,
                }

                //Make sure, and make GOD DAMN SURE. that the preferred array is either RGB, or RGBA
                if (pref.length == 3) return {
                    r: pref[0],
                    g: pref[1],
                    b: pref[2],
                    a: 255
                }
                else if (pref.length == 4) return {
                    r: pref[0],
                    g: pref[1],
                    b: pref[2],
                    a: pref[3]
                }
                else return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 255,
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
            let hexR = Math.floor(Math.max(Math.min(RGB.r, 255), 0)).toString(16);
            let hexG = Math.floor(Math.max(Math.min(RGB.g, 255), 0)).toString(16);
            let hexB = Math.floor(Math.max(Math.min(RGB.b, 255), 0)).toString(16);

            if (hexR.length == 1) hexR = "0" + hexR;
            if (hexG.length == 1) hexG = "0" + hexG;
            if (hexB.length == 1) hexB = "0" + hexB;

            //Transparency
            if (typeof RGB.a == "number") {
                let hexA = Math.floor(Math.max(Math.min(RGB.a, 255), 0)).toString(16);
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
            const h = HSV.h % 360;

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
                
                const { r, g, b, a } = elemental.colorLib.HexToRGB(value);
                const { h, s, v } = elemental.colorLib.HexToHSV(value);

                this.#r = r;
                this.#g = g;
                this.#b = b;
                this.#a = a;

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

            #a = 0;
            set a(value) {
                this.#a = value;
                this.updateForRGB();
            }
            get a() { return this.#a; }

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
                this.#hex = elemental.colorLib.RGBToHex({ r: this.r, g: this.g, b: this.b, a: this.a });
                const { h, s, v } = elemental.colorLib.RGBToHSV({ r: this.r, g: this.g, b: this.b });
                this.#h = h;
                this.#s = s;
                this.#v = v;
            }

            updateForHSV() {
                this.#hex = elemental.colorLib.HSVToHex({ h: this.h, s: this.s, v: this.v, a: this.a });
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

            constructor(hex) {
                if (typeof hex == "string") this.hex = hex;
            }
        },

        gradient: class {
            modeToCSSFunction = {
                "linear": () => `linear-gradient(${this.angle}rad`,
                "radial": () => `radial-gradient(at center`,
                "conic": () => `conic-gradient(from ${this.angle}rad`,
            }

            get css() {
                let gradient = this.modeToCSSFunction[this.mode]();
                for (let id in this.colors) {
                    gradient += `, ${this.colors[id][0].hex} ${this.colors[id][1] * 100}%`;
                }

                gradient += ")";

                return gradient;
            }

            constructor(contents, mode, angle) {
                //Default to pink and black if no content array is provided
                if (Array.isArray(contents)) {
                    const step = 1 / contents.length;
                    this.colors = [];
                    
                    let cur = 0;
                    for (let colorID in contents) {
                        const color = contents[colorID];
                        if (Array.isArray(color) && color.length >= 2) {
                            if (color[0] instanceof elemental.colorLib.color) this.colors.push([color[0], color[1]]);
                            else this.colors.push([new elemental.colorLib.color(color[0]), color[1]])
                        }
                        else if (typeof color == "string") {
                            cur += step;
                            this.colors.push([new elemental.colorLib.color(color), cur]);
                        }
                        else {
                            cur += step;
                            this.colors.push([new elemental.colorLib.color("#ff00ff"), cur]);
                        }
                    }

                    this.organizeColors();
                }
                else if (typeof contents == "string") this.parseCSS(contents);
                else this.failSafeColors();

                this.mode = mode || this.mode || "linear";
                this.angle = angle || this.angle || 0;
            }

            //JUST IN CASE
            failSafeColors() {
                this.mode = "linear";
                this.angle = 0;
                this.colors = [
                    [ new elemental.colorLib.color("#ff00ff"), 0 ],
                    [ new elemental.colorLib.color("#000000"), 1 ]
                ];

                this.organizeColors();

                return this.colors;
            }

            createPoint(percentage, color) {
                //Find the inbetween color.
                if (!color) {
                    const last = this.colors.length - 1;

                    //If we are before the first, or after the last inherit the first or last colours.
                    if (percentage < this.colors[0][1]) color = new elemental.colorLib.color(this.colors[0][0].hex);
                    else if (percentage > this.colors[last][1]) color = new elemental.colorLib.color(this.colors[last][0].hex);
                    else for (let i = 0; i < last; i++) {
                        const l = this.colors[i];
                        const r = this.colors[i + 1];

                        //If we are between two numbers interpolate
                        if (percentage > l[1] && percentage < r[1]) {
                            //Get RGBA, since it interpolates better for gradients than HSV.
                            const [ lr, lg, lb, la ] = [ l[0].r, l[0].g, l[0].b, l[0].a ]; 
                            const [ rr, rg, rb, ra ] = [ r[0].r, r[0].g, r[0].b, r[0].a ];

                            //Get the interpolation value
                            const int = (percentage - l[1]) / (r[1] - l[1]);

                            //Then interpolate
                            const ir = lr + (rr - lr) * int;
                            const ig = lg + (rg - lg) * int;
                            const ib = lb + (rb - lb) * int;
                            const ia = la + (ra - la) * int;

                            //finally create the new color object and set it's value to the new ones.
                            color = new elemental.colorLib.color("#ff00ff");
                            color.r = ir;
                            color.g = ig;
                            color.b = ib;
                            color.a = ia;
                        }
                        //If we ontop of one set the new color object to it.
                        else if (percentage == l[1]) color = new elemental.colorLib.color(l[0].hex);
                        else if (percentage == r[1]) color = new elemental.colorLib.color(r[0].hex);

                        //If we finally have a color, break the loop.
                        if (color) break;
                    }
                }

                this.colors.push([color, percentage]);
                this.organizeColors();

                return this.colors.findIndex((val) => val[0] == color);
            }

            parseCSSAngle(angle) {
                let parsed = 0;
                //For rads it's a simple find and parse.
                if (angle.endsWith("rad")) {
                    parsed = Number(angle.replace("rad", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                }
                //For degrees we need to convert.
                else if (angle.endsWith("deg")) {
                    parsed = Number(angle.replace("deg", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= 0.01745329;
                }
                //Who uses gradians?
                else if (angle.endsWith("grad")) {
                    parsed = Number(angle.replace("grad", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= 0.01570796;
                }
                //and then turns
                else if (angle.endsWith("turn")) {
                    parsed = Number(angle.replace("turn", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= Math.PI * 2;
                }

                return parsed;
            }

            parseColorsFromArgs(args, from) {
                const colors = [];

                //Get step just in case;
                const step = 100 / (args.length - from);
                let cur = 0;

                for (let i=from; i<args.length; i++) {
                    let arg=args[i];
                    
                    //How, but if so just default it to pink
                    if (arg.length == 0) arg = ["#ff00ff", `${cur}%`];
                    else if (arg.length == 1) {
                        cur += step;
                        arg = [arg[0], `${cur}%`];
                    }

                    //Make sure both sides are SOMEWHAT valid
                    if (!arg[0].startsWith("#")) arg[0] = "#ff00ff";
                    if (!arg[1].endsWith("%")) {
                        cur += step;
                        arg[1] = `${cur}%`;
                    }

                    //Final parse
                    arg[0] = new elemental.colorLib.color(arg[0]);
                    arg[1] = Number(arg[1].trim().replace("%", "")) / 100;
                    
                    //If it is somehow still not valid, make it
                    if (isNaN(arg[1])) {
                        cur += step;
                        arg[1] = cur / 100;
                    }
                    else cur = arg[1];

                    //Finally add it to the array;
                    colors.push([arg[0], arg[1]]);
                }

                return colors;
            }

            organizeColors() {
                this.colors.sort((a, b) => a[1] - b[1]);
            }

            //The actual parsing of each type;
            cssReaders = {
                "linear": (args) => {
                    if (args.length < 3) return false;
                    this.angle = this.parseCSSAngle(args[0][0]);

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                },
                "radial": (args) => {
                    if (args.length < 3) return false;

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                },
                "conic": (args) => {
                    if (args.length < 3) return false;

                    //Parse the angle, because "From" can be here for some reason
                    if (args[0].length == 0) this.angle = 0;
                    else if (args[0].length == 1) this.angle = this.parseCSSAngle(args[0][0]);
                    else if (args[0].length == 2) this.angle = this.parseCSSAngle(args[0][1]);

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                }
            }

            parseCSS(str) {
                let func = "";
                let i = 0;

                //Grab function
                while (str.charAt(i) != "(" && i < str.length) {
                    func += str.charAt(i);
                    i++;
                }

                //make sure we didn't just hit a dead end.
                if (i >= str.length) return this.failSafeColors();

                //otherwise trim the function name
                func = elemental.colorLib.gradientFunc2Type[func.trim().toLowerCase()];
                if (!func) func = "linear";
                this.mode = func;
                
                //Step off and read args
                i++;

                let args = "";
                while(str.charAt(i) != ")" && i < str.length) {
                    args += str.charAt(i);
                    i++;
                }

                if (i >= str.length || args.length == 0) return this.failSafeColors();

                //Clean up the arguments
                args = args.split(",");
                for (let argsID in args) {
                    //Trim and split each argument into it's components,
                    //Also make sure to fancy them up aswell.
                    args[argsID] = args[argsID].trim().split(" ").reduce(
                        (acc, cur) => { 
                            if (cur) acc.push(cur.trim()) 
                            return acc;
                        }, 
                        []
                    );
                }

                if (this.cssReaders[func]) {
                    const success = this.cssReaders[func](args);
                    if (!success) return this.failSafeColors();
                }
                else return this.failSafeColors();

                this.organizeColors();
            }
        },

        gradientFunc2Type: {
            "linear-gradient":"linear",
            "radial-gradient":"radial",
            "conic-gradient": "conic",
        },

        unpackString(str, noGradient) {
            if (typeof str != "string") return;

            if (str.startsWith("#")) return new elemental.colorLib.color(str);
            else if (!noGradient) return new elemental.colorLib.gradient(str);
            else return new elemental.colorLib.color("#000000");
        }
    };

    //Set up configuration and the base module.
    elemental.colorPickerConfig = {
        sliderDirection: {
            primary: "x",
            secondary: "x",
            tertiary: "x",
            alpha: "x",
            hue: "y",
            satValue: "xy"
        },

        sliderTarget: {
            primary: "r",
            secondary: "g",
            tertiary: "b",
            alpha: "a",
            hue: "h",
            satValue: [ "s", "v" ]
        },

        hexInputShowsGradient: true,

        addGradientPointIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="73.22485" height="73.22485" viewBox="0,0,73.22485,73.22485"><g transform="translate(-203.38757,-143.38757)"><g fill="none" stroke-miterlimit="10"><path d="M240,149.1568v61.68639" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M209.15681,180h61.68639" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M203.38757,216.61243v-73.22485h73.22485v73.22485z" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,
        removeGradientPointIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="73.22485" height="73.22485" viewBox="0,0,73.22485,73.22485"><g transform="translate(-203.38757,-143.38757)"><g fill="none" stroke-miterlimit="10"><path d="M218.19057,158.19057l43.61887,43.61887" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M218.19057,201.80943l43.61886,-43.61886" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M203.38757,216.61243v-73.22485h73.22485v73.22485z" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,
        doneButtonIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="65.19397" height="65.19397" viewBox="0,0,65.19397,65.19397"><g transform="translate(-207.40302,-147.40302)"><g fill="none" stroke-miterlimit="10"><path d="M214.67672,179.166l15.69437,15.69437l34.95219,-29.72073" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M207.40302,212.59698v-65.19397h65.19397v65.19397z" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,
        angleArrowIcon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="62.2449" height="62.2449" viewBox="0,0,62.2449,62.2449"><g transform="translate(-208.87755,-148.87755)"><g stroke-miterlimit="10"><path d="M240,179.71523v-22.07249" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M234.99925,159.82583l5.00075,-6.58188l5.00075,6.58188z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="butt"/><path d="M208.87755,211.12245v-62.2449h62.2449v62.2449z" fill="none" stroke="none" stroke-width="0" stroke-linecap="butt"/></g></g></svg>`,
    
        //Originally from a swatch, but now awesome.
        globalSwatch: [ "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#000000" ]
    };

    elemental.colorPickerModule = class {
        constructor(parent) {
            this.parent = parent;
            this.build(parent, parent.container);
        }

        build(parent, container) {}
        updateColor(target, value, parent) {}
        destroy(parent) {}

        condition(parent) { return true; }
    }

    //The base sliders for the colour picker
    elemental.colorPickerGeneric = class extends elemental.colorPickerModule {
        build(parent, container) {
            this.sliderContainer = document.createElement('div');
            this.sliderContainer.className = `${parent.cssPrefix}slider-container`;
            
            this.satValueAdjust = document.createElement("div");
            this.satValueAdjust.className = `${parent.cssPrefix}satBrightPicker`;
            
            this.satValueSlider = document.createElement("div");
            this.satValueSlider.className = `${parent.cssPrefix}satValueSlider`;

            this.hueAdjust = document.createElement("div");
            this.hueAdjust.className = `${parent.cssPrefix}-adjust ${parent.cssPrefix}hueAdjust`;
            
            this.hueSlider = document.createElement("div");
            this.hueSlider.className = `${parent.cssPrefix}slider ${parent.cssPrefix}hueSlider`;

            this.colorPickerAdjustHolders = document.createElement("div");
            this.colorPickerAdjustHolders.className = `${parent.cssPrefix}adjustHolder`;
            
            this.firstAdjust = document.createElement("div");
            this.firstAdjust.className = `${parent.cssPrefix}adjust ${parent.cssPrefix}firstAdjust`;
            
            this.firstSlider = document.createElement("div");
            this.firstSlider.className = `${parent.cssPrefix}slider`;
            
            this.secondAdjust = document.createElement("div");
            this.secondAdjust.className = `${parent.cssPrefix}adjust ${parent.cssPrefix}secondAdjust`;
            
            this.secondSlider = document.createElement("div");
            this.secondSlider.className = `${parent.cssPrefix}slider`;
            
            this.thirdAdjust = document.createElement("div");
            this.thirdAdjust.className = `${parent.cssPrefix}adjust ${parent.cssPrefix}thirdAdjust`;
            
            this.thirdSlider = document.createElement("div");
            this.thirdSlider.className = `${parent.cssPrefix}slider`;
            

            this.satValueAdjust.appendChild(this.satValueSlider);

            this.firstAdjust.appendChild(this.firstSlider);
            this.secondAdjust.appendChild(this.secondSlider);
            this.thirdAdjust.appendChild(this.thirdSlider);
            this.hueAdjust.appendChild(this.hueSlider);

            this.colorPickerAdjustHolders.appendChild(this.firstAdjust);
            this.colorPickerAdjustHolders.appendChild(this.secondAdjust);
            this.colorPickerAdjustHolders.appendChild(this.thirdAdjust);

            this.sliderContainer.appendChild(this.satValueAdjust);
            this.sliderContainer.appendChild(this.hueAdjust);
            this.sliderContainer.appendChild(this.colorPickerAdjustHolders);

            //Set up alpha is alpha exists
            if (parent.hasAttribute("alpha")) {
                this.alphaAdjust = document.createElement("div");
                this.alphaAdjust.className = `${parent.cssPrefix}adjust ${parent.cssPrefix}alphaAdjust`;
                
                this.alphaSlider = document.createElement("div");
                this.alphaSlider.className = `${parent.cssPrefix}slider ${parent.cssPrefix}alphaSlider`;

                this.alphaAdjust.appendChild(this.alphaSlider);
                this.colorPickerAdjustHolders.appendChild(this.alphaAdjust);
                parent.setupSliderFunctionality(this.alphaAdjust, "alpha");
            }
            
            container.appendChild(this.sliderContainer);

            parent.setupSliderFunctionality(this.firstAdjust, "primary");
            parent.setupSliderFunctionality(this.secondAdjust, "secondary");
            parent.setupSliderFunctionality(this.thirdAdjust, "tertiary");
            parent.setupSliderFunctionality(this.hueAdjust, "hue");
            parent.setupSliderFunctionality(this.satValueAdjust, "satValue");
        }

        updateColor(target, value, parent) {
            //Grab the current color
            let color = parent.color;
            if (color instanceof elemental.colorLib.gradient) color = color.colors[parent.gradientIndex][0];

            //Set variables needed for each value.
            this.firstSlider.style.setProperty("--x", `${color.r / 2.55}%`);
            this.secondSlider.style.setProperty("--x", `${color.g / 2.55}%`);
            this.thirdSlider.style.setProperty("--x", `${color.b / 2.55}%`);
            if (this.alphaAdjust) this.alphaSlider.style.setProperty("--x", `${color.a / 2.55}%`);
            this.hueSlider.style.setProperty("--x", `${color.h / 3.6}%`);

            this.firstAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ r: 0, g: color.g, b: color.b }));
            this.firstAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ r: 255, g: color.g, b: color.b }));

            this.secondAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ g: 0, r: color.r, b: color.b }));
            this.secondAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ g: 255, r: color.r, b: color.b }));

            this.thirdAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ b: 0, r: color.r, g: color.g }));
            this.thirdAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ b: 255, r: color.r, g: color.g }));

            //Then the color properties
            const alphalessHex = elemental.colorLib.RGBToHex({ r: color.r, g: color.g, b: color.b });
            if (this.alphaAdjust) {
                this.alphaAdjust.style.setProperty("--color", alphalessHex);
                this.alphaSlider.style.setProperty("--color", color.hex);
            }

            this.firstSlider.style.setProperty("--color", alphalessHex);
            this.secondSlider.style.setProperty("--color", alphalessHex);
            this.thirdSlider.style.setProperty("--color", alphalessHex);
            this.satValueSlider.style.setProperty("--color", alphalessHex);
            this.hueSlider.style.setProperty("--color", alphalessHex);

            //Set the color on the big square
            this.satValueAdjust.style.setProperty("--color", elemental.colorLib.HSVToHex({ h: color.h, s: 1, v: 1 }));

            //Move the dragger on the big square
            this.satValueSlider.style.setProperty("--x", `${color.s * 100}%`);
            this.satValueSlider.style.setProperty("--y", `${(1 - color.v) * 100}%`);

            //Then the needed for the hue adjuster.
            const { s, l } = color.HSL;
            this.hueAdjust.style.setProperty("--saturation", `${s * 100}%`);
            this.hueAdjust.style.setProperty("--lightness", `${l * 100}%`);
        }
    }

    //Then gradient tools
    elemental.colorPickerGradient = class extends elemental.colorPickerModule {
        //Javascript gets a hissy fit if this is private for some reason.
        set mode(value) {
            const lastMode = this._mode;
            this._mode = value;
            this.updateMode(value, lastMode);
        }

        get mode() {
            return this._mode;
        }

        build(parent, container) {
            if (parent.color instanceof elemental.colorLib.color) this._mode = "none";
            else this._mode = parent.color.mode;

            //Define modes with angles
            this.modesWithAngles = [
                "linear",
                "conic"
            ]

            //Splits between colors and angle
            this.topSplit = document.createElement("div");
            this.topSplit.className = `${parent.cssPrefix}gradient-top-split`;

            //The angle selector
            this.angleInput = document.createElement("div");
            this.angleInput.innerHTML = elemental.sanitizeDOM(elemental.colorPickerConfig.angleArrowIcon);
            this.angleInput.classList = `${parent.cssPrefix}gradient-angle-selector`;

            //Then the actual gradient and gradient selection stuff.
            this.gradientContainer = document.createElement("div");
            this.gradientContainer.className = `${parent.cssPrefix}gradient-container`;

            this.buttonContainer = document.createElement("div");
            this.buttonContainer.className = `${parent.cssPrefix}gradient-buttons`;

            this.pointControlContainer = document.createElement("div");
            this.pointControlContainer.className = `${parent.cssPrefix}gradient-modes ${parent.cssPrefix}gradient-point-controls`;

            //We use SVGs to allow for the icons to be recoloured in real time. Ain't that neat?
            this.addButton = document.createElement("div");
            this.addButton.innerHTML = elemental.sanitizeDOM(elemental.colorPickerConfig.addGradientPointIcon);
            this.addButton.classList = `${parent.cssPrefix}gradient-button ${parent.cssPrefix}gradient-add-button`;

            this.removeButton = document.createElement("div");
            this.removeButton.innerHTML = elemental.sanitizeDOM(elemental.colorPickerConfig.removeGradientPointIcon);
            this.removeButton.classList = `${parent.cssPrefix}gradient-button ${parent.cssPrefix}gradient-remove-button`;

            //For modes we just need a simple container and display gradient.
            this.modeContainer = document.createElement("div");
            this.modeContainer.className = `${parent.cssPrefix}gradient-modes`;

            //Create mode buttons
            this.modes = {
                none: document.createElement("div"),
                linear: document.createElement("div"),
                radial: document.createElement("div"),
                conic: document.createElement("div"),
            };

            //Create the display gradient but keep it hidden because it will only appear when a gradient mode is selected.
            this.displayGradient = document.createElement("div");
            this.displayGradient.className = `${parent.cssPrefix}gradient-display`;

            //Append the html elements and update the selected mode.
            this.modeContainer.appendChild(this.modes.none);
            this.modeContainer.appendChild(this.modes.linear);
            this.modeContainer.appendChild(this.modes.radial);
            this.modeContainer.appendChild(this.modes.conic);

            this.pointControlContainer.appendChild(this.addButton);
            this.pointControlContainer.appendChild(this.removeButton);

            this.buttonContainer.appendChild(this.modeContainer);

            this.gradientContainer.appendChild(this.buttonContainer);

            this.topSplit.appendChild(this.gradientContainer);
            container.appendChild(this.topSplit);

            //functionality
            this.modes.none.onclick = () => this.mode = "none";
            this.modes.linear.onclick = () => this.mode = "linear";
            this.modes.radial.onclick = () => this.mode = "radial";
            this.modes.conic.onclick = () => this.mode = "conic";

            //Get the current color, find the next/last point, and add the inbetween.
            this.addButton.onclick = () => {
                let interpIndex = parent.gradientIndex;
                
                //Make sure we are a gradient
                if (parent.color instanceof elemental.colorLib.gradient) {
                    //Find the next best sample
                    if (interpIndex >= (parent.color.colors.length - 1)) interpIndex--;
                    else interpIndex++;

                    //Get the colors
                    const cur = parent.color.colors[parent.gradientIndex];
                    const next = parent.color.colors[interpIndex];

                    const percentage = (cur[1] + next[1]) / 2;

                    //Move to new point
                    const id = parent.color.createPoint(percentage);
                    parent.gradientIndex = id;

                    //Update the color selectors
                    this.parent.updateColor(null, 0);
                    this.addSelectors();
                }
            }

            //Kill the current color
            this.removeButton.onclick = () => {
                let interpIndex = parent.gradientIndex;
                
                //Make sure we are a gradient
                if (parent.color instanceof elemental.colorLib.gradient) {
                    if (parent.color.colors.length <= 2) return;

                    //Find the next best sample
                    parent.color.colors.splice(interpIndex, 1);

                    if (interpIndex >= parent.color.colors.length) interpIndex--;
                    parent.gradientIndex = interpIndex;


                    //Update the color selectors
                    this.parent.updateColor(null, 0);
                    this.addSelectors();
                }
            }

            //Angle stuffs
            const angleDrag = (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (parent.color instanceof elemental.colorLib.gradient) {
                    const {left, width, top, height} = this.angleInput.getBoundingClientRect(); 
                    const angle = Math.atan2(event.clientX - (left + (width / 2)), event.clientY - (top + (height / 2)));
                    
                    //Update the angle and push the update event.
                    parent.color.angle = Math.PI - angle;
                    parent.updateColor(null, 0);
                }
                else {
                    angleDragEnd();
                }
            }

            const angleDragEnd = () => {
                document.body.removeEventListener("pointermove", angleDrag);
                document.body.removeEventListener("pointerup", angleDragEnd);
            }

            //Kill any touch events on the angle input.
            this.angleInput.ontouchstart = (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
            }

            this.angleInput.onpointerdown = (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (parent.color instanceof elemental.colorLib.gradient) {
                    const {left, width, top, height} = this.angleInput.getBoundingClientRect(); 
                    const angle = Math.atan2(event.clientX - (left + (width / 2)), event.clientY - (top + (height / 2)));
                    
                    //Update the angle and push the update event.
                    parent.color.angle = Math.PI - angle;
                    parent.updateColor(null, 0);

                    document.body.addEventListener("pointermove", angleDrag);
                    document.body.addEventListener("pointerup", angleDragEnd);
                }
            }


            //Behavior for the display gradient is this
            // click -> (Is on selector) -> no? -> create point
            //                v Yes?
            //            Select point
            this.displayGradient.onmousedown = (event) => {
                const { left, right, width } = this.displayGradient.getBoundingClientRect();
                const percentage = (Math.max(Math.min(right, event.clientX), left) - left) / width;

                //Create the point if possible, and change the index;
                if (parent.color instanceof elemental.colorLib.gradient) {
                    const id = parent.color.createPoint(percentage);
                    parent.gradientIndex = id;

                    //Update the color selectors
                    this.parent.updateColor(null, 0);
                    this.addSelectors();
                }
            }

            this.updateMode(this.mode, this.mode);
            this.addSelectors();
        }

        updateColor(target, value, parent) {
            this.updateDisplayGradient();
            
            //Update selected color on gradient if need be.
            if (parent.color instanceof elemental.colorLib.gradient) {
                const gradIndex = this.parent.gradientIndex;
                if (this.colorGrabbers[gradIndex]) this.colorGrabbers[gradIndex].style.setProperty("--color", parent.color.colors[gradIndex].hex);
            }

            //Switch color mode to full if need be.
            if (target == "hex" || target == "full") {
                if (parent.color instanceof elemental.colorLib.color && this.mode != "none") this.mode = "none";
                else if (parent.color instanceof elemental.colorLib.gradient && this.mode != parent.color.mode) this.mode = parent.color.mode;
            }

            //Set the gradient for the angle selector if need be.
            if (this.parent.color instanceof elemental.colorLib.gradient && this.angleInput.parentElement) {
                this.angleInput.style.setProperty("--gradient", parent.color.css);
                this.angleInput.style.setProperty("--direction", `${parent.color.angle}rad`);
            }
        }

        addSelectors() {
            //Clear the display gradient of children
            this.displayGradient.innerHTML = "";
            this.colorGrabbers = [];

            if (this.mode == "none") return;

            //Make sure we are a gradient, and if we are, summon the grabbers
            if (this.parent.color instanceof elemental.colorLib.gradient) {
                const gradient = this.parent.color;

                //Loop through colors and build the gradient grabbers;
                for (let i = 0; i < gradient.colors.length; i++) {
                    const color = gradient.colors[i];          
                    //Create the color's element and assign needed variables
                    const element = document.createElement("div");
                    element.className = `${this.parent.cssPrefix}gradient-point`;
                    this.displayGradient.appendChild(element);

                    //Check to see if it's awesome and cool, and totally the selected one.
                    if (this.parent.gradientIndex == i) element.className += ` ${this.parent.cssPrefix}gradient-point-selected`;

                    //Kill any touch events on the created element
                    element.ontouchstart = (event) => {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    //The behavior is rather simple, but we do need to stop propagation to prevent unwanted point creation.
                    element.onpointerdown = (event) => {
                        event.stopImmediatePropagation();
                        event.preventDefault();

                        //Reset the class of the previously selected
                        this.colorGrabbers[this.parent.gradientIndex].className = `${this.parent.cssPrefix}gradient-point`;

                        //Change the selection and select the current one
                        this.parent.gradientIndex = i;
                        this.parent.updateColor(null, 0);
                        element.className = `${this.parent.cssPrefix}gradient-point ${this.parent.cssPrefix}gradient-point-selected`;

                        //Drag function for incase we want to move the selector.
                        let dragged = false;

                        const dragFunction = (event) => {
                            //calculate and change the percentage value
                            const { left, right, width } = this.displayGradient.getBoundingClientRect();
                            const percentage = (Math.max(Math.min(right, event.clientX), left) - left) / width;
                            gradient.colors[i][1] = percentage;

                            //Tick the dragged bool, and update values;
                            dragged = true;

                            this.parent.color.organizeColors();
                            
                            //If we changed index find out. our new one
                            if (gradient.colors[i][0] != color[0]) {
                                i = gradient.colors.findIndex((val) => val[0] == color[0]);
                                this.parent.gradientIndex = i;
                            }

                            this.parent.updateColor(null, 0);
                            element.style.setProperty("--x", `${percentage * 100}%`);
                        }

                        const dragEnd = (event) => {
                            document.body.removeEventListener("pointermove", dragFunction);
                            document.body.removeEventListener("pointerup", dragEnd);

                            //If we dragged update the color and stuff;
                            if (dragged) {
                                this.parent.updateColor(null, 0);
                                this.parent.color.organizeColors();
                                this.addSelectors();
                            }
                        }

                        document.body.addEventListener("pointermove", dragFunction);
                        document.body.addEventListener("pointerup", dragEnd);
                    }

                    element.style.setProperty("--color", color[0].hex);
                    element.style.setProperty("--x", `${color[1] * 100}%`);

                    //Add it to the array and update the linear gradient.
                    this.colorGrabbers.push(element);
                }
                
                this.updateDisplayGradient()
            }
        }

        updateDisplayGradient() {
            if (this.mode == "none") return;

            //Make sure we are a gradient, and if we are, summon the grabbers
            if (this.parent.color instanceof elemental.colorLib.gradient) {
                const gradient = this.parent.color;

                //Loop through colors and build the gradient display;
                let linearGrad = "linear-gradient(to right";
                for (let i = 0; i < gradient.colors.length; i++) {
                    const color = gradient.colors[i];
                    linearGrad += `, ${color[0].hex} ${color[1] * 100}%`;
                }

                linearGrad += ")";

                this.displayGradient.style.setProperty("--gradient", linearGrad);
            }
        }

        updateMode(current, last) {
            //Update buttons to reflect current selection.
            for (let buttonMode in this.modes) {
                this.modes[buttonMode].className = `${this.parent.cssPrefix}gradient-mode ${this.parent.cssPrefix}gradient-mode-${buttonMode}`;

                if (this.mode == buttonMode) this.modes[buttonMode].className += ` ${this.parent.cssPrefix}gradient-mode-selected`;
            }

            //Convert the color if need be;
            if (this.mode != "none") { 
                if (!this.displayGradient.parentElement) this.gradientContainer.appendChild(this.displayGradient);
                if (!this.pointControlContainer.parentElement) this.buttonContainer.appendChild(this.pointControlContainer);

                //Add/remove angle input depending on if angles would be relevant in this context.
                if (this.modesWithAngles.includes(this.mode)) this.topSplit.appendChild(this.angleInput);
                else if (this.angleInput.parentElement) this.angleInput.parentElement.removeChild(this.angleInput);
            }
            else {
                if (this.displayGradient.parentElement) this.displayGradient.parentElement.removeChild(this.displayGradient);
                if (this.pointControlContainer.parentElement) this.pointControlContainer.parentElement.removeChild(this.pointControlContainer);
                if (this.angleInput.parentElement) this.angleInput.parentElement.removeChild(this.angleInput);
            }

            //Now we convert the color if need be;
            if (current != last) {
                //Make sure we are switching from none, and are not a gradient, if so convert to gradient
                if (last == "none" && this.parent.color instanceof elemental.colorLib.color) {
                    //Convert to gradient
                    const grad = new elemental.colorLib.gradient([
                        [this.parent.color, 0],
                        [new elemental.colorLib.color((this.parent.hasAttribute("alpha")) ? "#00000000" : "#000000"), 1],
                    ], current);

                    this.parent.color = grad;
                }
                //Otherwise, check for us being a gradient, and us once being one
                else if (last != "none" && this.parent.color instanceof elemental.colorLib.gradient) {
                    //If we are no longer one, grab the first color from the gradient
                    if (current == "none") {
                        const color = this.parent.color.colors[0][0];
                        this.parent.color = color;
                    }
                    //Otherwise just switch gradient type.
                    else this.parent.color.mode = current;
                }

                this.addSelectors();
                this.parent.updateColor(null, 0);
            }

            //Clamp the gradient index to the colors available to the user.
            if (this.parent.color instanceof elemental.colorLib.gradient) {
                this.parent.gradientIndex = Math.ceil(Math.max(0, this.parent.gradientIndex), this.parent.color.colors.length);
            }
        }

        condition(parent) { return parent.hasAttribute("gradient"); }
    }

    //And palette tools
    elemental.colorPickerPalette = class extends elemental.colorPickerModule {
        build(parent, container) {
            //Create the elements
            this.colorContainer = document.createElement("div");
            this.colorContainer.className = `${parent.cssPrefix}palette-container`;

            //Parse palette
            let palette = parent.getAttribute("swatch")
            if (palette) palette = palette.split(",").map((val, ind) => {
                const color = val.trim();

                //Replace with pink and black if failing.
                if (!color.startsWith("#")) return ((ind % 2) == 1) ? "#ff00ff" : "#000000";
                return color;
            });
            else palette = [...elemental.colorPickerConfig.globalSwatch];

            //Append the container
            container.appendChild(this.colorContainer);

            //And add the colors
            for (let colorID = 0; colorID < palette.length; colorID++) {
                const color = palette[colorID];

                const element = document.createElement("div");
                element.className = `${parent.cssPrefix}palette-color`;
                element.style.setProperty("--color", color);

                this.colorContainer.appendChild(element);

                //functionality for each one.
                element.onclick = () => {
                    //Grab the current color
                    let pickerColor = parent.color;
                    if (pickerColor instanceof elemental.colorLib.gradient) pickerColor = pickerColor.colors[parent.gradientIndex][0];

                    pickerColor.hex = color;
                    parent.updateColor(null, 0);
                }
            }
        }

        condition(parent) { return parent.hasAttribute("swatch"); }
    }

    //Finally the hex, and done button
    elemental.colorPickerConfirmation = class extends elemental.colorPickerModule {
        build(parent, container) {
            //Create the elements
            this.container = document.createElement("div");
            this.container.className = `${parent.cssPrefix}confirmation-container`;

            this.hexInput = document.createElement("input");
            this.hexInput.type = "text";
            this.hexInput.className = `${parent.cssPrefix}confirmation-hex`;

            this.doneButton = document.createElement("div");
            this.doneButton.innerHTML = elemental.sanitizeDOM(elemental.colorPickerConfig.doneButtonIcon);
            this.doneButton.className = `${parent.cssPrefix}confirmation-done-button`;

            this.container.appendChild(this.hexInput);
            this.container.appendChild(this.doneButton);
            container.appendChild(this.container);

            //Functionality.
            this.hexInput.onchange = () => {            
                if (elemental.colorPickerConfig.hexInputShowsGradient) {
                    parent.value = this.hexInput.value;
                    this.parent.updateColor("full", this.hexInput.value);
                }
                else parent.updateColor("hex", this.hexInput.value);
            }

            this.doneButton.onclick = () => {
                parent.destroyPopup()
            }
        }

        updateColor(target, value, parent) {
            //Grab the current color
            let color = parent.color;

            //Determine if we want the whole gradient code or not.
            if (elemental.colorPickerConfig.hexInputShowsGradient) {
                this.hexInput.value = parent.value
                return;
            }
            else if (color instanceof elemental.colorLib.gradient) color = color.colors[parent.gradientIndex][0];

            this.hexInput.value = color.hex;
        }
    }

    //Modules we have by default if the colour picker element doesn't specify any. Right now a take all situation.
    elemental.colorPickerConfig.modules = [
        elemental.colorPickerGradient,
        elemental.colorPickerGeneric,
        elemental.colorPickerPalette,
        elemental.colorPickerConfirmation
    ]

    //Define a custom color picker
    elemental.newElement("Color Picker", {
        class: class extends HTMLElement {
            // "isgradient" is moreso for css
            static observedAttributes = ["value", "gradient", "alpha", "swatch", "isgradient", "disabled"];

            #fromUpdate = false;

            gradientIndex = 0;

            set value(value) {
                this.style.setProperty("--color", value);
                //Update colors if the source of the value being set is not from the update.
                if (!this.#fromUpdate) {
                    //Make sure value is valid
                    if (!value) return;

                    //If so do our thing
                    this.color = elemental.colorLib.unpackString(value, !this.hasAttribute("gradient"));

                    //update gradient attrib
                    const isGradient = this.color instanceof elemental.colorLib.gradient;
                    this.setAttribute("isgradient", isGradient);

                    //Update the value;
                    this.#fromUpdate = true;
                    if (isGradient) this.setAttribute("value", this.color.css);
                    else this.setAttribute("value", this.color.hex);
                    this.#fromUpdate = false;
    
                    //Update the color
                    this.style.setProperty("--color", this.getAttribute("value"));

                }
                else {
                    this.setAttribute("value", value);

                    //Dispatch the change event.
                    if (!this.hasAttribute("disabled") || this.getAttribute("disabled") == "false") this.dispatchEvent(new Event("change"));
                }
            }
            get value() {
                if (this.hasAttribute("value")) return this.getAttribute("value");
                else return "#000000";
            }

            #mouseDownFunc;
            spawnedModules = [];

            //Attributes!!!
            //Remove or add gradient depending on fields.
            set gradient(value) {
                if (value) this.setAttribute("gradient", "");
                else if (this.hasAttribute("gradient")) this.removeAttribute("gradient");
            }

            get gradient() { return this.hasAttribute("gradient"); }

            //Remove or add alpha depending on fields.
            set alpha(value) {
                if (value) this.setAttribute("alpha", "");
                else if (this.hasAttribute("alpha")) this.removeAttribute("alpha");
            }

            get alpha() { return this.hasAttribute("alpha"); }

            //Customize swatch depending on field.
            set swatch(value) {
                if (value) {
                    this.setAttribute("swatch", "");
                    
                    //Determine if we need special handling
                    if (Array.isArray(value)) this.setAttribute("swatch", value.join(", "));
                    //If it is a string and maybe contains a color, add it.
                    else if (typeof value == "string" && value.includes("#")) this.setAttribute("swatch", value);
                }
                else if (this.hasAttribute("swatch")) this.removeAttribute("swatch");
            }

            get swatch() { return this.hasAttribute("alpha"); }

            //disable depending on fields.
            set disabled(value) {
                if (value) this.setAttribute("disabled", "");
                else if (this.hasAttribute("disabled")) this.removeAttribute("disabled");
            }

            get disabled() { return this.hasAttribute("disabled"); }

            //Now for the actual code for the element
            constructor() {
                super();
                
                //On click popup
                this.addEventListener("click", () => {
                    if (this.hasAttribute("disabled") && this.getAttribute("disabled") != "false") return;

                    const clientRect = this.getBoundingClientRect();
                    this.createPopup(clientRect.left, clientRect.top);
                });

                //Now setup our listener functions for when we are popped up.
                const self = this;
                this.#mouseDownFunc = (event) => self.clickHandler.call(self, event);
            }

            setupSliderFunctionality(element, id) {
                //Kill any touch events on this element
                element.ontouchstart = (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }

                element.onpointerdown = (downEvent) => {
                    //Make sure we don't accidentally select the background.
                    downEvent.stopPropagation();
                    downEvent.preventDefault();

                    //Function for updating the values
                    const updateOnEvent = (event) => {
                        //Get bounds and calculate new value
                        const target = elemental.colorPickerConfig.sliderTarget[id];
                        if (!target) return;

                        //Switch between possible directions the slider can go.
                        switch (elemental.colorPickerConfig.sliderDirection[id]) {
                            case "x":{
                                const { left, width, right } = element.getBoundingClientRect();
                                const percentage = (Math.max(left, Math.min(event.clientX, right)) - left) / width;
                                this.updateColor(target, percentage);
                                break;
                            }

                            case "y":{
                                const { top, height, bottom } = element.getBoundingClientRect();
                                const percentage = (Math.max(top, Math.min(event.clientY, bottom)) - top) / height;
                                this.updateColor(target, percentage);
                                break;
                            }

                            case "xy":{
                                //Check to make sure the target is valid
                                if ((!Array.isArray(target)) || target.length < 2) return;

                                const { left, width, right, top, height, bottom } = element.getBoundingClientRect();
                                const percentageX = (Math.max(left, Math.min(event.clientX, right)) - left) / width;
                                const percentageY = 1 - ((Math.max(top, Math.min(event.clientY, bottom)) - top) / height);
                                this.updateColor(target[0], percentageX);
                                this.updateColor(target[1], percentageY);
                                break;
                            }
                        
                            default:
                                break;
                        }
                    }

                    //Actually updating the values
                    updateOnEvent(downEvent);
                    const moveSlider = (event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        updateOnEvent(event);
                    }

                    const dropSlider = (event) => {
                        document.removeEventListener("pointermove", moveSlider);
                        document.removeEventListener("pointerup", dropSlider);
                        document.removeEventListener("pointerleave", dropSlider);
                    }

                    document.addEventListener("pointermove", moveSlider);
                    document.addEventListener("pointerup", dropSlider);
                    document.addEventListener("pointerleave", dropSlider);
                }
            }

            buildPopup(x, y) {
                //Create the container
                this.container = document.createElement('div');
                this.container.className = `${this.cssPrefix}container`;

                //Set the position and scroll values
                x += scrollX;
                y += scrollY;

                //Set iniitial positions
                this.container.style.setProperty("--x", `${x}px`);
                this.container.style.setProperty("--y", `${y}px`);

                this.container.style.setProperty("--scrollX", `${scrollX}px`);
                this.container.style.setProperty("--scrollY", `${scrollY}px`);

                if (!this.color) this.color = new elemental.colorLib.color();

                //Then spawn the needed modules
                const modules = elemental.colorPickerConfig.modules;
                for (let moduleID in modules) {
                    //Make sure module is valid, and it's condition is met.
                    if (!modules[moduleID]) continue;

                    if (modules[moduleID].prototype.condition(this)) {
                        const module = new modules[moduleID](this);
                        this.spawnedModules.push(module);
                    }
                }
 
                //Then add the container to the DOM
                document.body.appendChild(this.container);

                //Make sure the picker is always on screen.
                const reposition = () => {
                    if (!this.container) return;

                    this.container.style.setProperty("--x", `${x}px`);
                    this.container.style.setProperty("--y", `${y}px`);
                    const {top, left, bottom, right} = this.container.getBoundingClientRect();
                    
                    //Visible X
                    let finalX = x;
                    let finalY = y;

                    if (top < 0) finalY = y - top;
                    else if (bottom > window.innerHeight) finalY = y + window.innerHeight - bottom;

                    if (left < 0) finalX = x - left;
                    else if (right > window.innerWidth) finalX = x + window.innerWidth - right;

                    //Reposition to be on screen... if oob
                    if (finalX != x) this.container.style.setProperty("--x", `${finalX}px`);
                    if (finalY != y) this.container.style.setProperty("--y", `${finalY}px`);

                    if (this.container) requestAnimationFrame(reposition);
                }

                requestAnimationFrame(reposition);
            }

            updateColor(target, value) {
                let color = this.color;
                if (color instanceof elemental.colorLib.gradient) color = color.colors[this.gradientIndex][0];

                switch (target) {
                    case "r": color.r = Math.floor(value * 255); break;
                    case "g": color.g = Math.floor(value * 255); break;
                    case "b": color.b = Math.floor(value * 255); break;
                    case "h": color.h = Math.max(0, Math.min(value, 1)) * 360; break;
                    case "s": color.s = value; break;
                    case "v": color.v = value; break;
                    case "a": color.a = Math.floor(value * 255); break;
                    case "hex": color.hex = value; break;
                    default: break;
                }

                //Get css if gradient, get hex if color
                this.#fromUpdate = true;
                if (this.color instanceof elemental.colorLib.color) {
                    this.setAttribute("isgradient", false);
                    this.value = this.color.hex;
                }
                else if (this.color instanceof elemental.colorLib.gradient) {
                    this.setAttribute("isgradient", true);
                    this.value = this.color.css;
                }
                //Make sure to also put the from update ticker back.
                this.#fromUpdate = false;

                for (let moduleID in this.spawnedModules) {
                    const module = this.spawnedModules[moduleID];
                    module.updateColor(target, value, this);
                }
            }

            clickHandler(event) {
                if (event.target == this || this.container.contains(event.target)) return;
                this.destroyPopup();
            }

            destroyPopup() {
                if (!this.container.parentElement) return;

                document.body.removeChild(this.container);
                window.removeEventListener("mousedown", this.#mouseDownFunc);
                this.container = null;
            }

            createPopup(x, y) {
                if (this.container && this.container.parentElement) this.destroyPopup();
                this.buildPopup(x, y);
                this.updateColor(null, 0);
                
                window.addEventListener("mousedown",  this.#mouseDownFunc);
            }

            connectedCallback() {
                if (!this.color) this.color = new elemental.colorLib.color();
                this.color.hex = this.value || "#000000";
            }

            attributeChangedCallback(name, old, value) {
                if (name == "value" && !this.#fromUpdate) this.value = value;
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

            background: linear-gradient(to right, var(--color) 0%, var(--color) 100%), linear-gradient(to bottom, #9f9f9f 50%, #cfcfcf 50%);
        }

        <el>:hover { border-color: #afafaf; }
        <el>:active { border-style: inset; }

        <el>[isgradient="true"] {
            background: var(--color), linear-gradient(to bottom, #9f9f9f 50%, #cfcfcf 50%);
        }

        <pr>container {
            --x: 0px;
            --y: 0px;

            position: absolute;
            top: var(--y);
            left: var(--x);

            width: 384px;
            height: auto;

            background-color: #efefef;
            border: 4px #dfdfdf outset;

            z-index: 9999;
        }

        <pr>slider-container {
            display: grid;
            grid-template-columns: 50% 10% 40%;
            
            aspect-ratio: 2/1;
        }

        <pr>satBrightPicker {
            --color: #f00;

            margin: 8px;
            border: 4px #dfdfdf inset;
            background: linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, var(--color) 100%);
        }

        <pr>satValueSlider {
            --color: #000000;
            --x: 0%;
            --y: 0%;

            position: relative;
            left: var(--x);
            top: var(--y);

            width: 20px;
            height: 20px;

            border: 4px #dfdfdf outset;
            border-radius: 100%;

            transform: translate(-50%, -50%);

            background-color: var(--color);        
        }
        
        <pr>hueAdjust {
            --saturation: 100%;
            --lightness: 50%;

            margin: 8px 4px 8px 0px;
            border: 4px #dfdfdf inset;

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

            overflow: hidden;
        }

        <pr>adjustHolder {
            display: grid;
            grid-template-rows: 25% 25% 25% 25%;
            margin: 4px 0px 4px 0px;
        }

        <pr>adjust  {
            --combinedLow: #000000;
            --color: #ff0000;

            margin: 4px;
            border: 4px #dfdfdf inset;

            overflow: hidden;
            display: block;
        }

        <pr>firstAdjust { 
            --color: #ff0000;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        <pr>secondAdjust { 
            --color: #00ff00;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        <pr>thirdAdjust {
            --color: #0000ff;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }

        <pr>alphaAdjust {
            --color: #ffffff;
            background: linear-gradient(to right, transparent 0%, var(--color) 100%), linear-gradient(to bottom, transparent 50%, #00000033 50%);
        }

        <pr>slider {
            --color: #000000;

            --x: 0%;
            
            position: relative;
            left: var(--x);
            top: 0px;

            width: 8px;
            height: calc(100% - 8px);
            border: 4px #dfdfdf outset;

            transform: translate(-50%, 0%);

            background-color: var(--color);
        }

        <pr>alphaSlider {
            background: linear-gradient(to top, var(--color) 0%, var(--color) 100%), linear-gradient(to bottom, #00000033 0%, transparent 100%);
        }

        <pr>hueSlider {
            position: relative;
            left: 0px;
            top: var(--x);

            width: calc(100% - 8px);
            height: 8px;

            transform: translate(0%, -50%);
        }

        <pr>gradient-top-split {
            display: grid;
            grid-template-columns: 1fr auto;
            margin: 4px;
        }

        <pr>gradient-angle-selector {
            aspect-ratio: 1;

            overflow: hidden;

            width: auto;
            height: 40px;

            color: #000000;
            background: var(--gradient), linear-gradient(to bottom, #00000033 50%, transparent 50%);
            border: 4px #dfdfdf outset;

            border-radius: 50%;
        }

        <pr>gradient-angle-selector > svg {
            aspect-ratio: 1;

            width: auto;
            height: 100%;

            transform: rotate(var(--direction));

            /* Dumb little outline thing. */
            filter: 
                drop-shadow(0px 0.5px 0px #ffffff) 
                drop-shadow(0px -0.5px 0px #ffffff) 
                drop-shadow(0.5px 0px 0px #ffffff) 
                drop-shadow(-0.5px 0px 0px #ffffff)

                drop-shadow(0.5px 0.5px 0px #ffffff) 
                drop-shadow(-0.5px 0.5px 0px #ffffff) 
                drop-shadow(0.5px -0.5px 0px #ffffff) 
                drop-shadow(-0.5px -0.5px 0px #ffffff);
        }

        <pr>gradient-container {
            display: grid;
            grid-template-rows: auto auto;
        }

        <pr>gradient-buttons {
            display: grid;
            grid-template-columns: 1fr 48px;
        }

        <pr>gradient-modes {
            display: flex;
            justify-content: center;
        }

        <pr>gradient-point-controls {
            margin-right: 4px;
        }

        <pr>gradient-mode {
            --gradientColor: #5f5f5f;

            width: auto;
            height: 16px;

            aspect-ratio: 1;

            background: var(--gradientColor);
            border: 2px #9f9f9f outset;
        }

        <pr>gradient-button {
            width: 12px;
            height: 12px;
            
            color: #000000;
            border: 4px #dfdfdf outset;
            background: #efefef;

            display: flex;
            justify-content: center;
        }

        <pr>gradient-button > svg {
            width: 12px;
            height: 12px;
        }

        <pr>gradient-button:hover {
            background: #dfdfdf;
        }

        <pr>gradient-button:active {
            border: 4px #dfdfdf inset;
        }

        <pr>gradient-mode-selected {
            --gradientColor: #18a3ff;
        }

        <pr>gradient-mode-linear {
            background: linear-gradient(to right, transparent 0%, var(--gradientColor) 100%) !important;
        }

        <pr>gradient-mode-radial {
            background: radial-gradient(at center, var(--gradientColor) 0%, transparent 100%) !important;
        }

        <pr>gradient-mode-conic {
            background: conic-gradient(at center, var(--gradientColor) 0%, transparent 100%) !important;
        }

        <pr>gradient-display {
            position:relative;

            /* Ha ha half life reference! */
            --gradient: linear-gradient(to right, #000000 50%, #ff00ff 50%);

            background: var(--gradient), linear-gradient(to top, #dfdfdf 50%, #afafaf 50%);
            border: 4px #dfdfdf outset;

            margin: 4px;
            height: 16px;

            overflow: hidden;
        }

        <pr>gradient-point {
            --color: #ffffff;
            --x: 0%;

            position: absolute;
            left: var(--x);

            width: auto;
            height: 8px;
            aspect-ratio: 1;

            background: linear-gradient(to right, var(--color) 0%, var(--color) 100%), linear-gradient(to bottom, #dfdfdf 50%, #afafaf 50%);
            border: 4px #dfdfdf outset;

            transform: translate(-50%, 0%);
        }

        <pr>gradient-point-selected {
            background: #18a3ff;
            border: 4px #dfdfdf inset;
        }

        <pr>confirmation-container {
            display: grid;
            grid-template-columns: 1fr auto;
        }

        <pr>confirmation-hex {
            border: 4px #dfdfdf inset;
        }

        <pr>confirmation-done-button {
            border: 4px #dfdfdf outset;
            color: #000000;
            
            width: auto;
            height: 20px;
            
            aspect-ratio: 1;
        }

        <pr>confirmation-done-button:hover {
            background: #dfdfdf;
        }

        <pr>confirmation-done-button:active {
            border: 4px #dfdfdf inset;
        }

        <pr>confirmation-done-button > svg {
            width: 20px;
            height: 20px;
        }

        <pr>palette-container {
            display: flex;
            flex-wrap: wrap;

            margin: 4px;

            justify-content: center;

            background: #dfdfdf;
            border: 4px #efefef inset;
        }

        <pr>palette-color {
            --color: #ff0000;

            background-color: var(--color);
            border: 4px #efefef outset;
            border-radius: 50%;

            aspect-ratio: 1;

            width: auto;
            height: 16px;

            margin: 2px;
        }

        <pr>palette-color:hover {
            border: 4px #dfdfdf outset;
        }

        <pr>palette-color:active {
            border: 4px #dfdfdf inset;
        }
        `
    });
})();
}
