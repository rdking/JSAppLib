import { share, saveSelf, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
// import Container from "./jsContainer.mjs";
import ControlBase from "./jsControlBase.mjs";
import CSS from "./util/Selectors.mjs";

export default class Tab extends ControlBase {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([ "caption", "closeable", "disabled", "flip", "selected" ]);
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        const [structure, skin] = super.getDefaultStyleSheet();
        return [
            [
                ...structure,
                [[CSS.CLASS("container")], {
                    DEFS: {
                        tabLabelMargin: "0px -2px -0.75em",
                        tabLabelAlignItems: "inherit",
                        tabTrimPosition: "inherit",
                        tabTrimTop: "unset"
                    },
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 0 auto"
                }],
                [[CSS.CLASS("container").CLASS("flip")], {
                    DEFS: {
                        tabLabelMargin: "-0.75em -2px 0px",
                        tabLabelAlignItems: "center",
                        tabTrimPosition: "relative",
                        tabTrimTop: "-0.95em"
                    },
                    flexDirection: "column-reverse"
                }],
                [[CSS.CLASS("tab")], {
                    display: "flex",
                    flexDirection: "column"
                }],
                [[CSS.CLASS("tabTrim")], {
                    position: "var(--tab-trim-position)",
                    top: "var(--tab-trim-top)",
                    display: "flex",
                    height: "0.75em",
                    width: "calc(100% + 4px)",
                    padding: "0px",
                    margin: "2px -2px -0.75em",
                    borderTop: "1px solid var(--brush-overlay)",
                    borderBottom: "1px solid var(--brush-overlay)"
                }],
                [[CSS.CLASS("tabLabel")], {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "var(--tab-label-align-items)",
                    height: "2em",
                    margin: "var(--tab-label-margin)",
                    padding: "4px 0.75em 0px !important",
                    border: "1px solid var(--brush-overlay)",
                    borderRadius: "8px",
                    fontSize: "small"
                }],
                [[CSS.HOST(CSS.ATTR("selected")).DESCENDANT(CSS.CLASS("tabLabel"))], {
                    zIndex: "1"
                }],
                [[CSS.CLASS("tabLabel").DESCENDANT(CSS.CLASS("closeBtn"))], {
                    width: "1em",
                    marginTop: "-4px",
                    marginRight: "-8px",
                    paddingLeft: "8px",
                    fontSize: "large"
                }],
                [[CSS.CLASS("hidden")], {
                    display: "none"
                }]
            ],
            [
                ...skin,
                [[CSS.CLASS("tab")], {
                    backgroundColor: "var(--brush-normal)",
                    color: "var(--pen-normal)"
                }],
                [[CSS.CLASS("tabTrim")], {
                    backgroundColor: "var(--brush-normal)"
                }],
                [[CSS.CLASS("tabLabel")], {
                    backgroundColor: "var(--brush-shadow)"
                }],
                [[CSS.HOST(CSS.ATTR("selected")).DESCENDANT(CSS.CLASS("tabLabel"))], {
                    backgroundColor: "var(--brush-container-normal)",
                    color: "var(--pen-container-normal)"
                }],
                [[CSS.HOST(CSS.ATTR("disabled"))], {
                    filter: "opacity(33%)"
                }]
            ]
        ];
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            caption: {},
            selected: { isBool: true },
            disabled: { isBool: true },
            closeable: { isBool: true },
            flip: {
                readonly: true,
                isBool: true,
                caption: "flip",
                getter() { 
                    return (this.hasAttribute("flip") &&
                        !["no", "false", "0"].includes(this.getAttribute("flip").toLowerCase().trim())) ||
                        this.parentElement.flip;
                }
            }
        });
        spvt.register(this);
    }

    #pvt= share(this, Tab, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make("div", {
                    class: "container"
                }, {
                    children: [
                        pvt.make("div", {
                            class: "tab"
                        }, {
                            children: [
                                pvt.make("label", {
                                    class: "tabLabel"
                                }, {
                                    innerHTML: this.caption || null
                                }),
                                pvt.make("slot", {
                                    name: "closeButton",
                                    class: "hidden"
                                })
                            ]
                        }),
                        pvt.make("div", {
                            class: "tabTrim"
                        })
                    ]
                })
            ]);
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.tagType("tabstrip"), "Tabs can only be used in tabstrips!");
            if (this.flip) {
                const div = pvt.getShadowChild("div", ".container");
                div.classList.add("flip");
            }
        },
        onSelectedChanged(e) {
        },
        onDisabledChanged(e) {
            // Disabled styling handled via :host([disabled]) in skin
        },
        onCloseableChanged(e) {
            let closeButton = this.$.#pvt.shadowRoot.querySelector("slot");
            if (closeButton) {
                closeButton.classList[this.closeable?"remove":"add"]("hidden");
            }
        },
        onCaptionChanged(e) {
            let label = this.$.#pvt.shadowRoot.querySelector("label");
            if (label) {
                label.innerHTML = this.caption;
            }
        },
        onFlipChanged(e) {
            const div = this.$.#pvt.getShadowChild("div", ".container");
            div.classList[this.flip ? "add" : "remove"]("flip");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            flipChanged: "onFlipChanged",
            selectedChanged: "onSelectedChanged",
            disabledChanged: "onDisabledChanged",
            closeableChanged: "onCloseableChanged",
            captionChanged: "onCaptionChanged"
        });
    }
}
