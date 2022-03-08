import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class ToolBar extends TagBase {
    static #tagName = "js-toolbar";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status"]);
    }

    #prot = share(this, ToolBar, {
        render() {
            let div = this.pvt.#prot.newTag("div", {class: "vr"});
            let slot = this.pvt.#prot.newTag("slot");
            this.pvt.#prot.renderContent([div, slot]);
        },
        onStatusChanged(e) {
            let status = this.shadowRoot.querySelector("span.status");
            if (status) {
                status.innerHTML = e.detail.newVal;
            }
        }
    });

    connectedCallback() {
        this.addEventListener("statusChanged", this.pvt.#prot.onStatusChanged);
        super.connectedCallback();
    }

}
