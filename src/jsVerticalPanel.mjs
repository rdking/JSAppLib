import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";let _rGid = Symbol();

export default class VerticalPanel extends TagBase {
    static #tagName = "js-vpanel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status", "slotclass"]);
    }

    #onStatusChanged(e) {
        let status = this.shadowRoot.querySelector("span.status");
        if (status) {
            status.innerHTML = e.detail.newVal;
        }
    }    

    #prot = share(this, TagBase, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onSlotClassChanged(e) {
            let slot = this.shadowRoot.querySelector("slot");
            e.detail.newVal.split(" ").forEach(rule => {
                this.pvt.#prot.importRule(rule);
            });
            slot.className = e.detail.newVal;
        }
    });

    connectedCallback() {
        this.addEventListener("slotclassChanged", this.pvt.#prot.onSlotClassChanged);
        super.connectedCallback();
    }

    get slotClass() { return this.getAttribute("slotclass"); }
    set slotClass(v) { this.setAttribute("slotclass", v); }
}
