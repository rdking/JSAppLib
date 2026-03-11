import { share, saveSelf } from "../node_modules/cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Container from "./jsContainer.mjs";
import SCSPanel from "./jsSCSPanel.mjs";
import CSS from "./util/Selectors.mjs";
//import ToolButton from "/node_modules/jsapplib/src/jsToolButton.mjs";

export default class ToolBar extends Container {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return Container.observedAttributes.concat(["displaymode", "edge", "moveable"]);
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
                        txOrigin: "0 0",
                        txRotate: "rotate(0deg)"
                    },
                    display: "flex",
                    flex: "0 0 auto",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    flexWrap: "nowrap",
                    padding: "0.25em 0.2em",
                    minHeight: "24px"
                }],
                [[CSS.HOST(CSS.ATTR("slot", CSS.EQUALS("first"))).HOST_CONTEXT(CSS.TAG("scspanel").ATTR("horizontal")),
                  CSS.HOST(CSS.ATTR("slot", CSS.EQUALS("last"))).HOST_CONTEXT(CSS.TAG("scspanel").ATTR("horizontal"))], {
                    DEFS: {
                        txOrigin: "50% 50%",
                        txRotate: "rotate(90deg)"
                    }
                }],
                [[CSS.CLASS("vr")], {
                    display: "inline-block",
                    margin: "0.2em 0.25em"
                }],
                [[CSS.CLASS("vr").CLASS("hidden")], {
                    display: "none"
                }],
                [[CSS.SLOTTED(CSS.UNIVERSAL)], {
                    display: "flex",
                    flex: "1 1 auto",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    transformOrigin: "var(--tx-origin)",
                    transform: "var(--tx-rotate)"
                }],
                [[CSS.SLOTTED(CSS.TAG("button"))], {
                    display: "flex",
                    flex: "1 1 24px",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingInline: "1px",
                    minWidth: "24px",
                    border: "none"
                }]
            ],
            [
                ...skin,
                [[CSS.HOST], {
                    border: "1px outset var(--brush-shadow)",
                    backgroundColor: "var(--brush-normal)",
                    color: "var(--pen-normal)"
                }],
                [[CSS.CLASS("vr")], {
                    border: "1px inset var(--brush-shadow)"
                }],
                [[CSS.SLOTTED(CSS.TAG("button"))], {
                    backgroundColor: "inherit"
                }],
                [[CSS.SLOTTED(CSS.TAG("button").HOVER)], {
                    backgroundColor: "var(--brush-selected)"
                }],
                [[CSS.SLOTTED(CSS.TAG("button").ACTIVE)], {
                    backgroundColor: "var(--brush-shadow)"
                }]
            ]
        ];
    }
    
    static {
        const spvt = this.#spvt;

        spvt.initAttributeProperties(this, {
            displaymode: {
                enum: ActionControlBase.ButtonModes
            },
            edge: {
                enum: SCSPanel.PanelPos
            },
            moveable: {
                isBool: true,
                caption: "moveable"
            }
        });
        spvt.register(this);
    }
    
    #pvt = share(this, ToolBar, {
        render() {
            const pvt = this.$.#pvt;
            
            pvt.renderContent([
                pvt.make("div", {
                    class: "vr hidden"
                }),
                pvt.make("slot")
            ]);

        },
        onDisplayModeChange(e) {
            let child = this.firstElementChild;

            while (child && ("fireEvent" in child)) {
                child.fireEvent("update");
                child = child.nextElementSibling;
            }
        },
        onEdgeChanged(e) {
            const ppos = SCSPanel.PanelPos;

            if (ppos(this.edge) == ppos.content) {
                this.removeAttribute("slot");
            } else {
                this.setAttribute("slot", ppos(this.edge).name);
            }
        },
        onMoveableChanged(e) {
            let element = this.$.#pvt.shadowRoot.querySelector(".vr");
            
            if (element) {
                element.classList[this.moveable ? "remove": "add"]("hidden");
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt

        pvt.registerEvents(pvt, {
            displaymodeChanged: "onDisplayModeChange",
            edgeChanged: "onEdgeChanged",
            moveableChanged: "onMoveableChanged"
        });
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.edge) {
            this.$.#pvt.onEdgeChanged();
        }
    }
}
