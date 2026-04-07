if (window.CUGI) {
    CUGI.types.color = (data) => {
        const { target, key } = data;

        //Put CUGI color in there.
        const input = document.createElement("color-picker");
        input.value = String(target[key]);
        input.className = "CUGI-Color";

        input.gradient = (typeof data.disabled == "function") ? data.disabled() : data.disabled;
        input.disabled = (typeof data.disabled == "function") ? data.disabled() : data.disabled;

        input.onchange = CUGI.macros.onchange(data, input);

        console.log("you are in my house now beach.");

        return input;
    };
}