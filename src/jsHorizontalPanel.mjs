import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";let _rGid = Symbol();

export default class HorizontalPanel extends TagBase {
    static #tagName = "js-hpanel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status", "slotclass"]);
    }

    #onStatusChange(e) {
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
        onSlotClassChange(e) {
            let slot = this.shadowRoot.querySelector("slot");
            e.detail.newVal.split(" ").forEach(rule => {
                this.pvt.#prot.importRule(rule);
            });
            slot.class = e.detail.newVal;
        }
    });

    connectedCallback() {
        this.addEventListener("slotclassChange", this.pvt.#prot.onSlotClassChange);
        super.connectedCallback();
    }

    get slotClass() { return this.getAttribute("slotclass"); }
    set slotClass(v) { this.setAttribute("slotclass", v); }
}
