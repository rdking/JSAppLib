import { share, define } from "../node_modules/cfprotected/index.mjs";
import TreeLeaf from "./jsTreeLeaf.mjs";
import Semaphore from "./util/Semaphore.mjs";
import CSS from "./util/Selectors.mjs";

export default class TreeBranch extends TreeLeaf {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return TreeLeaf.observedAttributes.concat([
            "collapsible", "collapsed"
        ]); 
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        const [structure, skin] = super.getDefaultStyleSheet();
        return [
            [
                ...structure,
                [[CSS.HOST], {
                    display: "flex",
                    flexDirection: "column",
                    flexWrap: "nowrap",
                    justifyContent: "space-between"
                }],
                [[CSS.TAG("slot").ATTR("name", "=", "caption")], {
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "flex-start",
                    alignItems: "center"
                }],
                [[CSS.CLASS("listitem")], {
                    display: "flex",
                    flexFlow: "column nowrap",
                    alignItems: "flex-start"
                }],
                [[CSS.CLASS("items")], {
                    display: "flex",
                    flexFlow: "column nowrap",
                    justifyContent: "flex-start"
                }],
                [[CSS.CLASS("focusable")], {
                    overflow: "auto"
                }]
            ],
            [
                ...skin,
                [[CSS.HOST], {
                    color: "var(--pen-input)"
                }],
                [[CSS.TAG("slot").ATTR("name", "=", "caption")], {
                    backgroundColor: "transparent",
                    color: "var(--pen-input)"
                }],
                [[CSS.CLASS("listitem").CLASS("selected").CHILD(CSS.TAG("slot").ATTR("name", "=", "caption"))], {
                    backgroundColor: "var(--brush-selected)"
                }],
                [[CSS.HOST(CSS.ATTR("selected"))], {
                    backgroundColor: "var(--brush-input-normal)"
                }]           ]
        ];
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
            let content = pvt.make(pvt.tagType("collapsepanel"), {
                manual: true
            }, {
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

            return content;
        },
        getParentType() {
            const pvt = this.$.#pvt;
            return pvt.tagTypes(["treebranch", "treeview"]);
        },
        getParentMessage() {
            return "TreeBranch elements can only be placed in a TreeView or another TreeBranch";
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
                if ("fireEvent" in child) {
                    child.fireEvent("render");
                }

                if (pvt.isTagType(child, pvt.tagType("treeleaf")) && child.isCaption) {
                    child.slot = "caption";
                }
                else if (child.slot == "caption") {
                    child.removeAttribute("slot");
                }
            }
            pvt.getShadowChild("collapsepanel").addEventListener("collapsedChanged", pvt.onCollapsedChanged);
        },
        onSelectedChange(e) {
            this.$.#section.lock(() => {
                this.TreeView.fireEvent("selectedChange", e.detail);
            });
        },
        onCollapsedChanged(e) {
            this.$.#pvt.onUpdateMarker();
            this.fireEvent("collapsedChanged", e.detail);
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
