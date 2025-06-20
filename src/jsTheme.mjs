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
                let themeFile = await fetch(prefix + "theme.json");
                let info = JSON.parse(await themeFile.text());
                let components = info.components;
                this.$.#globalStyleSheet = prefix + components.global;
                this.$.#componentColors = prefix + components.color;
        
                if (Array.isArray(components.tags)) {
                    this.$.#componentSheets = {};
        
                    for (let name of components.tags) {
                        this.$.#componentSheets[name] = prefix + name + ".css";
                    }
                }

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

    componentLink(tagName) {
        const sheets = this.$.#componentSheets;
        let retval = "";
        if (sheets && (tagName in sheets)) {
            retval = this.$.#createLink("colors", this.$.#componentColors)
                + this.$.#createLink("componentTheme", sheets[tagName]);
        }
        else {
            console.warn(`Could not find style for ${tagName}...`);
        }
        return retval;
    }

    get globalLink() {
        return this.$.#createLink("colors", this.$.#componentColors)
            + this.$.#createLink("theme", this.$.#globalStyleSheet);
    }

    get ready() { return this.$.#loaded; }
});

export default Theme;
