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
            selectionMinX = 0; selectionMinY = 0;
            selectionMaxX = this.workspace.width; selectionMaxY = this.workspace.height;
        }

        if (selectionMaxX - selectionMinX > 0 && selectionMaxY - selectionMinY > 0) {
            createImageBitmap(this.imageData).then(bitmap => {
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

                gl.clearRect(
                    selectionMinX,
                    selectionMinY,
                    selectionMaxX - selectionMinX,
                    selectionMaxY - selectionMinY
                );
                
                this.updateHistory();

                this.preview(previewGL, ...this.workspace.lastPosition, toolProperties);
                this.workspace.dirty = true;
            });
        }
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
        return [
            [this.x + (this.width / 3), this.y - 5, this.width / 3, 5,
            0, -1, 0, this.y + this.height],
            [this.x + (this.width / 3), (this.y + this.height), this.width / 3, 5,
            0, 1, 0, this.y],
            [this.x - 5, this.y + (this.height / 3), 5, this.height / 3,
            -1, 0, this.x + this.width, 0],
            [this.x + this.width, this.y + (this.height / 3), 5, this.height / 3,
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
                    break;
            }
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = false;
            this.updateHistory();
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