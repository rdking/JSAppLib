import DataTranslator from "./util/DataTranslator.mjs";
import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import ThemeManager from "/node_modules/jsapplib/src/theming/themeManager.mjs"

/**
 * @class App
 * Declares the container for jsAppLib controls, providing core support for
 * theming and data binding.
 */
export default class App extends TagBase {
    static #tagName = "js-app";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["data_bind_base", "main", "debug", "style", "classList"]);
    }
    static init(tm) { this.pvt.#sprot.initTags(tm); }

        // render: () => {
        //     let shadow = this.shadowRoot;
        //     let appArea = document.createElement("div");
        //     let content = document.createElement("slot");
        //     appArea.appendChild(content);
        //     appArea.classList.add("js_app");
        //     shadow.appendChild(appArea);
        //     // shadow.mode = "closed";
        // }
    
    #started = false;
    #debug = false;
    #main = void 0;

    #loadDataBindings(newDataBindBase) {
        this.setAttribute(dataBindBase, newDataBindBase);
        this.fireEvent("dataBindChanged");
    }

    #launch(mainFn) {
        if (this.pvt.#main !== mainFn) {
            window.removeEventListener("load", this.pvt.#main);
            this.pvt.#main = mainFn;
            window.addEventListener("load", this.pvt.#main);
        }
    }

    #prot = share(this, App, {
        render() {
            let content = this.pvt.#prot.newTag("div", {id: "app"});
            let center = this.pvt.#prot.newTag("div", {class: "appCenter"});
            this.pvt.#prot.newTag("slot", {class: "hbar", name: "header"}, {parent: content});
            this.pvt.#prot.newTag("slot", {class: "hbar", name: "toolbarTop"}, {parent: content});
            content.appendChild(center);
            this.pvt.#prot.newTag("slot", {class: "vbar", name: "toolbarLeft"}, {parent: center});
            this.pvt.#prot.newTag("slot", {class: "content"}, {parent: center});
            this.pvt.#prot.newTag("slot", {class: "vbar", name: "toolbarRight"}, {parent: center});
            this.pvt.#prot.newTag("slot", {class: "hbar", name: "toolbarBottom"}, {parent: content});
            this.pvt.#prot.newTag("slot", {class: "hbar", name: "footer"}, {parent: content});
            this.pvt.#prot.renderContent(content);
        },
        onWindowResized(e) {
            this.fireEvent("parentResized");
        }
    });

    constructor() {
        if (window.app) { //The Highlander rule
            alert("Error: A window can only have 1 <js-app> tag.");
            throw new ReferenceError("An application container already exists in this window.");
        }
        super();
        Object.defineProperties(globalThis, {
            app: { 
                enumerable: true,
                value: this
            }
        });
    }

    connectedCallback() {
        this.addEventListener("resized", this.pvt.#prot.onWindowResized);
        super.connectedCallback();
        this.cla$$.pvt.#sprot.runReadyEvents();
        this.fireEvent("ready");
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case "data_bind_base":
                this.fireEvent("dataBindChanged");
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }

    get themeBase() { return this.getAttribute("theme_base"); }
    set themeBase(val) {
        this.setAttribute("theme_base", val);
        this.fireEvent("themeChanged");
    }

    get dataBindBase() { return this.getAttribute("data_bind_base"); }
    set dataBindBase(val) {
        this.pvt.#loadDataBindings(val);
    }

    get main() { return this.pvt.#main; }
    set main(val) {
        if ((val !== null) && (typeof(val) !== "function")) {
            throw new TypeError("App.prototype.main can only be assigned a function or null");
        }
        this.pvt.#launch(val);
    }

    get menu() {
        return this.querySelector("js-menu");
    }
}
