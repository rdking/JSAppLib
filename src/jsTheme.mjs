import { share, final } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ManageableBase from "./jsManageableBase.mjs";

const Theme = final(class Theme extends ManageableBase {
    
    static #spvt= share(this, {});
    
    static get observedAttributes() {
        return ManageableBase.observedAttributes.concat([ "themename", "themepath" ]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            themename: { readonly: true, caption: "themeName" },
            themepath: { readonly: true, caption: "themePath" }
        });
        spvt.register(this);
    }

    #globalStyleSheet = null;
    #componentColors = null;
    #componentSheets = null;
    #attributeChanging = false;
    #loaded = false;
    #loading = false;

    async #loadTheme() {
        try {
            console.log(`Loading ${this.themeName} theme...`);
            if (!this.$.#loading) {
                this.$.#loading = true;
                try {
                    const libPrefix = this.parentElement.getAttribute("liblocation") || "";
                    const tpath = `${libPrefix}${libPrefix.endsWith("/") ? "" : "/"}${this.themeName || "default"}/`;
                    let path = this.themePath || tpath;
                    let baseUrl = new URL(path.endsWith('/') ? path : path + '/', window.location.href);
                    let stack = [];
                    let components;

                    this.$.#globalStyleSheet = [];
                    this.$.#componentColors = [];

                    do {
                        const themeJsonUrl = new URL("theme.json", baseUrl.href);
                        let themeFile = await fetch(themeJsonUrl.href);
                        let info = JSON.parse(await themeFile.text());
                        components = info.components;
                        
                        if (components.inherits) {
                            stack.push([baseUrl, components]);
                            // Resolve the inherited path relative to the current theme's URL
                            baseUrl = new URL(components.inherits, baseUrl.href);
                            if (!baseUrl.href.endsWith("/")) {
                                baseUrl = new URL(baseUrl.href + "/");
                            }
                        }
                    } while (components.inherits);

                    let prefix;
                    do {
                        prefix = baseUrl.href;
                        let list = [];
                        list.push(components.global
                            ? fetch(prefix + components.global)
                            : new Promise((resolve) => { resolve({ text() { return ""; } }) }));
                        list.push(components.color
                            ? fetch(prefix + components.color)
                            : new Promise((resolve) => { resolve({ text() { return ""; } }) }));
                        let css = await Promise.all(list);
                        let globalStyle = new CSSStyleSheet();
                        let colorStyle = new CSSStyleSheet();
                        const gsText = await css[0].text();
                        const csText = await css[1].text();

                        globalStyle.replaceSync(gsText);
                        colorStyle.replaceSync(csText);
                        this.$.#globalStyleSheet.push(globalStyle);
                        this.$.#componentColors.push(colorStyle);
                        
                        if (Array.isArray(components.tags)) {
                            if (!this.$.#componentSheets) {
                                this.$.#componentSheets = {};
                            }

                            let sheets = await Promise.all(components.tags.map(name => fetch(prefix + name + ".css")));
                            sheets = await Promise.all(sheets.map(sheet => sheet.text()));
                            sheets = await Promise.all(sheets.map(sheet => {
                                let retval = new CSSStyleSheet();
                                return retval.replace(sheet);
                            }));

                            sheets.forEach((style, index) => {
                                const componentSheets = this.$.#componentSheets;
                                let name = components.tags[index];
                                const isArray = Array.isArray(componentSheets[name]);
                                isArray ? componentSheets[name].push(style) : componentSheets[name] = [ style ];
                            });
                        }

                        if (stack.length) {
                            let next = stack.pop();
                            baseUrl = next[0];
                            components = next[1];
                        } else {
                            prefix = void 0;
                            components = void 0;
                        }
                    } while (prefix);
                    
                    this.$.#loaded = true;
                    console.log(`Loaded ${this.themeName} theme...`);
                    this.fireEvent("loaded");
                } finally {
                    this.$.#loading = false;
                }
            }
        }
        catch(e) {
            throw new AppLibError(`Failed to load theme "${this.themeName}"`, e);
        }
    }

    #pvt= share(this, Theme, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.tagType("thememanager"), "Themes can only be declared in a ThemeManager.");
        },
        onNameChange(e) {
            if (!this.$.#attributeChanging) {
                let {oldValue: oldVal, newValue: newVal} = e.detail;
                try {
                    this.$.#attributeChanging = true;

                    //If the name has already been set, don't allow it to be changed.
                    if (oldVal !== null) {
                        if (oldVal !== newVal) {
                            this.setAttribute("themename", oldVal);
                        }
                        throw new TypeError((oldVal != "") 
                            ? "Theme name cannot be altered."
                            : "Invalid new theme name.");
                    }
                } finally {
                    this.$.#attributeChanging = false;
                }
            }
        },
        onPathChange(e) {
            if (!this.$.#attributeChanging) {
                let {oldValue: oldVal, newValue: newVal} = e.detail;
                try {
                    this.$.#attributeChanging = true;

                    if (oldVal !== null) {
                        if (oldVal !== newVal) {
                            this.setAttribute("themepath", oldVal);
                        }
                        throw new TypeError((oldVal != "") 
                            ? "Theme path cannot be altered."
                            : "Invalid new theme path.");
                    }
                } finally {
                    this.$.#attributeChanging = false;
                }
            }
        }
    });

    constructor() {
        super();   

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            themenameChanged: "onNameChange",
            themepathChanged: "onPathChange"
        });
    }

    componentLink(tag, shadow) {
        const sheets = this.$.#componentSheets;
        const tagName = tag.localName;
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

    get loaded() { return this.$.#loaded; }

    async load(cb) {
        if (!this.$.#loaded) {
            await this.$.#loadTheme();
        }
    }
});

export default Theme;
