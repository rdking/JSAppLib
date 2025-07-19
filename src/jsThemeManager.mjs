import { share } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import WaitBox from "./util/WaitBox.mjs";

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
    #themeWait = 0;
    #waitbox = new WaitBox();
    
    #sendChangeNotice() {
        let evnt = new Event("themeChange");
        this.fireEvent(evnt);
    }

    #setGlobalTheme() {
        let oldTheme = document.querySelector("#theme");
        if (oldTheme) {
            document.removeChild(oldTheme);
        }
        let div = document.createElement("div");
        div.innerHTML = this.getGlobalStyle();
        let head = document.querySelector("head");
        let child = div.firstElementChild;
        head.appendChild(child);
        this.fireEvent("ready");
    }
    
    #pvt= share(this, ThemeManager, {
        render() {
            // const pvt = this.$.#pvt;
            // pvt.renderContent(pvt.make("slot"));
        },
        onPreRender() {
        },
        onThemeLoaded() {
            if (this.$.#themeWait > 0) {
                --this.$.#themeWait;

                if (!this.$.#themeWait) {
                    app.fireEvent("render");
                    this.$.#waitbox.trigger();
                }
            }
        },
        wait(e) {
            let {tag, method, params} = e.detail;
            this.$.#waitbox.add(tag, method, params);
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        const themeType = pvt.tagType("theme");

        //Add the default theme
        this.insertBefore(pvt.make(themeType, {
            themeName: "default",
            themePath: `${this.liblocation}/src/themes/default`
        }), this.firstElementChild);

        //Count up the themes
        for (let child of this.children) {
            if (child.nodeName.toLowerCase() == themeType) {
                child.addEventListener("loaded", pvt.onThemeLoaded);
                ++this.$.#themeWait;
            }
        };

        pvt.registerEvents({
            wait: pvt.wait
        });
    }

    connectedCallback() {
        super.connectedCallback();
    }

    get themes() {
        return this.querySelectorAll(this.$.#pvt.tagType("theme"));
    }

    get currentTheme() {
        let name = this.getAttribute("currenttheme") ||
            this.getAttribute("defaultTheme") || "default";
        return this.querySelector(`${this.$.#pvt.tagTypes("theme")}[themename=${name}]`);
    }
    set currentTheme(v) {
        let theme = this.querySelector(`${this.$.#pvt.tagTypes("theme")}[themename=${v}]`);
        if (!theme) {
            throw new AppLibError(`No theme "${v}" declared.`);
        }
        this.setAttribute("currenttheme", (typeof(v) == "string") ? v : v.themeName);
    }

    get defaultTheme() {
        let name = this.getAttribute("defaulttheme") || "default";
        return this.querySelector(`${this.$.#pvt("theme")}[themename=${name}]`);
    }
    set defaultTheme(v) {
        let theme = this.querySelector(`${this.$.#pvt.tagTypes("theme")}[themename=${v}]`);
        if (!theme) {
            throw new AppLibError(`No theme "${v}" declared.`);
        }
        this.setAttribute("defaulttheme", (typeof(v) == "string") ? v : v.themeName);
    }

    getGlobalStyle() {
        return this.currentTheme.globalLink;
    }
    
    getTagStyle(tag, shadow) {
        return this.currentTheme.componentLink(tag, shadow);
    }

    get ready() {
        //Are there any themes at all?
        let ready = this.themes.length > 0;

        if (ready) {
            ready &= (this.$.#themeWait === 0);
        }

        return ready;
    }
}
