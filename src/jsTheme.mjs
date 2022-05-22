import { share, final } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

const Theme = final(class Theme extends TagBase {
    static #tagName = "js-theme";
    
    static #sprot = share(this, {});
    
    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["name", "path"]);
    }
    static get isManagement() {return true};

    #globalStyleSheet = null;
    #componentColors = null;
    #componentSheets = null;
    #attributeError = false;
    #loaded = false;

    #createLink(name, file) {
        let retval = "";
        if (file) {
            retval = `<link id="${name}" rel="stylesheet" href="${file}"/>`;
        }
        return retval;
    }

    async #loadTheme() {
        try {
            let prefix = this.path + ((this.path[this.path.length-1] == "/") ? "" : "/");
            let themeFile = await fetch(prefix + "theme.json");
            let info = JSON.parse(await themeFile.text());
            let components = info.components;
            this.pvt.#globalStyleSheet = prefix + components.global;
            this.pvt.#componentColors = prefix + components.color;
    
            if (Array.isArray(components.tags)) {
                this.pvt.#componentSheets = {};
    
                for (let name of components.tags) {
                    this.pvt.#componentSheets[name] = prefix + name + ".css";
                }
            }

            this.pvt.#loaded = true;
            this.fireEvent("loaded");
        }
        catch(e) {
            console.error(`Failed to load themes from "${path}"`, e);
        }
    }

    #prot = share(this, Theme, {
        render() {

        },
        onNameChange(e) {
            if (!this.pvt.#attributeError) {
                let {oldVal, newVal} = e.detail;

                if ((oldVal === null) && (typeof(newVal) == "string")) {
                    if (this.path.length) {
                        this.pvt.#loadTheme();
                    }
                }
                else {
                    this.pvt.#attributeError = true;
                    try {
                        this.setAttribute("name", oldVal);
                    }
                    finally {
                        this.pvt.#attributeError = false;
                    }
                    throw new TypeError((oldVal != "") 
                        ? "Theme name cannot be altered."
                        : "Invalid new theme name."
                    );
                }
            }
        },
        onPathChange(e) {
            if (!this.pvt.#attributeError) {
                let {oldVal, newVal} = e.detail;

                if ((oldVal === null) && (typeof(newVal) == "string")) {
                    if (this.name.length) {
                        this.pvt.#loadTheme();
                    }
                }
                else {
                    this.pvt.#attributeError = true;
                    try {
                        this.setAttribute("path", oldVal);
                    }
                    finally {
                        this.pvt.#attributeError = false;
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
        
        let prot = this.pvt.#prot;
        this.addEventListener("nameChange", prot.onNameChange);
        this.addEventListener("pathChange", prot.onPathChange);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    componentLink(tagName) {
        let retval = "";
        if (tagName in this.pvt.#componentSheets) {
            retval = this.pvt.#createLink("colors", this.pvt.#componentColors)
                + this.pvt.#createLink("componentTheme", this.pvt.#componentSheets[tagName]);
        }
        else {
            console.warn(`Could not find style for ${tagName}...`);
        }
        return retval;
    }

    get name() { return this.getAttribute("name"); }

    get path() { return this.getAttribute("path"); }

    get globalLink() {
        return this.pvt.#createLink("colors", this.pvt.#componentColors)
            + this.pvt.#createLink("theme", this.pvt.#globalStyleSheet);
    }
});

export default Theme;
