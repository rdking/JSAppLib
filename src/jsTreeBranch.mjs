import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";
import Semaphore from "/node_modules/jsapplib/src/util/Semaphore.mjs";

export default class TreeBranch extends ListItem {
    static #tagName = "js-treebranch";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return ListItem.observedAttributes.concat(["collapsible"]); 
    }

    #section = new Semaphore();
    #lastItem = null;
    #currentItem = null;
    #shiftDown = false;
    #ctrlDown = false;
    #value = "";

    #prot = share(this, TreeBranch, {
        getTemplate() {
            let prot = this.pvt.#prot;
            let content = prot.newTag("js-collapsepanel");
            let caption = prot.newTag("slot", {
                name: "caption",
                slot:"header"
            });
            let body = prot.newTag("div", {class: "itembox"});
            let items = prot.newTag("slot", {class: "items"});
            content.appendChild(caption);
            content.appendChild(body);
            body.appendChild(items);

            //content.addEventListener("headerClicked", this.pvt.#prot.onHeaderClicked);
            content.addEventListener("click", this.pvt.#prot.onHeaderClicked);
            return content.outerHTML;
        },
        onHeaderClicked(e) {
            e.details.canToggleCollapse = false;
        },
        onPreRender() {
            this.pvt.#prot.validateChildren(["js-treebranch", "js-treeleaf"],
                "Only TreeBranch and TreeLeaf elements can be placed in a TreeView");
            this.pvt.#prot.validateParent(["js-treebranch", "js-treeview"],
            "TreeBranch elements can only be placed in a TreeView or TreeBanch");
        },
        onSelectedChanged(e) {
            let prevItem = this.pvt.#lastItem;
            let items = [...this.children];

            this.pvt.#section.lock(() => {
                for (let item of items) {
                    if (item.slot != "caption") {
                        item.selected = (this.selected ? this : item).selected;
                    }
                }
                this.pvt.#prot.$uper.onSelectedChanged(e);
            });
            this.pvt.#lastItem = this;

            this.TreeView.fireEvent("selectedChanged", e);
        }
    });

    get TreeView() {
        let retval = this.parentElement;
        if (retval.nodeName.toLowerCase() != "js-treeview") {
            retval = retval.TreeView;
        }
        return retval;
    }
}
