import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import Theme from "/node_modules/jsapplib/src/theming/theme.mjs";
import EventHandler from "/node_modules/jsapplib/src/util/EventHandler.mjs";

export default class ThemeManager extends EventHandler {
    #owner = null;
    #themes = {};
    #currentTheme = null;
    #themeBase = null;
    
    #sendChangeNotice() {
        let evnt = new Event("themeChanged");
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
        //head.appendChild(child.nextElementSibling);
    }

    constructor(owner) {
        super();
        saveSelf(this, "pvt", new.target)

        this.loadThemes("/node_modules/jsapplib/src/themes");
        this.addEventListenerOnce("ready", this.pvt.#setGlobalTheme);
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
            this.fireEvent("ready");
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
}
