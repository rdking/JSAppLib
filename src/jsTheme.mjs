import { share, final, saveSelf, accessor } from "../node_modules/cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ManageableBase from "./jsManageableBase.mjs";

const Theme = final(class Theme extends ManageableBase {
    static #spvt = share(this, {});

    static {
        saveSelf(this, "$");
        const spvt = this.$.#spvt;
        spvt.initAttributeProperties(this, {
            themename: { readonly: true, caption: "themeName" },
            themepath: { readonly: true, caption: "themePath" }
        });
        spvt.register(this);
    }

    #globalStyles = [];
    #colorStyles = [];
    #componentStyles = {};
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

                    this.$.#globalStyles = [];
                    this.$.#colorStyles = [];
                    this.$.#componentStyles = {};

                    let safety = 0;
                    do {
                        if (safety++ > 10) throw new Error("Theme inheritance depth exceeded");
                        const themeJsonUrl = new URL("theme.json", baseUrl.href);
                        let themeFile = await fetch(themeJsonUrl.href);
                        let info = JSON.parse(await themeFile.text());
                        components = info.components;
                        
                        if (components.inherits) {
                            stack.push([baseUrl, components]);
                            baseUrl = new URL(components.inherits, baseUrl.href);
                            if (!baseUrl.href.endsWith("/")) {
                                baseUrl = new URL(baseUrl.href + "/");
                            }
                        }
                    } while (components.inherits);

                    let prefix;
                    let innerSafety = 0;
                    do {
                        if (innerSafety++ > 10) throw new Error("Theme composition depth exceeded");
                        prefix = baseUrl.href;
                        let list = [];
                        list.push(components.global
                            ? fetch(prefix + components.global)
                            : new Promise((resolve) => { resolve({ text() { return ""; } }) }));
                        list.push(components.color
                            ? fetch(prefix + components.color)
                            : new Promise((resolve) => { resolve({ text() { return ""; } }) }));
                        
                        let cssResponses = await Promise.all(list);
                        const gsText = await cssResponses[0].text();
                        const csText = await cssResponses[1].text();

                        if (gsText) this.$.#globalStyles.push(gsText);
                        if (csText) this.$.#colorStyles.push(csText);
                        
                        if (Array.isArray(components.tags)) {
                            let sheets = await Promise.all(components.tags.map(name => fetch(prefix + name + ".css")));
                            sheets = await Promise.all(sheets.map(sheet => sheet.text()));

                            sheets.forEach((cssText, index) => {
                                let name = components.tags[index];
                                if (!this.$.#componentStyles[name]) {
                                    this.$.#componentStyles[name] = [];
                                }
                                this.$.#componentStyles[name].push(cssText);
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
                    
                    const styles = {
                        "global": [...this.$.#globalStyles, ...this.$.#colorStyles],
                        ...this.$.#componentStyles
                    };

                    this.$.#pvt.themeCache.registerTheme(this.themeName, styles);

                } finally {
                    this.$.#loading = false;
                }
            }
        }
        catch(e) {
            throw new AppLibError(`Failed to load theme "${this.themeName}"`, e);
        }
    }

    #pvt = share(this, Theme, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.tagType("thememanager"), "Themes can only be declared in a ThemeManager.");
        },
        onNameChange(e) {
            if (!this.$.#attributeChanging) {
                let {oldValue: oldVal, newValue: newVal} = e.detail;
                try {
                    this.$.#attributeChanging = true;
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
        },
        
        loaded: accessor({
            get() { return this.$.#loaded; }
        }),
        
        load: async (cb) => {
            if (!this.$.#loaded) {
                await this.$.#loadTheme();
            }
            if (cb) cb();
        }
    });

    constructor() {
        super();
        //saveSelf(this, "$");

        const pvt = this.#pvt;
        pvt.registerEvents(pvt, {
            themenameChanged: "onNameChange",
            themepathChanged: "onPathChange"
        });
    }

    get loaded() { 
        return this.$.#pvt.loaded; 
    }

    async load(cb) {
        return this.$.#pvt.load(cb);
    }
});

export default Theme;