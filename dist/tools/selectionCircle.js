artimus.tools.selectionCircle = class extends artimus.tool {
    constructive = false;
    
    get icon() { return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="117.67375" height="117.67375" viewBox="0,0,117.67375,117.67375"><g transform="translate(-181.16313,-121.16312)"><g stroke-miterlimit="10"><path d="M181.16313,238.83687v-117.67375h117.67375v117.67375z" fill="none" stroke="none" stroke-width="0" /><path d="M192.04716,179.99999c0,-26.48362 21.46922,-47.95284 47.95284,-47.95284c26.48362,0 47.95284,21.46922 47.95284,47.95284c0,26.48362 -21.46922,47.95284 -47.95284,47.95284c-26.48362,0 -47.95284,-21.46922 -47.95284,-47.95284z" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="16 8" /></g></g></svg><!--rotationCenter:58.83687282811721:58.836882828117226-->'; }
    
    mouseDown(gl, x, y, toolProperties) {
        this.start = [x, y];
    }

    getEllipse(sx, sy, ex, ey) {
        let width = ex - sx;
        let height = ey - sy;

        if (this.shiftHeld) {
            if (Math.abs(width) < Math.abs(height)) {
                if (artimus.preferGreaterAxis) width = Math.abs(height) * ((width < 0) ? -1 : 1);
                else height = Math.abs(width) * ((height < 0) ? -1 : 1);
            }
            else {
                if (artimus.preferGreaterAxis) height = Math.abs(width) * ((height < 0) ? -1 : 1);
                else width = Math.abs(height) * ((width < 0) ? -1 : 1);
            }
        }

        width /= 2;
        height /= 2;

        return [sx + width, sy + height, Math.abs(width), Math.abs(height)];
    }

    getEllipseStroke(sx, sy, ex, ey) {
        const [x, y, width, height] = this.getEllipse(sx, sy, ex, ey);
        return [x + 0.5, y + 0.5, width, height];
    }

    mouseUp(gl, x, y, toolProperties) {
        if (this.start) {
            if (this.start[0] == x && this.start[1] == y) this.workspace.clearSelection();
            else {
                const [cx, cy, rx, ry] = this.getEllipse(...this.start, x, y);

                const points = [];

                //This is probably good enough.
                //! Shown above is sloth
                for (let i = 0; i < 360; i++) {
                    let rad = artimus.degreeToRad(i);
                    points.push(
                        (Math.sin(rad) * rx) + cx,
                        (Math.cos(rad) * ry) + cy
                    )
                }

                this.workspace.setSelection(points);
            }
        }

        this.start = null;
    }

    preview(gl, x, y, toolProperties) {
        if (this.start) {
            gl.setLineDash([4, 2]);
            gl.strokeStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
            gl.lineWidth = 1;

            gl.beginPath();
            gl.ellipse(...this.getEllipseStroke(...this.start, x, y), 0, 0, 2 * Math.PI);
            gl.stroke();
            gl.setLineDash([]);
        }
        gl.fillStyle = getComputedStyle(document.body).getPropertyValue("--artimus-selection-outline");
        gl.fillRect(x, y, 1, 1);
    }
}