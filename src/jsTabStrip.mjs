import { share, saveSelf, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";
import CSS from "./util/Selectors.mjs";

export default class TabStrip extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat(["flip", "reverse"]);
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
                    DEFS: {
                        noTabBorderBottom: "1px solid var(--brush-overlay)",
                        noTabBorderTop: "unset"
                    },
                    display: "flex",
                    flex: "1 0 auto",
                    flexDirection: "row",
                    margin: "2px -1px -2px",
                    paddingTop: "2px",
                    paddingLeft: "2px",
                    overflow: "hidden"
                }],
                [[CSS.HOST(CSS.ATTR("flip"))], {
                    DEFS: {
                        noTabBorderBottom: "unset",
                        noTabBorderTop: "1px solid var(--brush-overlay)"
                    }
                }],
                [[CSS.HOST.CHILD(CSS.NTH_CHILD(1))], {
                    paddingLeft: "2px"
                }],
                [[CSS.CLASS("tabstrip")], {
                    display: "flex",
                    flex: "1 0 auto",
                    flexDirection: "row"
                }],
                [[CSS.HOST(CSS.ATTR("reverse")).DESCENDANT(CSS.CLASS("tabstrip"))], {
                    flexDirection: "row-reverse"
                }],
                [[CSS.CLASS("notab")], {
                    display: "flex",
                    flex: "1",
                    border: "none",
                    borderBottom: "var(--no-tab-border-bottom)",
                    borderTop: "var(--no-tab-border-top)"
                }]
            ],
            [
                ...skin,
                [[CSS.HOST], {
                    backgroundColor: "var(--brush-normal)"
                }]
            ]
        ];
    }

    static {
        saveSelf(this, "$");
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            flip: { isBool: true, caption: "flip" }, 
            reverse: { isBool: true, caption: "reverse" }
        });
        spvt.register(this);
    }

    #pvt= share(this, TabStrip, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent([
                pvt.make("div", {
                    class: "tabstrip"
                }, {
                    children: [
                        pvt.make("slot"),
                        pvt.make("div", {
                            class: "notab"
                        })
                    ]
                })
            ]);
        },
        onTabClicked(event) {
            if (this.$.#activeTab) {
                this.$.#activeTab.isSelected = false;
            }
            this.$.#activeTab = event.target;
            event.target.isSelected = true;
        },
        onPostRender() {
            const pvt = this.$.#pvt;

            pvt.validateChildren("tab", "TabStrip can only contain tabs!")

            for (let child of this.children) {
                child.addEventListener("click", pvt.onTabClicked);

                if (this.flip) {
                    child.flip = true;
                }

                if (!this.$.#activeTab) {
                    this.$.#activeTab = child;
                    child.isSelected = true;
                }
            }
        }
    });

    #activeTab = null;

    get activeTab() { return this.$.#activeTab; }
    set activeTab(v) {
        if (!(v instanceof HTMLElement) || 
            (v.tagName.toLowerCase() != this.$.#pvt.tagType("tab"))) {
            throw new TypeError("Invalid new value for TabStrip.activeTab.")
        }
        
        let oldVal = this.$.#activeTab;
        this.$.#activeTab = v;
        if (oldVal) {
            oldVal.isSelected = false;
        }
        v.isSelected = true;
        this.fireEvent("activeTabChanged", { oldVal, newVal: v })
    }

}