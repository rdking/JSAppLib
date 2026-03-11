import { share, saveSelf, accessor } from "../node_modules/cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ManagerBase from "./jsManagerBase.mjs";

export default class ThemeManager extends ManagerBase {
    static #spvt = share(this, {});

    static {
        saveSelf(this, "$");
        this.#spvt.initAttributeProperties(this, {
            liblocation: { readonly: true },
            defaulttheme: { unbound: true },
            currenttheme: { unbound: true }
        });
        this.#spvt.register(this); 
    }

    static get observedAttributes() {
        return ManagerBase.observedAttributes.concat([ "liblocation", "defaulttheme", "currenttheme" ]); 
    }

    #activeSheets = [];

    #pvt = share(this, ThemeManager, {});

    constructor() {
        super();
        saveSelf(this, "$");
    }

    connectedCallback() {
        super.connectedCallback();

        const pvt = this.$.#pvt;
        const themeType = pvt.tagType("theme");
        
        // Add the default theme if it doesn't exist
        // if (!this.querySelector(`${themeType}[themename="default"]`)) {
        //     const defaultTheme = pvt.make(themeType, {
        //         themeName: "default",
        //         themePath: `${this.liblocation}/src/themes/default`
        //     });
        //     this.insertBefore(defaultTheme, this.firstElementChild);
        // }

        // Trigger load on all themes
        const loading = [];
        for (let theme of this.themes) {
            if (theme.load) {
                loading.push(theme.load());
            }
        }

        Promise.all(loading).then(() => {
            this.fireEvent("ready");
        });
    }

    get themes() {
        return this.querySelectorAll(this.$.#pvt.tagType("theme"));
    }

    get currentTheme() {
        let name = this.getAttribute("currenttheme") ||
            this.getAttribute("defaulttheme") || "default";
        return { themeName: name };
    }
    set currentTheme(v) {
        const name = (typeof(v) == "string") ? v : v.themeName;
        this.setAttribute("currenttheme", name);
        this.$.#pvt.themeCache.applyTheme(name);
    }

    get defaultTheme() {
        let name = this.getAttribute("defaulttheme") || "default";
        return { themeName: name };
    }
    set defaultTheme(v) {
        const name = (typeof(v) == "string") ? v : v.themeName;
        this.setAttribute("defaulttheme", name);
    }
}
