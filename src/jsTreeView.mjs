import ListView from "./jsListView.mjs";
import { share, accessor } from "/node_modules/cfprotected/index.mjs";
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
        validItemTypes: accessor({
            get: () => [ /*"js-treebranch",*/ "js-treeleaf" ]
        }),
        onPreRender() {
            let validItems = [ "js-treebranch", "template" ].concat(this.pvt.#prot.validItemTypes);
            this.pvt.#prot.validateChildren(validItems,
                "Only HTML <template>, TreeBranch, and TreeLeaf elements can be placed in a TreeView");
            
            let templates = this.querySelectorAll("template");
            if (templates.length != 1) {
                throw new ReferenceError(`Expected to find 1 template. Found ${templates.length}`);
            }
        },
        onKeyDown(e) {
            let items = this.items;
            let index = items.indexOf(this.pvt.#prot.lastItem);

            if (index >= 0) {
                let item = items[index];
                switch(e.code) {
                    case "ArrowLeft":
                        if (item.isCaption && ("collapsed" in item.parentElement)) {
                            item.parentElement.collapsed = true;
                        }
                        break;
                    case "ArrowRight":
                        if (item.isCaption && ("collapsed" in item.parentElement)) {
                            item.parentElement.collapsed = false;
                        }
                        break;
                    default:
                        this.pvt.#prot.$uper.onKeyDown(e);
                }
            }
        }
    });

    collapseRecursively() {
        this.querySelectorAll("js-treebranch").forEach(element => element.collapseRecursively());
    }

    expandRecursively() {
        this.querySelectorAll("js-treebranch").forEach(element => element.expandRecursively());
    }
}
