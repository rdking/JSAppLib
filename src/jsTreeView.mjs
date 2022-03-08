import ListView from "./jsListView.mjs";
import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class TreeView extends ListView {
    static #tagName = "js-treeview";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return ListView.observedAttributes.concat(["collapsible"]); 
    }

    #value = "";
    #prot = share(this, TreeView, {
        onPreRender() {
            this.pvt.#prot.validateChildren(["template","js-treebranch", "js-treeleaf"],
                "Only HTML <template>, TreeBranch, and TreeLeaf elements can be placed in a TreeView");
            
            let templates = this.querySelectorAll("template");
            if (templates.length != 1) {
                throw new ReferenceError(`Expected to find 1 template. Found ${templates.length}`);
            }
        }
    });
}
