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
        { target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
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