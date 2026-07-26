# Contributing to Artimus
When Contributing to Artimus we have some basic rules that must be followed to ensure some sense of quality and responsibility from our contributors.

## Code sourcing
If code is taken from another source, it would be nice to have it cited within a comment if that would be practical.

An example of this in `Coffee-Engine/Coffee-Engine:src/main.js` would be
```js
//From https://stackoverflow.com/questions/55785565/how-do-i-blur-an-electron-browserwindow-with-transparency thanks anon!
vibrancy: "fullscreen-ui", // on MacOS
backgroundMaterial: "acrylic", // on Windows 11
```
You may leave comments thanking users, or just exclamations like above, but make sure you leave a link to the source if it wouldn't be obvious.

## AI/LLM policy
We do not allow AI graphics, code, or motion pictures to be used within this repository. Code reviews must also be done by hand to ensure quality is maintained.

## Code Style
- Four space indents are recommended unless the situation complete calls for a more unique indent.
- Double quotes are recommended for single line strings, while backtick strings are recommended for constant multiline strings or when strings need to have dynamic text. Otherwise using `artimus.translate` would be preferable.
    - An example of dynamic text would be 
    ```js
    this.quickVar(this.container, {
        "scrollX": `${this.scrollX}px`,
        "scrollY": `${this.scrollY}px`,
        "zoom": this.zoom,
        "canvasWidth": `${this.width}px`,
        "canvasHeight": `${this.height}px`
    });
    ```