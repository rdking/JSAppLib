import { share, final } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

const ActivityIndicator = final(class ActivityIndicator extends TagBase {
    static #tagName = "js-activityindicator";
    
    static #sprot = share(this, {});
    
    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["image", "layers"]);
    }

    #prot = share(this, ActivityIndicator, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                class: "overlay"
            }, {
                children: [
                    prot.newTag("div", {
                        class: "container"
                    }, {
                        children: [
                            prot.newTag("img", {
                                class: "spinner1",
                                src: this.image
                            }),
                            prot.newTag("img", {
                                class: "spinner2",
                                src: this.image
                            }),
                            prot.newTag("img", {
                                class: "spinner3",
                                src: this.image
                            })
                        ]
                    }),
                    prot.newTag("slot", {
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

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("imageChange", prot.onImageChange);
        super.connectedCallback();
    }

    get image() { return this.getAttribute("image") || 
        "node_modules/jsapplib/test/html/images/activity.png"; }
    set image(v) { this.setAttribute("image", v); }

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
