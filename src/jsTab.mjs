import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class Tab extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([ "caption", "closeable", "disabled", "selected" ]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            caption: {},
            selected: { isBool: true },
            disabled: { isBool: true },
            closeable: { isBool: true }
        });
        spvt.register(this);
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
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            selectedChanged: pvt.onSelectedChanged,
            disabledChanged: pvt.onDisabledChanged,
            closeableChanged: pvt.onCloseableChanged,
            captionChanged: pvt.onCaptionChanged
        });
    }
}
