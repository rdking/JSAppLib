import { share } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import CSS from "./util/Selectors.mjs";

export default class StatusBar extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat(["status"]);
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        return [
            [
                [[CSS.HOST], {
                    display: "flex",
                    flex: "1 0 24px",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    margin: "0px",
                    padding: "0.5em"
                }],
                [[CSS.CLASS("status")], {
                    display: "flex",
                    justifyContent: "flex-start",
                    flex: "1 0 auto"
                }],
                [[CSS.TAG("slot")], {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignContent: "space-between"
                }],
                [[CSS.SLOTTED(CSS.UNIVERSAL)], {
                    marginLeft: "1em"
                }]
            ],
            [
                [[CSS.HOST], {
                    backgroundColor: "var(--brush-container-normal)",
                    color: "var(--pen-container-normal)",
                    borderTop: "1px solid var(--brush-shadow)"
                }]
            ]
        ];
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            status: { }
        });    
        this.#spvt.register(this);
    }    
    
    #pvt = share(this, StatusBar, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make("span", {
                    class: "status"
                }, {
                    innerHTML: this.status 
                }),
                pvt.make("slot")
            ]);
        },
        onStatusChange(e) {
            let status = this.$.#pvt.shadowRoot.querySelector("span.status");
            if (status) {
                status.innerHTML = e.detail.newValue;
            }
        }
    });

    constructor() {
        super();
    }

    connectedCallback() {
        const pvt = this.$.#pvt;
        this.addEventListener("render", pvt.render);
        this.addEventListener("statusChanged", pvt.onStatusChange);
        super.connectedCallback();
    }
}
