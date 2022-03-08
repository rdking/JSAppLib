import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";

export default class TreeLeaf extends ListItem {
    static #tagName = "js-treeleaf";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return ListItem.observedAttributes.concat(["collapsible"]); 
    }

    #value = "";
    #prot = share(this, TreeLeaf, {
        getTemplate() {
            let template = this.TreeView.querySelector("template");
            return this.pvt.#prot.newTag("span", {
                style: "display:flex;flex-flow:row nowrap;align-items:center;"
            }, {
                innerHTML: this.pvt.#prot.newTag("span", {
                    style: "width:1.5em;text-align:center;font-weight:bold;font-family:monospace;"
                }, {
                    innerHTML: (this.slot == "caption") ? this.isOpen ? "&#x229f;" : "&#x229e;" : "&#x2501;"
                }).outerHTML + template.innerHTML
            }).outerHTML;
        },
        onPreRender() {
            this.pvt.#prot.validateParent(["js-treebranch", "js-treeview"],
                "TreeLeaf elements can only be placed in a TreeView or TreeBanch");
        }
    });

    get TreeView() {
        let retval = this.parentElement;
        if (retval.nodeName.toLowerCase() != "js-treeview") {
            retval = retval.TreeView;
        }
        return retval;
    }

    get isOpen() { return this.hasAttribute("isopen"); }
    set isOpen(v) { this.pvt.#prot.setBoolAttribute("isopen", v); }
}
