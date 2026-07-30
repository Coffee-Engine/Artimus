editor.touchCalibrationMenu = class extends editor.settingsPage {
    init(container, translationKey, onchange) {
        container.className = "settings-touchCalibrationMenu";

        //Create the buttons and sliders
        const startCalibration = document.createElement("button");
        
        //Create the scratchpad
        const scratchPad = document.createElement("canvas");
        const scratchGL = scratchPad.getContext("2d");

        //Add classes
        startCalibration.className = "artimus-button";
        scratchPad.className = "touchCalibrationMenu-scratchPad";

        startCalibration.innerText = "Start calibration!";

        container.appendChild(startCalibration);
        container.appendChild(scratchPad);

        //Define the pointer
        let lPointerX = 0; let lPointerY = 0;
        let pointerX = 0; let pointerY = 0;
        let pointerPressure = 0; let pointerDown = false;

        //Add functionality
        scratchPad.onpointerdown = (event) => {
            //Move pointer
            pointerX = event.offsetX; pointerY = event.offsetY;
            lPointerX = pointerX; lPointerY = pointerY;

            //Set pressure and status
            pointerPressure = event.pressure;
            pointerDown = true;
        }

        scratchPad.onpointermove = (event) => {
            //Move and set pressure
            pointerX = event.offsetX; pointerY = event.offsetY;
            pointerPressure = event.pressure;
        }

        scratchPad.onpointerup = () => { pointerDown = false; }

        //Scratchpad loop
        this.stopLoop = false;
        let last = Date.now();
        const scratchLoop = () => {
            const now = Date.now();
            const delta = (now - last) / 1000;
            last = now;
            
            let { width, height } = scratchPad.getBoundingClientRect();
            width = Math.floor(width);
            height = Math.floor(height);

            //Now and last
            if (scratchPad.width != width) scratchPad.width = width;
            if (scratchPad.height != height) scratchPad.height = height;

            //Leave after image
            scratchGL.globalAlpha = Math.min(1, delta * 4);
            scratchGL.fillStyle = artimus.getCSSVariable("background-2");
            scratchGL.fillRect(0, 0, width, height);

            //Draw final
            scratchGL.globalAlpha = 1;
            scratchGL.fillStyle = artimus.getCSSVariable("text");

            //Draw pointer
            if (pointerDown) {
                //Calculate size to draw
                const calculatedSize = (0.5 + (2.0 - 0.5) * pointerPressure) * 5;

                //Then draw a smooth line
                const step = 1 / Math.sqrt(Math.pow(pointerX - lPointerX, 2) + Math.pow(pointerY - lPointerY, 2));
                for (let i = 0; i < 1; i += step) {
                    //Calculate step value;
                    const cx = lPointerX + (pointerX - lPointerX) * i;
                    const cy = lPointerY + (pointerY - lPointerY) * i;
                    
                    //Draw the ellipses
                    scratchGL.beginPath()
                    scratchGL.ellipse(cx, cy, calculatedSize, calculatedSize, 0, 0, Math.PI * 2);
                    scratchGL.fill();
                    scratchGL.closePath();
                }

                lPointerX = pointerX;
                lPointerY = pointerY;
            }

            if (!this.stopLoop) requestAnimationFrame(scratchLoop);
        }

        requestAnimationFrame(scratchLoop);
    }

    destroy() { this.stopLoop = true; }
}