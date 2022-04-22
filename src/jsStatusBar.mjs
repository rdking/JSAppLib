import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class StatusBar extends TagBase {
    static #tagName = "js-statusbar";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status"]);
    }

    
    #prot = share(this, StatusBar, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent([
                prot.newTag("span", {
                    class: "status"
                }, {
                    innerHTML: this.status
                }),
                prot.newTag("slot")
            ]);
        },
        onStatusChanged(e) {
            let status = this.shadowRoot.querySelector("span.status");
            if (status) {
                status.innerHTML = e.detail.newVal;
            }
        }
    });

    constructor() {
        super();
        if (this.cla$$.prototype === Object.getPrototypeOf(this)) {
            this.slot = "footer";
        }
    }

    connectedCallback() {
        this.addEventListener("statusChanged", this.pvt.#prot.onStatusChanged);
        super.connectedCallback();
    }

    get status() { return this.getAttribute("status"); }
    set status(v) { this.setAttribute("status", v); }
}
