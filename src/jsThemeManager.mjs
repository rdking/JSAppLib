import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import App from "/node_modules/jsapplib/src/jsAppLib.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class ThemeManager extends TagBase {
    static #tagName = "js-thememanager";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat([
            "defaulttheme", "currenttheme"
        ]); 
    }
    static get isManagement() {return true};

    #owner = null;
    #themes = {};
    #themeWait = 0;
    #ready = false;
    
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
    
    #prot = share(this, ThemeManager, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onPreRender() {
        },
        onThemeLoaded() {
            --this.pvt.#themeWait;
            if (!this.pvt.#themeWait) {
                this.#ready = true;
                this.pvt.#setGlobalTheme();
            }
        }
    });

    constructor() {
        super();

        const prot = this.pvt.#prot;
        this.insertBefore(prot.newTag("js-theme", {
            name: "default",
            path: "node_modules/jsapplib/src/themes/default"
        }), this.firstElementChild);

        for (let child of this.children) {
            child.addEventListener("loaded", this.pvt.#prot.onThemeLoaded);
            ++this.pvt.#themeWait;
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    get currentTheme() {
        let name = this.getAttribute("currenttheme") ||
            this.getAttribute("defaultTheme") || "default";
        return this.querySelector(`js-theme[name=${name}]`);
    }
    set currentTheme(v) {
        this.setAttribute("currenttheme", (typeof(v) == "string") ? v : v.name);
    }

    get defaultTheme() {
        let name = this.getAttribute("defaulttheme") || "default";
        return this.querySelector(`js-theme[name=${name}]`);
    }
    set defaultTheme(v) {
        this.setAttribute("defaulttheme", (typeof(v) == "string") ? v : v.name);
    }

    getGlobalStyle() {
        return this.currentTheme.globalLink;
    }
    
    getTagStyle(tagName) {
        return this.currentTheme.componentLink(tagName);
    }

    get ready() { return this.#ready; }
}
