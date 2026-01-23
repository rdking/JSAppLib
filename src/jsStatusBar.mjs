import { share } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class StatusBar extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat(["status"]);
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
