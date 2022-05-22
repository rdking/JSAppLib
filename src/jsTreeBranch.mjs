import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";
import Semaphore from "/node_modules/jsapplib/src/util/Semaphore.mjs";

export default class TreeBranch extends ListItem {
    static #tagName = "js-treebranch";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return ListItem.observedAttributes.concat(["collapsible", "collapsed"]); 
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
            let content = prot.newTag("js-collapsepanel", null, {
                children: [
                    prot.newTag("slot", {
                        name: "caption",
                        slot:"header"
                    }),
                    prot.newTag("div", {class: "itembox"}, {
                        children: [
                            prot.newTag("slot", {class: "items"})
                        ]
                    })
                ]
            });

            content.addEventListener("headerClicked", this.pvt.#prot.onHeaderClicked);
            return content;
        },
        onHeaderClicked(e) {
            e.detail.canToggleCollapse = false;
            e.cancelbubble = true;
        },
        onClick(e) {
            e.cancelBubble = true;
        },
        onPreRender() {
            this.pvt.#prot.validateChildren(["js-treebranch", "js-treeleaf"],
                "Only TreeBranch and TreeLeaf elements can be placed in a TreeView");
            this.pvt.#prot.validateParent(["js-treebranch", "js-treeview"],
            "TreeBranch elements can only be placed in a TreeView or TreeBanch");
        },
        onSelectedChange(e) {
            this.pvt.#section.lock(() => {
                this.TreeView.fireEvent("selectedChange", e.detail);
            });
        },
        onCollapsedChange(e) {
            let panel = this.shadowRoot.querySelector("js-collapsepanel");
            if (panel) {
                panel.collapsed = this.collapsed
                this.pvt.#prot.onUpdateMarker();
            }
        },
        onCollapsibleChange(e) {
            if (!this.collapsible) {
                this.setBoolAttribute("collapsed", false);
            }
        },
        onUpdateMarker() {
            let leaf = Array.from(this.children).filter(child => child.slot == "caption")[0];
            if (leaf) {
                leaf.fireEvent("updateMarker");
            }
        }
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("collapsedChange", prot.onCollapsedChange);
        this.addEventListener("collapsibleChange", prot.onCollapsibleChange);
        this.addEventListener("updateMarker", prot.onUpdateMarker);
        super.connectedCallback();
    }

    get TreeView() {
        let retval = this.parentElement;
        if (retval.nodeName.toLowerCase() != "js-treeview") {
            retval = retval.TreeView;
        }
        return retval;
    }

    get collapsed() { return this.hasAttribute("collapsed"); }
    set collapsed(v) { this.pvt.#prot.setBoolAttribute("collapsed", this.collapsible && v); }

    get collapsible() { return this.hasAttribute("collapsible"); }
    set collapsible(v) { this.pvt.#prot.setBoolAttribute("collapsible", v); }

    collapseRecursively() {
        if (this.collapsible) {
            this.querySelectorAll("js-treebranch").forEach(element => element.collapseRecursively());
            this.collapsed = true;
        }
    }

    expandRecursively() {
        if (this.collapsible) {
            this.querySelectorAll("js-treebranch").forEach(element => element.expandRecursively());
            this.collapsed = false;
        }
    }
}
