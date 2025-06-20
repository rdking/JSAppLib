import { share, final } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

const ActivityIndicator = final(class ActivityIndicator extends ControlBase {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return ControlBase.observedAttributes.concat(["image", "layers"]);
    }
    
    static {
        const spvt = this.#spvt;

        spvt.initAttributeProperties(this, {
            image: { default: "/test/html/images/activity.png"},
            layers: { readonly: true }
        });
        spvt.register(this);
    }

    #pvt = share(this, ActivityIndicator, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {
                class: "overlay"
            }, {
                children: [
                    pvt.make("div", {
                        class: "container"
                    }, {
                        children: [
                            pvt.make("img", {
                                class: "spinner1",
                                src: this.image
                            }),
                            pvt.make("img", {
                                class: "spinner2",
                                src: this.image
                            }),
                            pvt.make("img", {
                                class: "spinner3",
                                src: this.image
                            })
                        ]
                    }),
                    pvt.make("slot", {
                        class: "message"
                    })
                ]
            }));
        },
        onImageChange() {
            let spinner1 = this.shadowRoot.querySelector("img.spinner1");
            let spinner2 = this.shadowRoot.querySelector("img.spinner2");
            let spinner3 = this.shadowRoot.querySelector("img.spinner3");
            spinner1.src = this.image;
            spinner2.src = this.image;
            spinner3.src = this.image;
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            "imageChange": pvt.onImageChange
        });
    }

    show(handler) {
        if (typeof(handler) != "function") {
            throw new TypeError("The handler must be a function");
        }
        let retval = new Promise((resolve, reject) => {
            try {

            }
            finally {
                this.hide();
            }
        })
    }
});

export default ActivityIndicator;
