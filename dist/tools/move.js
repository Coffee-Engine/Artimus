artimus.tools.move = class extends artimus.tool {
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70.5" height="70.5" viewBox="0,0,70.5,70.5"> <g transform="translate(-204.75002,-144.75)">    <g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal">        <path d="M204.75003,215.25v-70.5h70.5v70.5z" fill="none" stroke-width="0"/>        <path d="M220.9868,205.17696c1.77179,-0.89842 3.45323,-2.83003 3.92284,-4.18449c0.48941,-2.20805 2.09187,-5.70927 4.03585,-6.94886c1.41138,-1.79045 6.7982,-2.72387 8.25105,-0.51354c3.63129,2.41038 4.42564,4.90457 4.65906,6.97496c0.87449,2.30301 -2.19833,6.25534 -4.02505,7.55363c-2.70649,1.77061 -6.09868,1.76254 -9.25182,2.13584c-3.36677,0.39859 -5.03047,-0.4888 -7.98273,-1.41774c-0.53432,-0.4212 -3.55958,-2.15572 -3.34232,-2.965c0.23096,-0.8603 2.73102,-0.52502 3.38089,-0.60196l0.28441,-0.03367c0,0 0.02808,-0.00332 0.06782,0.00082z" fill="currentColor" stroke-width="0.5"/>        <path d="M254.7307,185.57527c-5.41655,12.21861 -8.83657,10.44178 -13.17454,8.51874c-4.33797,-1.92303 -7.95119,-3.26405 -2.53464,-15.48266c5.41655,-12.21861 17.81172,-30.68787 22.14969,-28.76483c4.33797,1.92304 -1.02396,23.51014 -6.4405,35.72876z" fill="currentColor" stroke-width="0"/></g></g></svg><!--rotationCenter:35.249975000000006:35.25000499999999-->'; }

    updatePositions() {
        let { selectionMinX, selectionMinY, selectionMaxX, selectionMaxY } = this.workspace;

        this.x = (this.workspace.hasSelection) ? selectionMinX : 0;
        this.y = (this.workspace.hasSelection) ? selectionMinY : 0;
        this.width = (this.workspace.hasSelection) ? selectionMaxX - selectionMinX : this.workspace.width;
        this.height = (this.workspace.hasSelection) ? selectionMaxY - selectionMinY : this.workspace.height;
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
        
        this.angle = 0;
        this.offsetAngle = 0;
        this.initialAngle = 0;

        createImageBitmap(this.imageData).then(bitmap => {
            this.bitmap = bitmap;
            this.ready = true;
            this.updatePositions();

            //So we don't offset the image while rotating
            this.imageX = this.x;
            this.imageY = this.y;
            this.imageWidth = this.width;
            this.imageHeight = this.height;

            gl.clearRect(
                selectionMinX,
                selectionMinY,
                selectionMaxX,
                selectionMaxY
            );

            this.preview(previewGL, ...this.workspace.lastPosition, toolProperties);
            this.workspace.dirty = true;
        });
    }

    deselected(gl, previewGL, toolProperties) {
        gl.drawImage(this.bitmap, this.x, this.y);
        if (this.bitmap) this.bitmap.close();
        this.workspace.dirty = true;
    }

    isInCircle(x, y, cx, cy, radius) { return Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2)) <= radius; }

    mouseDown(gl, x, y, toolProperties) {
        if (this.ready) {
            this.dragging = true;
            this.rotating = false;

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
                this.angle = Math.atan2(this.cy - y, this.cx - x) - this.initialAngle;
                const sin = Math.sin(-this.angle);
                const cos = Math.cos(-this.angle);

                const selection = this.workspace.selection;
                for (let i = 0; i < this.initialSelection.length; i+=2) {
                    const x = this.initialSelection[i] - this.cx;
                    const y = this.initialSelection[i + 1] - this.cy;

                    selection[i] = (y * sin + x * cos) + this.cx;
                    selection[i + 1] = (y * cos - x * sin) + this.cy; 
                }

                this.workspace.selection = selection;
                this.updatePositions();
            }
            else {
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
        }        
    }

    drawCircle(gl, x, y, radius, fill) {
        gl.beginPath();
        gl.ellipse(x + 0.5, y + 0.5, radius, radius, 0, 0, 2 * Math.PI);
        if (fill) gl.fill();
        gl.stroke();
        gl.closePath();
    }

    preview(gl, x, y, toolProperties) {
        const sin = Math.sin(this.angle - this.offsetAngle);
        const cos = Math.cos(this.angle - this.offsetAngle);
        const offsetX = this.imageX + (this.imageWidth / 2);
        const offsetY = this.imageY + (this.imageHeight / 2);

        this.workspace.applySelectionToPreview();
        gl.setTransform(cos, sin, -sin, cos, offsetX, offsetY);
        gl.drawImage(this.bitmap, (this.imageWidth / -2), (this.imageHeight / -2));
        gl.setTransform(1, 0, 0, 1, 0, 0);
        this.workspace.clearSelectionFromPreview();
        
        gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        this.drawCircle(gl, this.x, this.y, 3, this.isInCircle(x, y, this.x, this.y, 3));
        this.drawCircle(gl, this.x + this.width, this.y, 3, this.isInCircle(x, y, this.x + this.width, this.y, 3));
        this.drawCircle(gl, this.x + this.width, this.y + this.height, 3, this.isInCircle(x, y, this.x + this.width, this.y + this.height, 3));
        this.drawCircle(gl, this.x, this.y + this.height, 3, this.isInCircle(x, y, this.x, this.y + this.height, 3));
    }

    properties = {
        strokeColor: "#000000",
        strokeSize: 2,
        pixelBrush: false,
    }
}