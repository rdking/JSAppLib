import { share } from "../node_modules/cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Enum from "./util/Enum.mjs";

export default class ActionButton extends ActionControlBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ActionControlBase.observedAttributes.concat([ "buttonmode", "toggle" ]); 
    }
    
    static {
        const spvt = this.#spvt;
        const BM = this.ButtonModes;

        spvt.initAttributeProperties(this, {
            buttonmode: { 
                enumType: BM,
                getter: function() {
                    return BM(this.hasAttribute("buttonmode") 
                        ? this.getAttribute("buttonmode") 
                        : this.parentElement.getAttribute("displaymode") || BM.both);
                }
            },
            toggle: { isBool: true }
        });
        spvt.register(this);
    }

    #pvt = share(this, ActionButton, {
        render() {
            const BM = this.cla$$.ButtonModes;
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("button", {}, {
                children: [
                    pvt.make("img", {
                        src: this.icon || "",
                        draggable: false,
                        class: (this.buttonmode === BM.textOnly) ? "hidden" : ""
                    }),
                    pvt.make("label", {
                        class: (this.buttonmode === BM.iconOnly) ? "hidden" : ""
                    }, {
                        innerHTML: this.caption?.replace("_", "")
                    })
                ]
            }));
        },
        onCaptionChanged(e) {
            const pvt = this.$.#pvt;
            if (pvt.shadowRoot.innerHTML) {
                const label = pvt.shadowRoot.querySelector("img");
                label.innerHTML = this.caption.replace("_", "");
            }
        },
        onButtonModeChanged(e) {
            const pvt = this.$.#pvt;
            if (pvt.shadowRoot.innerHTML) {
                const BM = this.cla$$.ButtonModes;
                const img = pvt.shadowRoot.querySelector("img");
                const label = pvt.shadowRoot.querySelector("label");

                switch(this.buttonmode) {
                    case BM.iconOnly:
                        img.classList.remove("hidden");
                        label.classList.add("hidden");
                        break;
                    case BM.labelOnly:
                        img.classList.add("hidden");
                        label.classList.remove("hidden");
                        break;
                    default:
                        img.classList.remove("hidden");
                        label.classList.remove("hidden");
                }
            }
        },
        onIconChanged(e) {
            const pvt = this.$.#pvt;
            if (pvt.shadowRoot.innerHTML) {
                const img = pvt.shadowRoot.querySelector("img");
                img.src = this.icon;
            }
        },
        onClicked() {
            this.fireEvent("action");
        },
        onSelectedChanged(e) {
            this.classList[this.selected ? "add" : "remove"]("selected");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            click: "onClicked",
            update: "onButtonModeChanged",
            buttonmodeChanged: "onButtonModeChanged",
            captionChanged: "onCaptionChanged",
            iconChanged: "onIconChanged"
        });
    }
}
