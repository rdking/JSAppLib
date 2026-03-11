import { share, final } from "../node_modules/cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";
import CSS from "./util/Selectors.mjs";

const ActivityIndicator = final(class ActivityIndicator extends ControlBase {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return ControlBase.observedAttributes.concat(["image", "layers"]);
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        return [
            [
                [[CSS.HOST], {
                    display: "flex",
                    flex: "1 0 auto",
                    alignSelf: "stretch",
                    justifyContent: "center",
                    alignItems: "center",
                    justifySelf: "stretch",
                    backdropFilter: "blur(2px)"
                }],
                [[CSS.CLASS("overlay")], {
                    position: "relative",
                    display: "flex",
                    flex: "1 0 auto",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    justifySelf: "center",
                    alignSelf: "center",
                    width: "100%",
                    height: "100%",
                    zIndex: "10"
                }],
                [[CSS.CLASS("container")], {
                    position: "relative",
                    width: "64px",
                    height: "64px"
                }],
                [[CSS.CLASS("spinner1")], {
                    position: "absolute",
                    width: "64px",
                    height: "64px",
                    animationName: "rotate",
                    animationDuration: "2s",
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite"
                }],
                [[CSS.CLASS("spinner2")], {
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    width: "48px",
                    height: "48px",
                    animationName: "rotate",
                    animationDuration: "1.2s",
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite"
                }],
                [[CSS.CLASS("spinner3")], {
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    width: "32px",
                    height: "32px",
                    animationName: "rotate",
                    animationDuration: "0.8s",
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite"
                }],
                [[CSS.CLASS("message")], {
                    fontSize: "large",
                    fontWeight: "bold"
                }],
                [[CSS.TAG("@keyframes rotate")], [
                    [["0%"], { transform: "rotate(0)" }],
                    [["25%"], { transform: "rotate(90deg)" }],
                    [["100%"], { transform: "rotate(360deg)" }]
                ]]
            ],
            [
                [[CSS.HOST], {
                    backgroundColor: "var(--brush-overlay)"
                }]
            ]
        ];
    }
    
    static {
        const spvt = this.#spvt;

        spvt.initAttributeProperties(this, {
            image: { default: "/images/activity.png"},
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
        pvt.registerEvents(pvt, {
            imageChanged: "onImageChange"
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
