import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class ToolButton extends TagBase {
    static #tagName = "js-toolbutton";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status"]);
    }

    #prot = share(this, ToolButton, {
        render() {
            let button = this.pvt.#prot.newTag("button", {type: "button"});
            this.pvt.#prot.newTag("slot", null, {parent: button});
            this.pvt.#prot.renderContent(button);
        }
    });

}
