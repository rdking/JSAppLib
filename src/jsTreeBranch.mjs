import { share, define } from "../node_modules/cfprotected/index.mjs";
import TreeLeaf from "./jsTreeLeaf.mjs";
import Semaphore from "./util/Semaphore.mjs";

export default class TreeBranch extends TreeLeaf {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return TreeLeaf.observedAttributes.concat([
            "collapsible", "collapsed"
        ]); 
    }

    static {
        define(this, {
            depth: {
                get() {
                    return (this.parentElement?.depth || 0) + 1;
                }
            }
        });
        this.#spvt.initAttributeProperties(this, {
            collapsed: {
                isBool: true,
                caption: "collapsed",
                getter: function() {
                    const pvt = this.$.#pvt;
                    const cpanel = pvt.getShadowChild("collapsepanel");
                    return cpanel?.hasAttribute("collapsed") ;
                },
                setter: function(v) {
                    const pvt = this.$.#pvt;
                    const cpanel = pvt.getShadowChild("collapsepanel");
                    const caption = pvt.getChild("treeleaf", "[iscaption]")
                    cpanel[`${!!v? "set": "remove"}Attribute`]("collapsed", "");
                    caption.fireEvent("updateMarker");
                }
            },
            collapsible: { isBool: true, caption: "collapsible" }
        });
        this.#spvt.register(this);
    }

    #section = new Semaphore();
    #lastItem = null;
    #currentItem = null;
    #shiftDown = false;
    #ctrlDown = false;
    #value = "";

    #pvt = share(this, TreeBranch, {
        getTemplate() {
            let pvt = this.$.#pvt;
            let content = pvt.make(pvt.tagType("collapsepanel"), {}, {
                children: [
                    pvt.make("slot", {
                        name: "caption",
                        slot:"header"
                    }),
                    pvt.make("div", {
                        class: "itembox"
                    }, {
                        children: [
                            pvt.make("slot", {class: "items"})
                        ]
                    })
                ]
            });

            content.addEventListener("headerClicked", pvt.onHeaderClicked);
            return content;
        },
        getParentType() {
            const pvt = this.$.#pvt;
            return pvt.tagTypes(["treebranch", "treeview"]);
        },
        getParentMessage() {
            return "TreeBranch elements can only be placed in a TreeView or another TreeBranch";
        },
        onHeaderClicked(e) {
            e.detail.canToggleCollapse = false;
            e.cancelbubble = true;
        },
        onClick(e) {
            e.cancelBubble = true;
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.$uper.onPreRender();
            pvt.validateChildren(
                pvt.tagTypes(["treebranch", "treeleaf"]),
                "Only TreeBranch and TreeLeaf elements can be placed in a TreeView");
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            for (let child of this.children) {
                child.fireEvent("render");

                if (pvt.isTagType(child, "treeleaf") && child.isCaption) {
                    child.slot = "caption";
                }
                else if (child.slot == "caption") {
                    child.removeAttribute("slot");
                }
            }

        },
        onSelectedChange(e) {
            this.$.#section.lock(() => {
                this.TreeView.fireEvent("selectedChange", e.detail);
            });
        },
        onCollapsedChanged(e) {
            this.$.#pvt.onUpdateMarker();
        },
        onCollapsibleChanged(e) {
            if (!this.collapsible) {
                if (this.isRendered)
                    this.collapsed = false;
                else
                    this.removeAttribute("collapsed");
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            collapsedChanged: "onCollapsedChanged",
            collapsibleChanged: "onCollapsibleChanged"
        });
    }

    connectedCallback() {
        super.connectedCallback();

        for (let child of this.children) {
            if ("fireEvent" in child) {
                child.fireEvent("refresh");
            }
        }
    }

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
