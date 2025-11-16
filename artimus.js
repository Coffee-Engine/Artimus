window.artimus = {
    tools: {},

    HexToRGB: (Hex) => {
        if (typeof Hex === "string") {
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

    RGBtoHex: (RGB) => {
        let hexR = Math.floor(RGB.r).toString(16);
        let hexG = Math.floor(RGB.g).toString(16);
        let hexB = Math.floor(RGB.b).toString(16);

        if (hexR.length == 1) hexR = "0" + hexR;
        if (hexG.length == 1) hexG = "0" + hexG;
        if (hexB.length == 1) hexB = "0" + hexB;

        //Transparency
        if (RGB.a) {
            let hexA = Math.floor(RGB.a).toString(16);
            if (hexA.length == 1) hexA = "0" + hexA;

            return `#${hexR}${hexG}${hexB}${hexA.toLowerCase() == "ff" ? "" : hexA}`;
        }

        return `#${hexR}${hexG}${hexB}`;
    },

    workspace: class {
        //Scrolling
        #scrollX = 0;
        set scrollX(value) {
            this.#scrollX = value;
            this.updatePosition();
        }
        get scrollX() { return this.#scrollX; }

        #scrollY = 0;
        set scrollY(value) {
            this.#scrollY = value;
            this.updatePosition();
        }
        get scrollY() { return this.#scrollY; }

        #zoom = 2;
        set zoom(value) {
            this.#zoom = Math.max(Math.min(value, 25), 0.25);
            this.updatePosition();
        }
        get zoom() { return this.#zoom; }

        #tool = ""
        toolFunction = {};
        set tool(value) {
            if (artimus.tools[value]) this.toolFunction = artimus.tools[value];
            else this.toolFunction = {};

            Object.assign(this.toolProperties, this.toolFunction.properties);

            this.#tool = value;
            this.refreshToolOptions();

            //We also want to clear the previewGL
            if (this.toolFunction.preview) this.previewGL.clearRect(0, 0, this.width, this.height);
        }
        get tool() { return this.#tool; }

        toolProperties = {};

        #width = 300;
        set width(value) {
            this.#width = value;
            this.canvas.width = value;
            this.editingCanvas.width = value;
            this.previewCanvas.width = value;
        }
        get width() {
            return this.#width;
        }

        #height = 150;
        set height(value) {
            this.#height = value;
            this.canvas.height = value;
            this.editingCanvas.height = value;
            this.previewCanvas.height = value;
        }
        get height() {
            return this.#height;
        }

        #currentLayer = 0;
        set currentLayer(value) {
            //Save current data to the layer position
            const oldLayer = this.layers[this.#currentLayer];
            const { name, element, label, bitmap } = oldLayer;

            //Clean up data and save layer data to previous layer.
            if (bitmap) bitmap.close();
            this.layers[this.#currentLayer] = this.GL.getImageData(0, 0, this.width, this.height);
            this.layers[this.#currentLayer].name = name;
            this.layers[this.#currentLayer].element = element;
            this.layers[this.#currentLayer].label = label;
            
            this.updateLayer(this.#currentLayer, () => {
                this.#currentLayer = value;

                //Now setup stuff we need/want like blitting the newly selected layer onto the editing canvas
                const current = this.layers[this.#currentLayer];
                this.GL.putImageData(current, 0, 0);

                label.className = this.layerClass;
                current.label.className = this.layerClass + this.layerClassSelected;
            });
        }
        get currentLayer() {
            return this.#currentLayer;
        }

        toolClass = "artimus-button artimus-sideBarButton artimus-tool ";
        layerClass = "artimus-button artimus-sideBarButton artimus-layer ";
        toolClassSelected = "artimus-sideBarButton-selected artimus-tool-selected ";
        layerClassSelected = "artimus-sideBarButton-selected artimus-layer-selected ";

        updatePosition() {
            //Setup some CSS
            this.quickVar(this.container, {
                "scrollX": `${this.scrollX}px`,
                "scrollY": `${this.scrollY}px`,
                "zoom": this.zoom
            });
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

        //Host/Parasite relationship
        host = document.createElement("div");

        elementFromString(element) {
            this.host.innerHTML = element;

            //Remove the parasite
            const parasite = this.host.children[0];
            this.host.removeChild(parasite);
            return parasite;
        }

        //Now for the meat and potatoes
        constructor() {
            //Look for existing CUGI if one doesn't exist, add it.
            if (!window.CUGI) {
                window.CUGI = {};

                const CUGIScript = document.createElement("script");
                CUGIScript.src = "https://coffee-engine.github.io/CUGI/CUGI.js";
                document.body.appendChild(CUGIScript);
            }

            this.createLayout();
            this.addControls();

            //Create layers
            this.layers = [];

            //For editing
            this.editingCanvas = document.createElement("canvas");
            this.previewCanvas = document.createElement("canvas");

            this.width = 640;
            this.height = 480;
            this.createLayer();

            this.GL = this.editingCanvas.getContext("2d", { willReadFrequently: true });
            this.fullviewGL = this.canvas.getContext("2d");
            this.previewGL = this.previewCanvas.getContext("2d");

            //Sometimes we need this. Sometimes we don't?
            //I dunno, just no IE11
            //this.GL.translate(-0.5, -0.5);
            this.GL.imageSmoothingEnabled = false;

            artimus.activeWorkspaces.push(this);

            const workspace = this;
            const loop = () => {
                if (!workspace) return;

                workspace.renderLoop.call(workspace);
                requestAnimationFrame(loop);
            }

            loop();
        }

        renderLoop() {
            this.fullviewGL.clearRect(0, 0, this.width, this.height);
            for (let layerID in this.layers) {
                if (layerID == this.currentLayer) this.fullviewGL.drawImage(this.editingCanvas, 0, 0);
                else {
                    const bitmap = this.layers[layerID].bitmap;
                    if (bitmap instanceof ImageBitmap) this.fullviewGL.drawImage(bitmap, 0, 0);
                }
            }

            this.fullviewGL.drawImage(this.previewCanvas, 0, 0);
        }

        createLayout() {
            //Create needed elements
            this.container = document.createElement("div");
            
            this.toolbar = document.createElement("div");
            this.toolbox = document.createElement("div");
            this.toolPropertyHolder = document.createElement("div");
            this.layerHolder = document.createElement("div");

            this.layerCreationHolder = document.createElement("div");
            this.layerCreationName = document.createElement("input");
            this.layerCreationButton = document.createElement("button");
            this.layerCreationName.placeholder = "layer";
            this.layerCreationButton.innerText = "✓";

            this.canvasArea = document.createElement("div");
            this.canvas = document.createElement("canvas");
            
            //Now we can style our children
            this.container.className = "artimus-container";

            this.toolbar.className = "artimus-toolbar";
            this.toolbox.className = "artimus-sideBarList artimus-toolbox";
            this.toolPropertyHolder.className = "artimus-sideBarList artimus-toolPropertyHolder";
            this.layerHolder.className = "artimus-sideBarList artimus-layerHolder";

            this.layerCreationHolder.className = "artimus-layerCreationHolder";
            this.layerCreationName.className = "artimus-layerCreationName";
            this.layerCreationButton.className = "artimus-layerCreationButton";

            this.canvasArea.className = "artimus-canvasArea";
            this.canvas.className = "artimus-canvas";
            
            this.container.appendChild(this.toolbar);
            this.toolbar.appendChild(this.toolbox);
            this.toolbar.appendChild(this.toolPropertyHolder);
            this.toolbar.appendChild(this.layerHolder);

            this.layerHolder.appendChild(this.layerCreationHolder);
            this.layerCreationHolder.appendChild(this.layerCreationName);
            this.layerCreationHolder.appendChild(this.layerCreationButton);

            this.container.appendChild(this.canvasArea);
            this.canvasArea.appendChild(this.canvas);

            this.layerCreationButton.onclick = () => {
                if (!this.layerExists(this.layerCreationName.value)) {
                    this.createLayer(this.layerCreationName.value);
                    this.layerCreationName.value = "";
                }
            }

            this.updatePosition();
        }

        addControls() {
            //Drawing
            this.canvas.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
            });

            this.canvas.addEventListener("mousedown", (event) => {
                switch (event.button) {
                    case 0:
                        if (this.toolFunction.mouseDown && !this.toolDown) this.toolFunction.mouseDown(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                        this.toolDown = true;
                        break;

                    case 2:
                        const [red, green, blue, alpha] = this.GL.getImageData(...this.getCanvasPosition(event.clientX, event.clientY, true), 1, 1).data;
                        const converted = artimus.RGBtoHex({ r:red, g:green, b:blue, a:alpha });

                        this.toolProperties.strokeColor = converted;
                        this.toolProperties.fillColor = converted;

                        //Refresh options
                        this.refreshToolOptions();
                        break;
                
                    default:
                        break;
                }
            });

            //For instances of the mouse being up or gone we want to clear the preview GL.
            this.canvas.addEventListener("mouseup", (event) => {
                if (event.button != 0) return;
                
                if (this.toolFunction.preview) this.previewGL.clearRect(0, 0, this.width, this.height);
                if (this.toolFunction.mouseUp && this.toolDown) this.toolFunction.mouseUp(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                this.toolDown = false; 
            });
            this.canvas.addEventListener("mouseout", (event) => { 

                if (this.toolFunction.preview) this.previewGL.clearRect(0, 0, this.width, this.height);
                if (this.toolFunction.mouseUp && this.toolDown) this.toolFunction.mouseUp(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                this.toolDown = false; 
            });
            this.canvas.addEventListener("mousemove", (event) => {
                const position = this.getCanvasPosition(event.clientX, event.clientY);
                
                if (this.toolFunction.preview) {
                    //For previews
                    this.previewGL.clearRect(0, 0, this.width, this.height);
                    this.toolFunction.preview(this.previewGL, ...position, this.toolProperties);
                }

                if (this.toolDown && this.toolFunction.mouseMove) this.toolFunction.mouseMove(this.GL, ...position, event.movementX / this.zoom, event.movementY / this.zoom, this.toolProperties);
            });

            //Add movement
            this.container.addEventListener("mousedown", (event) => {
                if (event.button == 1) {
                    const moveEvent = (event) => {
                        this.scrollX += event.movementX / this.zoom;
                        this.scrollY += event.movementY / this.zoom;
                    }

                    const upEvent = (event) => {
                        if (event.button == 1) {
                            document.removeEventListener("mousemove", moveEvent);
                            document.removeEventListener("mouseup", upEvent);
                        }
                    }

                    //Bind events
                    document.addEventListener("mousemove", moveEvent);
                    document.addEventListener("mouseup", upEvent)
                }
            });

            this.canvasArea.addEventListener("wheel", (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.zoom += event.deltaY / -100;
                }
                else if (event.shiftKey) {
                    this.scrollX -= (event.deltaY) / this.zoom;
                    this.scrollY -= (event.deltaX) / this.zoom;
                    this.zoom += event.deltaZ / -100;
                }
                else {
                    this.scrollX -= (event.deltaX) / this.zoom;
                    this.scrollY -= (event.deltaY) / this.zoom;
                    this.zoom += event.deltaZ / -100;
                }
            }, { passive: false });
        }

        setCanvasPosition(x, y) {
            this.#scrollX = -x;
            this.#scrollX = -y;
        }

        getCanvasPosition(x, y) {
            const {top, left} = this.canvas.getBoundingClientRect();
            return [Math.floor((x - Math.floor(left)) / this.zoom), Math.floor((y - Math.floor(top)) / this.zoom)];
        }

        refreshToolOptions() {
            this.toolPropertyHolder.innerHTML = "";

            if (!this.toolFunction.CUGI) return;
            this.toolPropertyHolder.appendChild(CUGI.createList(this.toolFunction.CUGI(this)));
        }

        refreshTools() {
            this.toolbox.innerHTML = "";
            this.selectedElement = null;

            for (let toolID in artimus.tools) {
                const tool = artimus.tools[toolID];

                const button = document.createElement("button");

                //Set icon and text if needed
                if (typeof tool.icon == "string") {
                    let icon = null;

                    //For svgs
                    if (tool.icon.startsWith("<svg version=\"")) icon = this.elementFromString(tool.icon);
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
                label.innerText = tool.name || toolID;

                button.onclick = () => {
                    this.tool = toolID;
                    button.className = this.toolClass + this.toolClassSelected;

                    //Set the last selected to not be selected
                    if (this.selectedElement) this.selectedElement.className = this.toolClass;

                    this.selectedElement = button;
                }

                button.className = (toolID == this.tool) ? this.toolClass + this.toolClassSelected : this.toolClass;
                label.className = "artimus-toolLabel";
                this.toolbox.appendChild(button);
                button.appendChild(label);
            }
        }

        setLayer(ID) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                this.currentLayer = ID;
            }
        }

        createLayer(name) {
            name = name || ("Layer " + (this.layers.length + 1));

            const layerData = new ImageData(this.canvas.width, this.canvas.height);
            createImageBitmap(layerData).then(bitmap => {
                layerData.name = name;
                layerData.bitmap = bitmap;
                
                const element = this._createLayerElement(layerData);

                this.layers.push(layerData);
                this.layerHolder.appendChild(element);
                element.positionID = this.layers.length - 1;

                //Finally use the new layer
                this.setLayer(name);
            });
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

            const removeLayer = document.createElement("button");
            removeLayer.className = "artimus-button artimus-layerButton";
            removeLayer.innerText = "×";
            removeLayer.onclick = () => this.removeLayer(element.targetLayer);

            const upButton = document.createElement("button");
            upButton.className = "artimus-button artimus-layerButton";
            upButton.innerText = "^";
            upButton.onclick = () => {
                this.moveLayer(element.targetLayer, 1);
            }

            const downButton = document.createElement("button");
            downButton.className = "artimus-button artimus-layerButton";
            downButton.innerText = "v";
            downButton.onclick = () => {
                this.moveLayer(element.targetLayer, -1);
            }

            element.appendChild(removeLayer);
            element.appendChild(upButton);
            element.appendChild(downButton);
            element.appendChild(label);

            return element;
        }

        moveLayer(ID, by) {
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

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
            if (typeof ID == "string") {
                const locID = this.layers.findIndex((layer) => layer.name == ID);
                if (locID != -1) ID = locID;
            }

            if (typeof ID == "number") {
                createImageBitmap(this.layers[ID]).then(newBitmap => {
                    this.layers[ID].bitmap = newBitmap;
                    if (then) then(newBitmap);
                });
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
                const layer = this.layers[ID];

                if (this.#currentLayer > ID) {
                    this.#currentLayer -= 1;
                }
                
                //Clean up clean up!
                layer.bitmap.close();
                layer.element.parentElement.removeChild(layer.element);
                this.layers.splice(ID, 1);
            }
        }

        layerExists(name) {
            return this.layers.findIndex((layer) => layer.name == name) != -1;
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