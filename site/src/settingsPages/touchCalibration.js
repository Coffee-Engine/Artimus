editor.touchCalibrationMenu = class extends editor.settingsPage {
    calibrationStep = 0;
    calibrationData = 0;
    calibrationStepData = {};

    calibrationSteps = [
        {
            initilize: () => { 
                this.calibrationData = 0;
                this.calibrationButton.innerText = artimus.translate("lightly", this.translationKey);
            },
            start: (event) => { this.calibrationData = event.pressure; },
            move: (event) => { this.calibrationData = (this.calibrationData + event.pressure) / 2; },
            finish: (event) => { editor.settings.lightPressure = this.calibrationData; }
        },
        {
            initilize: () => { 
                this.calibrationData = 1;
                this.calibrationButton.innerText = artimus.translate("heavily", this.translationKey);
            },
            start: (event) => { this.calibrationData = event.pressure; },
            move: (event) => { this.calibrationData = (this.calibrationData + event.pressure) / 2; },
            finish: (event) => { editor.settings.heavyPressure = this.calibrationData; }
        }
    ]
    
    progressCalibration() {
        if (this.calibrationStepData.finish) this.calibrationStepData.finish();

        //Advance and setup shop
        this.calibrationStep++;

        //Just incase I want to extend this in the future.
        this.calibrationStepData = this.calibrationSteps[this.calibrationStep - 1] || {};
        if (this.calibrationStepData.initilize) this.calibrationStepData.initilize();

        //Yeah this stuff
        if (this.calibrationStep > this.calibrationSteps.length) {
            this.calibrationButton.innerText = artimus.translate("calibrated", this.translationKey);
            this.calibrationStep = 0;

            this.pushPenCalibration();
        }
    }

    //Setup
    pushPenCalibration(noSave) {
        artimus.penCalibration.lightPressure = editor.settings.lightPressure;
        artimus.penCalibration.lightMultiplier = editor.settings.lightMultiplier;
        artimus.penCalibration.heavyPressure = editor.settings.heavyPressure;
        artimus.penCalibration.heavyMultiplier = editor.settings.heavyMultiplier;
        
        if (!noSave) editor.saveSettings();
    }

    editorReady() { this.pushPenCalibration(true); }

    init(container, translationKey, onchange) {
        container.className = "settings-touchCalibrationMenu";

        //Create the buttons and sliders
        const settingsContainer = document.createElement("div");
        const minInput = document.createElement("input");
        const maxText = document.createElement("p");
        const maxInput = document.createElement("input");

        this.calibrationButton = document.createElement("button");
        
        //Create the scratchpad
        const scratchPad = document.createElement("canvas");
        const scratchGL = scratchPad.getContext("2d");

        //Add classes
        settingsContainer.className = "settings-touchCalibrationInputs";
        this.calibrationButton.className = "artimus-button";
        scratchPad.className = "touchCalibrationMenu-scratchPad";

        //Add initial config
        minInput.type = "number"; minInput.value = editor.settings.lightMultiplier; minInput.step = 0.05;
        maxInput.type = "number"; maxInput.value = editor.settings.heavyMultiplier; maxInput.step = 0.05;
        this.calibrationButton.innerText = artimus.translate("start", translationKey);

        //Add to container
        settingsContainer.appendChild(editor.quickP(artimus.translate("lightMultiplier", translationKey), "touchCalibrationMenu-multiplierText"));
        settingsContainer.appendChild(minInput);
        settingsContainer.appendChild(editor.quickP(artimus.translate("heavyMultiplier", translationKey), "touchCalibrationMenu-multiplierText"));
        settingsContainer.appendChild(maxInput);

        container.appendChild(settingsContainer);
        container.appendChild(this.calibrationButton);
        container.appendChild(scratchPad);

        //Ability to start calibration
        this.calibrationButton.onclick = () => {
            if (this.calibrationStep == 0) this.progressCalibration();
        }

        //Define the pointer
        let lPointerX = 0; let lPointerY = 0;
        let pointerX = 0; let pointerY = 0;
        let pointerPressure = 0; let pointerDown = false;

        //Add functionality
        minInput.onchange = () => {
            //Make sure it is a number
            minInput.value = Number(minInput.value);
            if (isNaN(minInput.value)) minInput.value = 0.1;

            //Set the value and clamp it to a range.
            minInput.value = Math.min(Math.max(0, minInput.value), maxInput.value);
            editor.settings.lightMultiplier = Number(maxInput.value);

            this.pushPenCalibration();
        }

        maxInput.onchange = () => {
            //Make sure it is a number
            maxInput.value = Number(maxInput.value);
            if (isNaN(maxInput.value)) maxInput.value = minInput.value;

            //Set the value and clamp it to a range.
            maxInput.value = Math.max(minInput.value, maxInput.value);
            editor.settings.heavyMultiplier = Number(maxInput.value);

            this.pushPenCalibration();
        }
        
        scratchPad.onpointerdown = (event) => {
            event.preventDefault();
            event.stopPropagation();

            //Move pointer
            pointerX = event.offsetX; pointerY = event.offsetY;
            lPointerX = pointerX; lPointerY = pointerY;

            //Set pressure and status
            pointerPressure = event.pressure;
            pointerDown = true;

            //Calibration data stuff
            if (this.calibrationStepData.start) this.calibrationStepData.start(event);
        }

        scratchPad.onpointermove = (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (pointerDown) {
                //Move and set pressure
                pointerX = event.offsetX; pointerY = event.offsetY;
                pointerPressure = event.pressure;

                //Calibration data stuff
                if (this.calibrationStepData.move) this.calibrationStepData.move(event);
            }
        }

        scratchPad.onpointerup = (event) => { 
            event.preventDefault();
            event.stopPropagation();

            //Calibration data stuff
            if (this.calibrationStepData.finish) this.calibrationStepData.finish(event);
            if (this.calibrationStep != 0) this.progressCalibration();

            //Then tell the program the pointer is no longer down.
            pointerDown = false;
        }

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