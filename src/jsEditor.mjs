import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class Editor extends TagBase {
    static #tagName = "js-editor";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["text"]); 
    }

    #value = "";
    #prot = share(this, Editor, {
        render() {
            let content = window.document.createElement("input");
            content.name = this.getAttribute("name");
            content.value = this.pvt.#value;
            this.pvt.#prot.renderContent(content);
        }
    });
}
