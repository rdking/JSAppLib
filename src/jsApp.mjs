import { share } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import AppLibError from "./errors/AppLibError.mjs";

export default class App extends Base {
    static #spvt= share(this, {});

    static {
        this.#spvt.register(this);
    }
    
    static ready() {
        this.$.#spvt.registerElements();
    }

    #pvt= share(this, App, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {}, {
                children: [
                    pvt.make("div", { id: "overlay" }),
                    pvt.make("slot")
                ]
            }));
        },
        onThemeManagerReady() {
            const waitbox = this.$.#pvt.waitbox;
            if (!waitbox.ready) {
                waitbox.trigger();
            }
        }
    });
    
    #components = {};

    get components() {
        return this.#components;
    }

    #addProperty(e) {
        const name = e.detail;
        if (name && (name != this.id)) {
            Object.defineProperty(this.#components, name, {
                enumerable: true,
                configurable: true,
                get() { return document.getElementById(name); }
            });
        }
    }

    #removeProperty(e) {
        const name = e.detail;
        if (name in this.#components) {
            delete this.#components[name];
        }
    }

    constructor() {
        super();

        if ("JSAppLib" in window) {
            if ("app" in JSAppLib) {
                throw new AppLibError(`Only 1 App instance allowed per window.`);
            }
        }
        else {
            Object.defineProperty(window, "JSAppLib", {
                enumerable: false,
                configurable: false,
                writable: false,
                value: {}
            });
        }

        Object.defineProperty(JSAppLib, "app", {
            enumerable: true,
            configurable: false,
            writable: false,
            value: this
        });

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            addComponent: this.$.#addProperty,
            removeComponent: this.$.#removeProperty
        });

        if (this.themeManager) {
            this.themeManager.addEventListener("ready", pvt.onThemeManagerReady, { once: true });
        }
    }
 
    getManager(mgrName) {
        const pvt = this.$.#pvt;
        const mgmt = document.querySelector(pvt.tagType("management"));
        let retval;

        if (mgmt) {
            retval = mgmt.querySelector(pvt.tagType(mgrName));
        }

        return retval;
    }

    get menu() {
        return this.querySelector(this.$.#pvt.tagType("menu"));
    }

    get statusBar() {
        return this.querySelector(this.$.#pvt.tagType("statusbar"));
    }

    get themeManager() {
        return this.getManager("thememanager");
    }

    get actionManager() {
        return this.getManager("actionmanager");
    }

    get dialogManager() {
        return this.getManager("dialogmanager");
    }

    get dataFormatManager() {
        return this.getManager("dataformatmanager");
    }

    get overlayShowing() {
        return this.$.#pvt.shadowRoot.querySelector("#overlay").classList.contains("visible");
    }

    showOverlay(ui) {
        let overlay = this.$.#pvt.shadowRoot.querySelector("#overlay");
        if (!this.overlayShowing) {
            overlay.classList.add("visible");
        }
        overlay.appendChild(ui);
    }

    hideOverlay(ui) {
        const overlay = this.$.#pvt.shadowRoot.querySelector("#overlay");
        overlay.removeChild(ui);
        if (overlay.children.length === 0) {
            overlay.classList.remove("visible");
        }
    }
}
