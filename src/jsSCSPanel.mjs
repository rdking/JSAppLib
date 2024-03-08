import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

/**
 * Slot/Content/Slot Panel
 * This is an ordinary content panel with a slotheader and footer slot for placing
 * elements in the top and bottom regions of the panel.
 */
export default class SCSPanel extends Base {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat(["horizontal", "nofirst", "nolast"]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            horizontal: { isBool: true, caption: "horizontal" },
            nofirst: { isBool: true, caption: "nofirst" },
            nolast: { isBool: true, caption: "nolast" }
        });
        this.#spvt.register(this);
    }

    #pvt= share(this, SCSPanel, {
        render() {
            const p = this.$.#pvt;
            const first = this.horizontal? "left": "top";
            const last = this.horizontal? "right": "bottom";

            p.renderContent([
                p.make("slot", {
                    name: first,
                    class: this.nofirst ? "gone" : ""
                }),
                p.make("slot"),
                p.make("slot", {
                    name: last,
                    class: this.nolast ? "gone" : ""
                })
            ]);
        },
        onHorizontalChanged() {
            const slots = this.$.shadowRoot.querySelectorAll("slot");
            if (slots.length) {
                slots[0].name = this.horizontal? "left": "top";
                slots[2].name = this.horizontal? "right": "bottom";
            }
        },
        onNoFirstChanged() {
            const slots = this.$.shadowRoot.querySelectorAll("slot");
            if (slots.length) {
                slots[0].classList[this.nofirst? "add": "remove"]("gone");
                slots[2].classList[this.nofirst? "add": "remove"]("gone");
            }
        },
        onNoLastChanged() {
            const slots = this.$.shadowRoot.querySelectorAll("slot");
            if (slots.length) {
                slots[0].classList[this.nolast? "add": "remove"]("gone");
                slots[2].classList[this.nolast? "add": "remove"]("gone");
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("render", pvt.render);
        this.addEventListener("horizontalChanged", pvt.onHorizontalChanged);
        this.addEventListener("nofirstChanged", pvt.onNoFirstChanged);
        this.addEventListener("nolastChanged", pvt.onNoLastChanged);
    }
}