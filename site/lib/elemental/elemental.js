//Elemental, the quick and dirty way to define HTML elements using JS;
(function() {
    let defaultCSS = "";
    window.elemental = {
        elements: {},

        newElement: (name, options) => {
            if (!name || !options) return;

            let definedElement = class extends HTMLElement {};
            if (!options.class) {
                definedElement = class extends HTMLElement {
                    constructor() { super(); this.created(this); }

                    adoptedCallback() { this.adopted(this, this.parentElement != null, this.parentElement); }
                    
                    attributeChangedCallback(name, oldValue, newValue) { this.attributeChanged(this, name, oldValue, newValue); }

                    created() {}
                    adopted(added, parentElement) {}
                    attributeChanged() {}
                };

                if (options.created) definedElement.prototype.created = options.created;
                if (options.adopted) definedElement.prototype.adopted = options.adopted;
                if (options.attributeChanged) definedElement.prototype.attributeChanged = options.attributeChanged;
                if (options.attributes) definedElement.prototype.observedAttributes = options.attributes;
            }
            else definedElement = options.class;

            const safeName = name.toLowerCase().replaceAll(/\s/g, "-");
            if (options.css) {
                defaultCSS += `\n/*${name}*/\n${options.css.replaceAll("<el>", safeName).replaceAll("<element-name>", safeName)}`;
                elemental.styleElement.innerHTML = defaultCSS;
            }
            
            customElements.define(safeName, definedElement);

            //Add entries for the desired name and the safe name;
            elemental.elements[name] = definedElement;
            elemental.elements[safeName] = definedElement;

            return definedElement;
        }
    }

    elemental.styleElement = document.createElement("style");
    document.head.appendChild(elemental.styleElement);
})();