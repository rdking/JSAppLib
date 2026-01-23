import { share } from "../node_modules/cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ManagerBase from "./jsManagerBase.mjs";

export default class ThemeManager extends ManagerBase {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return ManagerBase.observedAttributes.concat([ "liblocation", "defaulttheme", "currenttheme" ]); 
    }
    
    static {
        this.#spvt.initAttributeProperties(this, {
            liblocation: { readonly: true },
            defaulttheme: { unbound: true },
            currenttheme: { unbound: true }
        });
        this.#spvt.register(this); 
    }

    #owner = null;
    #activeSheets = [];
    
    #sendChangeNotice() {
        let evnt = new Event("themeChange");
        this.fireEvent(evnt);
    }

    #setGlobalTheme() {
        const docSheets = [...document.adoptedStyleSheets];
        const newSheets = this.getGlobalStyle();

        document.adoptedStyleSheets = docSheets.filter(s => !this.#activeSheets.includes(s)).concat(newSheets);
        this.#activeSheets = newSheets;
        this.fireEvent("ready");
    }

    #loadThemes() {
        const loading = [];

        for (let theme of this.themes) {
            loading.push(theme.load());
        }

        Promise.all(loading).then(() => {
            this.$.#setGlobalTheme();
        });
    }
    
    #pvt = share(this, ThemeManager, {
    });

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        const pvt = this.$.#pvt;
        const themeType = pvt.tagType("theme");
        
        //Add the default theme if it doesn't exist
        if (!this.querySelector(`${themeType}[themename="default"]`)) {
            this.insertBefore(pvt.make(themeType, {
                themeName: "default",
                themePath: `${this.liblocation}/src/themes/default`
            }), this.firstElementChild);
        }

        this.$.#loadThemes();
    }

    get themes() {
        return this.querySelectorAll(this.$.#pvt.tagType("theme"));
    }

    get currentTheme() {
        let name = this.getAttribute("currenttheme") ||
            this.getAttribute("defaulttheme") || "default";
        return this.querySelector(`${this.$.#pvt.tagType("theme")}[themename="${name}"]`);
    }
    set currentTheme(v) {
        const name = (typeof(v) == "string") ? v : v.themeName;
        let theme = this.querySelector(`${this.$.#pvt.tagType("theme")}[themename="${name}"]`);
        if (!theme) {
            throw new AppLibError(`No theme "${name}" declared.`);
        }
        this.setAttribute("currenttheme", name);
    }

    get defaultTheme() {
        let name = this.getAttribute("defaulttheme") || "default";
        return this.querySelector(`${this.$.#pvt.tagType("theme")}[themename="${name}"]`);
    }
    set defaultTheme(v) {
        const name = (typeof(v) == "string") ? v : v.themeName;
        let theme = this.querySelector(`${this.$.#pvt.tagType("theme")}[themename="${name}"]`);
        if (!theme) {
            throw new AppLibError(`No theme "${name}" declared.`);
        }
        this.setAttribute("defaulttheme", name);
    }

    getGlobalStyle() {
        return this.currentTheme.globalLink;
    }
    
    getTagStyle(tag, shadow) {
        return this.currentTheme.componentLink(tag, shadow);
    }
}
