import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import Theme from "/node_modules/jsapplib/src/theming/theme.mjs";
import App from "/node_modules/jsapplib/src/jsAppLib.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class ThemeManager extends TagBase {
    static #tagName = "js-thememanager";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this, true); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes; 
    }

    #owner = null;
    #themes = {};
    #currentTheme = null;
    #themeBase = null;
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
        this.fireEvent("ready", void 0, true);
    }

    async #init() {
        const path = this.getAttribute("themepath");
        //Load the default themes
        await this.loadThemes("/node_modules/jsapplib/src/themes");
        //Load the user-specified themes
        if (path && path.trim().length) {
            await this.loadThemes(path);
        }
        this.#ready = true;
        this.pvt.#setGlobalTheme();
    }

    #prot = share(this, ThemeManager, {
        render() {
            this.pvt.#prot.renderContent("<slot />");
        }
    });

    connectedCallback() {
        super.connectedCallback();
        this.pvt.#init();
    }

    get themeBase() { return this.pvt.#themeBase; }
    set themeBase(val) {
        this.pvt.#themeBase = val;
        this.pvt.#sendChangeNotice();
    }

    get theme() { return this.pvt.#currentTheme; }
    set theme(val) {
        this.pvt.#currentTheme = val;
        this.pvt.#sendChangeNotice();
    }

    async loadThemes(path) {
        try {
            let themeFile = await fetch(path + "/themes.json");
            let themeInfo = JSON.parse(await themeFile.text());
            for (let themeName in themeInfo) {
                themeInfo[themeName].root = path;
                this.pvt.#currentTheme = this.pvt.#currentTheme ?? themeName;
                this.pvt.#themes[themeName] = new Theme(this, themeInfo[themeName]);
            }
        }
        catch(e) {
            console.error(`Failed to load themes from "${path}"`, e);
        }
    }
    registerTag(tagName) {

    }

    getGlobalStyle() {
        return this.pvt.#themes[this.pvt.#currentTheme].globalLink;
    }
    
    getTagStyle(tagName) {
        return this.pvt.#themes[this.pvt.#currentTheme].componentLink(tagName);
    }

    get ready() { return this.#ready; }
}
