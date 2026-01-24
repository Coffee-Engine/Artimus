artimus.tools.text = class extends artimus.tool {
    constructive = false;

    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19.23435" height="19.23435" viewBox="0,0,19.23435,19.23435"><g transform="translate(-230.38282,-170.38282)"><g stroke="none" stroke-width="0" stroke-miterlimit="10"><path d="M234.63295,174.36291v-1.51378h10.73411v3.00263c0,0 -0.38276,0 -0.84118,0c-0.14059,0 -0.28829,-1.48885 -0.43425,-1.48885c-1.69363,0 -9.45868,0 -9.45868,0z" fill="currentColor"/><path d="M235.90838,174.36291c-0.14596,0 -0.29366,1.48885 -0.43425,1.48885c-0.45843,0 -0.84118,0 -0.84118,0v-3.00263h10.73411v1.51378c0,0 -7.76505,0 -9.45868,0z" fill="currentColor"/><path d="M239.14269,187.14473v-13.02743h1.95411c0,0 0,8.7727 0,10.98026c0,0.37553 -0.15509,0.95902 2.04717,1.11664c0.5274,0.03775 0,0.93053 0,0.93053z" fill="currentColor"/><path d="M236.85602,187.15088c0,0 -0.5274,-0.89279 0,-0.93053c2.20226,-0.15762 2.04717,-0.74111 2.04717,-1.11664c0,-2.20756 0,-10.98026 0,-10.98026h1.95411v13.02742z" fill="currentColor"/><path d="M230.38282,189.61718v-19.23435h19.23435v19.23435z" fill="none"/></g></g></svg><!--rotationCenter:9.617176336678597:9.617176336678625-->'; }
    
    //Thank you https://stackoverflow.com/a/68372384
    cssFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1 1 1 1"/></feComponentTransfer></filter></svg>#f')`;

    mouseDown(gl, x, y, toolProperties) {
        //Comment this until a more reliable way of finding mobile is found, most likely a simple check for touch controls being used last.
        //this.workspace.requestKeyboard();

        toolProperties.x = x;
        toolProperties.y = y;

        toolProperties.mouseDown = true;

        if (!toolProperties.typing) {
            toolProperties.text = "";
            toolProperties.typing = true;
            toolProperties.pointerPosition = 0;
        }
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        if (toolProperties.mouseDown) {
            toolProperties.x = x;
            toolProperties.y = y;
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (toolProperties.mouseDown) {
            toolProperties.x = x;
            toolProperties.y = y;
            toolProperties.mouseDown = false;
        }
    }

    renderText(gl, toolProperties, preview) {
        //Set attributes
        gl.fillStyle = toolProperties.fillColor;
        gl.strokeStyle = toolProperties.strokeColor;
        gl.lineWidth = toolProperties.strokeSize;
        gl.font = `${toolProperties.textSize}px ${toolProperties.font}`;

        //Ready the linemen
        const split = toolProperties.text.split("\n");
        const lineHeight = gl.measureText("■").width * toolProperties.lineSpacing;

        //ChAAARRRGEEEE!
        let y = toolProperties.y;
        let characterOffset = 0;

        if (toolProperties.pixelBrush) gl.filter = this.cssFilter;

        for (let line in split) {
            const lineText = split[line];

            if (preview) {
                const relativePointer = toolProperties.pointerPosition - characterOffset;
                if (relativePointer >= 0 && relativePointer <= lineText.length) {
                    if (toolProperties.pixelBrush) gl.filter = "none";

                    gl.lineWidth = 1;
                    gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-eraser-outline");

                    const width = gl.measureText(lineText).width;
                    gl.strokeRect(toolProperties.x, y, width, 1);

                    const markerOffset = gl.measureText(lineText.substring(0, relativePointer)).width;
                    gl.strokeRect(toolProperties.x + markerOffset, y - (lineHeight - 2), 1, lineHeight - 3);

                    if (toolProperties.pixelBrush) gl.filter = this.cssFilter;
                }
            }

            if (toolProperties.strokeSize > 0) {
                gl.strokeText(lineText, toolProperties.x, y);
            }
            gl.fillText(lineText, toolProperties.x, y);

            y += lineHeight;
            characterOffset += lineText.length + 1;
        }

        if (toolProperties.pixelBrush) gl.filter = "none";

        if (!preview) {
            this.workspace.updateLayerHistory();
            this.workspace.dirty = true;
        }
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
        if (toolProperties.typing) {
            const { key } = event;
            const text = toolProperties.text;

            if (key.length == 1) {
                toolProperties.text = this.insertCharacterAt(text, toolProperties.pointerPosition, key);
                toolProperties.pointerPosition++;
            }
            else {
                switch (key.toLowerCase()) {
                    //three basic keys
                    case "enter":
                        if (event.shiftKey) {
                            toolProperties.text = this.insertCharacterAt(text, toolProperties.pointerPosition, "\n");
                            toolProperties.pointerPosition++;
                        }
                        else {
                            this.renderText(gl, toolProperties);

                            toolProperties.typing = false;
                            toolProperties.text = "";
                            
                            this.workspace.dirty = true;
                        }
                        break;

                    case "backspace":
                        //Shift key support for those who don't have delete
                        if (event.shiftKey) toolProperties.text = this.removeCharactersAt(text, toolProperties.pointerPosition, -1);
                        else {
                            toolProperties.text = this.removeCharactersAt(text, toolProperties.pointerPosition, 1);
                            toolProperties.pointerPosition--;
                        }
                        break;

                    case "delete":
                        toolProperties.text = this.removeCharactersAt(text, toolProperties.pointerPosition, -1);
                        break;

                    //Tab
                    case "tab":
                        //Allow the use of shift tab to remove tabs
                        if (event.shiftKey) {
                            if (text.charAt(toolProperties.pointerPosition - 1) == " ") {
                                for (let i = 0; i < 4; i++) {
                                    toolProperties.text = this.removeCharactersAt(text, toolProperties.pointerPosition, 1);
                                    toolProperties.pointerPosition--;
                                    if (toolProperties.text.charAt(toolProperties.pointerPosition - 1) != " ") break;
                                }
                            }
                        }
                        else {
                            toolProperties.text = this.insertCharacterAt(text, toolProperties.pointerPosition, "    ");
                            toolProperties.pointerPosition+=4;
                        }
                        break;

                    //Pointer controls
                    case "arrowleft":
                        toolProperties.pointerPosition--;
                        break;

                    case "arrowright":
                        toolProperties.pointerPosition++;
                        break;

                    case "arrowup":
                        if (text.charAt(toolProperties.pointerPosition - 1) == "\n") toolProperties.pointerPosition--;
                        else while (text.charAt(toolProperties.pointerPosition - 1) != "\n" && toolProperties.pointerPosition > 0) {
                            toolProperties.pointerPosition--;
                        }
                        break;

                    case "arrowdown":
                        if (text.charAt(toolProperties.pointerPosition) == "\n") toolProperties.pointerPosition++;
                        else {
                            toolProperties.pointerPosition++
                            while (
                                text.charAt(toolProperties.pointerPosition - 1) != "\n" 
                                && toolProperties.pointerPosition < text.length
                            ) toolProperties.pointerPosition++;

                            if (toolProperties.pointerPosition != text.length) toolProperties.pointerPosition--;
                        }
                        break;
                
                    default:
                        break;
                }

                toolProperties.pointerPosition = Math.min(Math.max(toolProperties.pointerPosition, 0), toolProperties.text.length);
            }

            return true;
        }
    }

    preview(gl, x, y, toolProperties) {
        if (toolProperties.typing) this.renderText(gl, toolProperties, true);
    }

    CUGI(artEditor) { return [
        { target: artEditor.toolProperties, key: "font", type: "artimus-font"},
        { target: artEditor.toolProperties, key: "textSize", type: "int", min: 1 },
        { target: artEditor.toolProperties, key: "lineSpacing", type: "float" },
        { target: artEditor.toolProperties, key: "fillColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeColor", type: "color" },
        { target: artEditor.toolProperties, key: "strokeSize", type: "int", min: 0 },
        { target: artEditor.toolProperties, key: "pixelBrush", type: "boolean" },
    ]}

    properties = {
        font: "Monospace",
        textSize: 24,
        lineSpacing: 1.5,
        fillColor: "#000000",
        strokeColor: "#000000",
        strokeSize: 0,
        pixelBrush: false,
    }
}