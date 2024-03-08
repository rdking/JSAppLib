import { share, accessor, saveSelf } from "../../cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Enum from "./util/Enum.mjs";

export default class ActionButton extends ActionControlBase {
    static #spvt = share(this, {});
    static #buttonModes = new Enum("ButtonModes", ["iconOnly", "textOnly"]);
    static get ButtonModes() { return this.$.#buttonModes; }

    static get observedAttributes() {
        return ActionControlBase.observedAttributes.concat([ "buttonmode", "toggle" ]); 
    }
    
    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {
            buttonmode: { enum_t: this.ButtonModes },
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
                        src: this.icon,
                        draggable: false,
                        class: (this.buttonmode === BM.textOnly) ? "hidden" : ""
                    }),
                    pvt.make("label", {
                        class: (this.buttonmode === BM.iconOnly) ? "hidden" : ""
                    }, {
                        innerHTML: this.caption.replace("_", "")
                    })
                ]
            }));
        },
        onCaptionChanged(e) {
            if (this.shadowRoot.innerHTML) {
                const label = this.shadowRoot.querySelector("img");
                label.innerHTML = this.caption.replace("_", "");
            }
        },
        onButtonModeChanged(e) {
            if (this.shadowRoot.innerHTML) {
                const BM = this.cla$$.ButtonModes;
                const img = this.shadowRoot.querySelector("img");
                const label = this.shadowRoot.querySelector("label");

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
            if (this.shadowRoot.innerHTML) {
                const img = this.shadowRoot.querySelector("img");
                img.src = this.icon;
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("buttonmodeChanged", pvt.onButtonModeChanged);
        this.addEventListener("captionChanged", pvt.onCaptionChanged);
        this.addEventListener("iconChanged", pvt.onIconChanged);
        this.addEventListener("render", pvt.render);
    }
}
