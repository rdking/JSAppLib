import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import AppLibError from "./errors/AppLibError.mjs";

export default class App extends Base {
    static #spvt= share(this, {});

    static {
        this.#spvt.register(this);
    }

    #pvt= share(this, App, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        }
    });
    
    #isReady = false;

    #addProperty(name) {
        if (name != this.id) {
            Object.defineProperty(this, name, {
                enumerable: true,
                configurable: true,
                get() { return document.getElementById(name); }
            });
        }
    }

    #removeProperty(name) {
        if (name in this) {
            delete this[name];
        }
    }

    getManager(mgrName) {
        const pvt = this.$.#pvt;
        const mgmt = document.querySelector(pvt.tagType("management"));
        let retval;

        if (mgmt) {
            retval = mgmt.querySelector(pvt.tagTypes(mgrName)[0]);
        }

        return retval;
    }

    constructor() {
        super();

        if ("app" in window) {
            throw new AppLibError(`Only 1 App instance allowed per window.`);
        }

        Object.defineProperty(window, "app", {
            enumerable: true,
            configurable: false,
            writable: false,
            value: this
        });

        this.addEventListener("addComponent", this.$.#addProperty);
        this.addEventListener("removeComponent", this.$.#removeProperty);
        this.addEventListener("render", this.$.#pvt.render);
    }

    checkReadiness() {
        if (this.$.#isReady) {
            this.fireEvent("ready");
        }
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
        return this.getManager("actionManager");
    }

    get dialogManager() {
        return this.getManager("dialogManager");
    }

    get dataFormatManager() {
        return this.getManager("dataFormatManager");
    }
}
