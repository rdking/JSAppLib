import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Enum from "./util/Enum.mjs";
import Container from "./jsContainer.mjs";

/**
 * Slot/Content/Slot Panel
 * This is an ordinary content panel with a slotheader and footer slot for placing
 * elements in the top and bottom regions of the panel.
 */
export default class SCSPanel extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat(["horizontal", "nofirst", "nolast"]);
    }
    
    static #panelPos = new Enum("PanelPos", [
        "first", "content", "last"
    ]);
    
    static get PanelPos() { return this.$.#panelPos; }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            horizontal: { isBool: true, caption: "horizontal" },
            nofirst: { isBool: true, caption: "nofirst" },
            nolast: { isBool: true, caption: "nolast" }
        });
        spvt.register(this);
    }

    #pvt= share(this, SCSPanel, {
        render() {
            const p = this.$.#pvt;

            p.renderContent([
                p.make("div", {
                    class: "container"
                }, {
                    children: [
                        p.make("slot", {
                            name: "first",
                            class: this.nofirst ? "gone" : ""
                        }),
                        p.make("div", {
                            class: "content"
                        }, {
                            children: [
                                p.make("slot")
                            ]
                        }),
                        p.make("slot", {
                            name: "last",
                            class: this.nolast ? "gone" : ""
                        })
                    ]
                })
            ]);

            let slots = p.getShadowChildren("slot");
            for (let slot of slots) {
                p.observeSize(slot);
            }
        },
        onResize(e) {
            let content = this.$.#pvt.getShadowChild("", "slot:not([name])");
            if (content) {
                let oHeight = e.target.offsetHeight;
                let mTop = e.target.computedStyleMap["margin-top"] || "0px";
                let mBottom = e.target.computedStyleMap["margin-bottom"] || "0px";
    
                if (e.target == content.previousElementSibling) {
                    content.style.bottom = `calc(${oHeight}px + ${mTop} + ${mBottom})`;
                }
                else if (e.target == content.nextElementSibling) {
                    content.style.top = `calc(${oHeight}px + ${mTop} + ${mBottom})`;
                }
            }
            this.$.#pvt.onHorizontalChanged();
        },
        parentResized(e) {
            const pvt = this.$.#pvt;
            const container = pvt.getShadowChild("", "div.container");
            if (container) {
                if (this.horizontal) {
                    container.style.width = e.detail.contentRect.height + "px";
                    container.style.height = e.detail.contentRect.width + "px";
                }
                else {
                    container.style.width = null;
                    container.style.height = null;
                }
            }
        },
        onNoFirstChanged() {
            const slots = this.$.#pvt.shadowRoot.querySelectorAll("slot");
            if (slots.length) {
                slots[0].classList[this.nofirst? "add": "remove"]("gone");
                slots[2].classList[this.nofirst? "add": "remove"]("gone");
            }
        },
        onNoLastChanged() {
            const slots = this.$.#pvt.shadowRoot.querySelectorAll("slot");
            if (slots.length) {
                slots[0].classList[this.nolast? "add": "remove"]("gone");
                slots[2].classList[this.nolast? "add": "remove"]("gone");
            }
        },
        onHorizontalChanged(e) {
            const pvt = this.$.#pvt;
            const container = pvt.getShadowChild("div", ".container");
            const content = pvt.getShadowChild("", "slot:not([name])");
            let sparent = pvt.getShadowParent(this.parentElement);
            let first = pvt.getShadowChild("slot", "[name=first]");
            let last = pvt.getShadowChild("slot", "[name=first]");

            if (sparent && container && content) {
                if (this.horizontal) {
                    let cw = sparent.clientWidth,
                        ch = sparent.clientHeight;
                    let pcw = `${cw}px`,
                        pch = `${ch}px`;

                    if ((container.style.width != pch) || (container.style.height != pcw)) {
                        let hch = `${ch/2}px`
                        container.style.width = pch;
                        container.style.height = pcw;
                        container.style.transformOrigin = `${hch} ${hch}`;
                        
                        let ccw = `${cw - first.clientHeight - last.clientHeight}px`;
                        content.style.width = ccw;
                        content.style.height = pch;
                        content.style.transformOrigin = `${hch} ${hch}`;
                    }
                } else {
                    if (content) {
                        content.style.width = "";
                        content.style.height = "";
                    }
                    this.style.width = "";
                    this.style.height = "";
                }
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            "resize": pvt.onResize,
            "parentResized": pvt.parentResized,
            "nofirstChanged": pvt.onNoFirstChanged,
            "nolastChanged": pvt.onNoLastChanged,
            "horizontalChanged": pvt.onHorizontalChanged
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.#pvt.observeSize(this);
    }
}