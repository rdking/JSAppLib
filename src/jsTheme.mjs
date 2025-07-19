import { share, final } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";

const Theme = final(class Theme extends Base {
    
    static #spvt= share(this, {});
    
    static get observedAttributes() {
        return Base.observedAttributes.concat([ "themename", "themepath" ]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            themeName: {},
            themePath: {}
        });
        spvt.register(this);
    }

    static get isManagement() { return true; }

    #globalStyleSheet = null;
    #componentColors = null;
    #componentSheets = null;
    #attributeError = false;
    #loaded = false;
    #loading = false;

    #createLink(name, file) {
        let retval = "";
        if (file) {
            retval = `<style id="${name}">@import url("${file}")</style>`;
        }
        return retval;
    }

    async #loadTheme() {
        try {
            console.log(`Loading ${this.themeName} theme...`);
            if (!this.$.#loading) {
                this.$.#loading = true;
                let prefix = this.themePath + ((this.themePath[this.themePath.length-1] == "/") ? "" : "/");
                let stack = [];
                let components;

                this.$.#globalStyleSheet = [];
                this.$.#componentColors = [];

                do {
                    let themeFile = await fetch(prefix + "theme.json");
                    let info = JSON.parse(await themeFile.text());
                    components = info.components;
                    
                    if (components.inherits) {
                        stack.push([prefix, components]);
                        prefix = components.inherits;
                    }
                } while (components.inherits);

                do {
                    let css = await Promise.all([fetch(prefix + components.global), fetch(prefix + components.color)]);
                    let globalStyle = new CSSStyleSheet();
                    let colorStyle = new CSSStyleSheet();
                    const gsText = await css[0].text();
                    const csText = await css[1].text();

                    globalStyle.replaceSync(gsText);
                    colorStyle.replaceSync(csText);
                    this.$.#globalStyleSheet.push(globalStyle);
                    this.$.#componentColors.push(colorStyle);
                    
                    if (Array.isArray(components.tags)) {
                        if (!this.$.componentSheets) {
                            this.$.#componentSheets = {};
                        }
                        
                        for (let name of components.tags) {
                            if (!this.$.#componentSheets[name]) {
                                this.$.#componentSheets[name] = [];
                            }

                            let sheet = new CSSStyleSheet();
                            sheet.replaceSync(await (await fetch(prefix + name + ".css")).text());
                            this.$.#componentSheets[name].push(sheet);
                        }
                    }

                    if (stack.length) {
                        let next = stack.pop();
                        prefix = next[0];
                        components = next[1];
                    } else {
                        prefix = void 0;
                        components = void 0;
                    }
                } while (prefix);
                
                this.$.#loaded = true;
                console.log(`Loaded ${this.themeName} theme...`);
                this.fireEvent("loaded");
            }
        }
        catch(e) {
            throw new AppLibError(`Failed to load themes from "${this.path}"`, e);
        }
    }

    #pvt= share(this, Theme, {
        render() {
            //NOP
        },
        onNameChange(e) {
            if (!this.$.#attributeError) {
                let {oldValue: oldVal, newValue: newVal} = e.detail;

                if ((oldVal === null) && (typeof(newVal) == "string")) {
                    if ((typeof(this.themePath) == "string") && this.themePath.length) {
                        this.$.#loadTheme();
                    }
                }
                else {
                    this.$.#attributeError = true;
                    try {
                        this.themeName = oldVal;
                    }
                    finally {
                        this.$.#attributeError = false;
                    }
                    throw new TypeError((oldVal != "") 
                        ? "Theme name cannot be altered."
                        : "Invalid new theme name."
                    );
                }
            }
        },
        onPathChange(e) {
            if (!this.$.#attributeError) {
                let {oldValue: oldVal, newValue: newVal} = e.detail;

                if ((oldVal === null) && (typeof(newVal) == "string")) {
                    if ((typeof(this.themeName) == "string") && this.themeName.length) {
                        this.$.#loadTheme();
                    }
                }
                else {
                    this.$.#attributeError = true;
                    try {
                        this.themePath = oldVal;
                    }
                    finally {
                        this.$.#attributeError = false;
                    }
                    throw new TypeError((oldVal != "") 
                        ? "Theme path cannot be altered."
                        : "Invalid new theme path."
                    );
                }
            }
        }
    });

    constructor() {
        super();   

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            themenameChanged: pvt.onNameChange,
            themepathChanged: pvt.onPathChange
        });

        if (this.themeName === "default") {
            pvt.onNameChange({ detail: { oldValue: null, newValue: this.themeName } });
        }
    }

    componentLink(tag, shadow) {
        const sheets = this.$.#componentSheets;
        const tagName = tag.cla$$.tagName;
        let retval = [];
        if (sheets && (tagName in sheets)) {
            retval = this.$.#componentColors.concat(sheets[tagName]);
        }
        else {
            console.warn(`Could not find style for ${tagName}...`);
        }
        return retval;
    }

    get globalLink() {
        return this.$.#componentColors.concat(this.$.#globalStyleSheet);
    }

    get ready() { return this.$.#loaded; }
});

export default Theme;
