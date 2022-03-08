import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";let _rGid = Symbol();

export default class Panel extends TagBase {
    static #tagName = "js-panel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status"]);
    }

    #onStatusChanged(e) {
        let status = this.shadowRoot.querySelector("span.status");
        if (status) {
            status.innerHTML = e.detail.newVal;
        }
    }    

    #prot = share(this, TagBase, {
        render() {
            this.pvt.#prot.renderContent(document.createElement("slot"));
        }
    });
}
