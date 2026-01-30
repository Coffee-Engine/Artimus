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
            angle: this.angle,
            offsetAngle: this.offsetAngle,
            imageX: this.imageX,
            imageY: this.imageY,
            imageWidth: this.imageWidth,
            imageHeight: this.imageHeight,
            selection: [...this.workspace.selection]
        });

        this.historyPosition = this.undoQueue.length - 1;
        console.log(this.historyPosition);
    }

    drawImage(gl) {
        //Calculate values needed for our matrix
        const sin = Math.sin(this.angle - this.offsetAngle);
        const cos = Math.cos(this.angle - this.offsetAngle);
        const offsetX = this.imageX + (this.imageWidth / 2);
        const offsetY = this.imageY + (this.imageHeight / 2);

        //Set the image and draw the matrix
        gl.setTransform(cos, sin, -sin, cos, offsetX, offsetY);
        gl.drawImage(this.bitmap, (this.imageWidth / -2), (this.imageHeight / -2));
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

        createImageBitmap(this.imageData).then(bitmap => {
            this.bitmap = bitmap;
            this.ready = true;
            this.updatePositions();

            //Setup initial variables
            this.imageX = this.x;
            this.imageY = this.y;
            this.imageWidth = this.width;
            this.imageHeight = this.height;
        
            this.angle = 0;
            this.offsetAngle = 0;
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

    mouseDown(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = true;
            this.rotating = false;

            //Check to see if we are touching one of the rotation circles, if so rotate it.
            if (
                this.isInCircle(x, y, this.x, this.y, 3) ||
                this.isInCircle(x, y, this.x + this.width, this.y, 3) ||
                this.isInCircle(x, y, this.x + this.width, this.y + this.height, 3) ||
                this.isInCircle(x, y, this.x, this.y + this.height, 3)
            ) {
                this.rotating = true;

                this.initialSelection = [...this.workspace.selection];
                this.cx = this.x + (this.width / 2);
                this.cy = this.y + (this.height / 2);
                this.offsetAngle = (this.offsetAngle || 0) - (this.angle || 0);
                this.initialAngle = Math.atan2(this.cy - y, this.cx - x);
                this.angle = Math.atan2(this.cy - y, this.cx - x) - this.initialAngle;
            }
        }
    }

    mouseMove(gl, x, y, vx, vy, toolProperties) {
        if (this.dragging) {
            if (this.rotating) {
                //Find offset angle
                this.angle = Math.atan2(this.cy - y, this.cx - x) - this.initialAngle;
                if (this.shiftHeld) this.angle = (Math.floor((this.angle / this.tp) * 24) / 24) * this.tp;
                
                const sin = Math.sin(-this.angle);
                const cos = Math.cos(-this.angle);

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
            }
            else {
                //Move the image and the selection pointss
                this.imageX += vx;
                this.imageY += vy;

                if (this.workspace.hasSelection) {
                    const selection = this.workspace.selection;
                    for (let i = 0; i < selection.length; i+=2) {
                        selection[i] += vx;
                        selection[i + 1] += vy; 
                    }

                    this.workspace.selection = selection;
                    this.updatePositions();
                }
            }
        }
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = false;
            this.updateHistory();
        }
    }

    undo(gl, previewGL, toolProperties) {
        if (this.historyPosition > 0) this.historyPosition -= 1;
        console.log(this.historyPosition);

        //Undo.
        this.workspace.selection = this.undoQueue[this.historyPosition].selection;
        this.angle = this.undoQueue[this.historyPosition].angle;
        this.offsetAngle = this.undoQueue[this.historyPosition].offsetAngle;
        this.imageX = this.undoQueue[this.historyPosition].imageX;
        this.imageY = this.undoQueue[this.historyPosition].imageY;
        this.imageWidth = this.undoQueue[this.historyPosition].imageWidth;
        this.imageHeight = this.undoQueue[this.historyPosition].imageHeight;

        this.updatePositions();

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

        this.drawCircle(gl, this.x, this.y, 3, this.isInCircle(x, y, this.x, this.y, 3));
        this.drawCircle(gl, this.x + this.width, this.y, 3, this.isInCircle(x, y, this.x + this.width, this.y, 3));
        this.drawCircle(gl, this.x + this.width, this.y + this.height, 3, this.isInCircle(x, y, this.x + this.width, this.y + this.height, 3));
        this.drawCircle(gl, this.x, this.y + this.height, 3, this.isInCircle(x, y, this.x, this.y + this.height, 3));

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