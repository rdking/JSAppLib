import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
// import Container from "./jsContainer.mjs";
import ControlBase from "./jsControlBase.mjs";

export default class Tab extends ControlBase {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([ "caption", "closeable", "disabled", "flip", "selected" ]);
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
                    class: `container ${this.flip ? "flip" : ""}`
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
        opPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.tagType("tabstrip"), "Tabs can only be used in tabstrips!");
        },
        onSelectedChanged(e) {
        },
        onDisabledChanged(e) {
            let { newValue: newVal } = e.detail;
            let container = this.$.#pvt.shadowRoot.getElementById("container");
            container.classList[!!newVal ? "add" : "remove"]("disabled");
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
