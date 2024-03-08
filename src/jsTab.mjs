import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class Tab extends Base {
    static observedAttributes = ["caption", "closeable", "disabled", "selected"];
    static #spvt= share(this, {});

    static {
        this.#spvt.initAttributeProperties(this, {
            caption: {},
            selected: { isBool: true },
            disabled: { isBool: true },
            closeable: { isBool: true }
        });
        this.#spvt.register(this);
    }

    #pvt= share(this, Tab, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
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
            ]);
        },
        onSelectedChanged(e) {
        },
        onDisabledChanged(e) {
            let { newValue: newVal } = e.detail;
            let container = this.shadowRoot.getElementById("container");
            container.classList[!!newVal ? "add" : "remove"]("disabled");
        },
        onCloseableChanged(e) {
            let closeButton = this.shadowRoot.querySelector("slot");
            if (closeButton) {
                closeButton.classList[this.closeable?"remove":"add"]("hidden");
            }
        },
        onCaptionChanged(e) {
            let label = this.shadowRoot.querySelector("label");
            if (label) {
                label.innerHTML = this.caption;
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("render", pvt.render());
        this.addEventListener("selectedChanged", pvt.onSelectedChanged);
        this.addEventListener("disabledChanged", pvt.onDisabledChanged);
        this.addEventListener("closeableChanged", pvt.onCloseableChanged);
        this.addEventListener("captionChanged", pvt.onCaptionChanged);
    }
}
