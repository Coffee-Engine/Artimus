window.artimus = {
    tools: {},

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
        }
        get tool() { return this.#tool; }

        toolProperties = {};

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

        RGBtoHex(RGB) {
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

            this.GL = this.canvas.getContext("2d");
            //Sometimes we need this. Sometimes we don't?
            //I dunno, just no IE11
            //this.GL.translate(-0.5, -0.5);
            this.GL.imageSmoothingEnabled = false;

            artimus.activeWorkspaces.push(this);
        }

        createLayout() {
            //Create needed elements
            this.container = document.createElement("div");
            
            this.toolbar = document.createElement("div");
            this.toolbox = document.createElement("div");
            this.toolPropertyHolder = document.createElement("div");

            this.canvasArea = document.createElement("div");
            this.canvas = document.createElement("canvas");
            
            //Now we can style our children
            this.container.className = "artimus-container";

            this.toolbar.className = "artimus-toolbar";
            this.toolbox.className = "artimus-toolbox";
            this.toolPropertyHolder.className = "artimus-toolPropertyHolder";

            this.canvasArea.className = "artimus-canvasArea";
            this.canvas.className = "artimus-canvas";
            
            this.container.appendChild(this.toolbar);
            this.toolbar.appendChild(this.toolbox);
            this.toolbar.appendChild(this.toolPropertyHolder);

            this.container.appendChild(this.canvasArea);
            this.canvasArea.appendChild(this.canvas);

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
                        const converted = this.RGBtoHex({ r:red, g:green, b:blue, a:alpha });

                        this.toolProperties.strokeColor = converted;
                        this.toolProperties.fillColor = converted;

                        //Refresh options
                        this.refreshToolOptions();
                        break;
                
                    default:
                        break;
                }
            });
            this.canvas.addEventListener("mouseup", (event) => {
                if (event.button != 0) return;
                
                if (this.toolFunction.mouseUp && this.toolDown) this.toolFunction.mouseUp(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                this.toolDown = false; 
            });
            this.canvas.addEventListener("mouseout", (event) => { 
                if (this.toolFunction.mouseUp && this.toolDown) this.toolFunction.mouseUp(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), this.toolProperties);
                this.toolDown = false; 
            });
            this.canvas.addEventListener("mousemove", (event) => {
                if (this.toolDown && this.toolFunction.mouseMove) this.toolFunction.mouseMove(this.GL, ...this.getCanvasPosition(event.clientX, event.clientY), event.movementX / this.zoom, event.movementY / this.zoom, this.toolProperties);
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
                    button.className = "artimus-tool artimus-tool-selected";

                    //Set the last selected to not be selected
                    if (this.selectedElement) this.selectedElement.className = "artimus-tool";

                    this.selectedElement = button;
                }

                button.className = (toolID == this.tool) ? "artimus-tool artimus-tool-selected" : "artimus-tool";
                label.className = "artimus-toolLabel";
                this.toolbox.appendChild(button);
                button.appendChild(label);
            }
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