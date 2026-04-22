editor.palettes = {
    palette: class {
        name = "???";
        author = "???";
        originalFormat = "";
        
        colors = [];

        toString() { return this.colors.join(","); }
    },

    formats: [
        //Paint.NET Palette.
        {
            fileFormat: "text",
            identifier: "Paint.NET",
            
            //The code portion
            condition: (text) => text.startsWith(";paint.net Palette File"),
            import: (text, paletteObject) => {
                //Split the file by lines and ready the colors array
                const split = text.split("\n");

                //Look through each line
                for (let i=0;i<split.length;i++) {
                    const line = split[i].toLowerCase().trim();
                    if (!line.startsWith(";")) {
                        //If we aren't transparent, don't rearrange.
                        if (line.startsWith("ff") || line.length == 6) 
                            paletteObject.colors.push(`#${line.substr(2, line.length-2)}`);
                        //otherwise do
                        else if(line.length == 8) 
                            paletteObject.colors.push(`#${line.substr(2, line.length-2)}${line.substr(0, 2)}`);
                    }
                    //Check for a name.
                    else if (line.startsWith(";palette name:")) 
                        paletteObject.name = split[i].replace(";Palette Name:", "").trim();
                }

                //Return the final product (More for debug than anything)
                return paletteObject;
            }
        },
        //JASC
        {
            fileFormat: "text",
            identifier: "JASC Pal",
            
            //The code portion
            condition: (text) => text.startsWith("JASC-PAL\n0100\n"),
            import: (text, paletteObject) => {
                //Split the file by lines and ready the colors array
                const split = text.split("\n");

                //Look through each line
                for (let i=3;i<split.length;i++) {
                    //Fetch the colors;
                    let color = split[i].toLowerCase().trim();
                    if (!color) continue;

                    //Map the colors to numbers, and make sure to make hex codes 2 characters long.
                    color = color.split(/\W/g).map((val) => {
                        const stringified = Math.max(0, Math.min(255, Math.floor(Number(val)))).toString(16)
                        if (stringified.length < 2) return `0${stringified}`;
                        return stringified;
                    });

                    //If we are nan skip the color
                    if (color.includes("NaN")) continue;

                    //Not sure if JASC supports transparency but just in case.
                    if (color.length == 3)
                        paletteObject.colors.push(`#${color[0]}${color[1]}${color[2]}`);
                    else if (color.length == 4)
                        paletteObject.colors.push(`#${color[0]}${color[1]}${color[2]}${color[3]}`);
                }

                //Return the final product (More for debug than anything)
                return paletteObject;
            }
        },
        //GIMP
        {
            fileFormat: "text",
            identifier: "GIMP",
            
            //The code portion
            condition: (text) => text.startsWith("GIMP Palette"),
            import: (text, paletteObject) => {
                //Split the file by lines and ready the colors array
                const split = text.split("\n");

                //Look through each line
                for (let i=1;i<split.length;i++) {
                    const line = split[i];

                    //Support for GIMP 2.0 naming format
                    if (i == 1 && line.startsWith("Name:")) {
                        paletteObject.name = line.replace("#Palette Name:", "").trim();
                        continue;
                    }

                    //Filter out comments and find important ones from Lo-Spec
                    if (line.startsWith("#")) {
                        if (line.startsWith("#Palette Name:")) paletteObject.name = line.replace("#Palette Name:", "").trim();
                    }
                    else {
                        //Fetch the colors;
                        let color = line.toLowerCase().trim();
                        if (!color) continue;

                        //Map the colors to numbers, and make sure to make hex codes 2 characters long.
                        color = color.split(/\W/g).map((val) => {
                            const stringified = Math.max(0, Math.min(255, Math.floor(Number(val)))).toString(16)
                            if (stringified.length < 2) return `0${stringified}`;
                            return stringified;
                        });

                        //If we are nan skip the color
                        const NaNIndex = color.indexOf("NaN");
                        if (NaNIndex < color.length - 1 && NaNIndex != -1) continue;


                        //Not sure if GIMP supports transparency but just in case.
                        if (color.length == 4)
                            paletteObject.colors.push(`#${color[0]}${color[1]}${color[2]}`);
                        else if (color.length == 5)
                            paletteObject.colors.push(`#${color[0]}${color[1]}${color[2]}${color[3]}`);
                    }
                }

                //Return the final product (More for debug than anything)
                return paletteObject;
            }
        },
        //hex file
        {
            fileFormat: "text",
            identifier: "HEX",
            
            //The code portion
            condition: (text) => !isNaN(Number(`0x${text.replaceAll(/\s/g, "")}`)),
            import: (text, paletteObject) => {
                //Split the file by lines and ready the colors array
                const split = text.trim("\n").toLowerCase().split("\n");

                //Return the final product
                paletteObject.colors = split.reduce((acc, val) => {
                    val = val.trim();
                    //Filter out small possibilities.
                    if (val && (val.length == 6 || val.length == 8)) {
                        //Filter out oddities.
                        if (val.replaceAll(/[^\dabcdef]/g, "").length == val.length) acc.push(`#${val}`);
                    }

                    return acc;
                }, []);

                return paletteObject;
            }
        },
    ],

    fromText: (data) => {
        const palette = new editor.palettes.palette();
        const formats = editor.palettes.formats;

        for (let i=0; i<formats.length; i++) {
            if (formats[i].condition(data)) {
                formats[i].import(data, palette);
                palette.originalFormat = formats[i].identifier;
                break;
            }
        }

        console.log(palette);
    }
}