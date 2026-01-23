import { share, accessor } from "../node_modules/cfprotected/index.mjs";
import ListView from "./jsListView.mjs";

export default class TreeView extends ListView {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ListView.observedAttributes.concat(["collapsible"]); 
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            collapsible: { isBool: true, caption: "collapsible" }
        });
        this.#spvt.register(this); 
    }

    #value = "";
    #pvt = share(this, TreeView, {
        validItemTypes: accessor({
            get: () => this.$.#pvt.tagTypes(["treebranch", "treeleaf"])
        }),
        onPreRender() {
            const pvt = this.$.#pvt;
            let validItems = [ pvt.tagType("treebranch"), "template" ].concat(pvt.validItemTypes);
            pvt.validateChildren(validItems,
                "Only HTML <template>, TreeBranch, and TreeLeaf elements can be placed in a TreeView");
            
            let templates = this.querySelectorAll("template");
            if (templates.length != 1) {
                throw new ReferenceError(`Expected to find 1 template. Found ${templates.length}`);
            }
        },
        onKeyDown(e) {
            const pvt = this.$.#pvt;
            let items = this.items;
            let index = items.indexOf(pvt.lastItem);

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
                        pvt.$uper.onKeyDown(e);
                }
            }
        }
    });

    connectedCallback() {
        super.connectedCallback();
        console.log("Tree Connected...");
    }

    collapseRecursively() {
        const pvt = this.$.#pvt;
        Array.from(this.children)
            .filter(child => child.nodeName.toLowerCase() == pvt.tagType("treebranch"))
            .forEach(element => element.collapseRecursively());
    }

    expandRecursively() {
        const pvt = this.$.#pvt;
        Array.from(this.children)
            .filter(child => child.nodeName.toLowerCase() == pvt.tagType("treebranch"))
            .forEach(element => element.expandRecursively());
    }

    get nestLevel() {
        return 0;
    }

    getMarker(src) {
        return "&#x200B;";
    }
}
