import { share, abstract, define } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs"

export default abstract(class DataHandlerBase extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "args"
        ]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            args: { readonly: true }
        });
        define(this, {
            handler: {
                get() {
                    if (!this.$.#handler) {
                        //let args = this.getAttribute("args");
                        this.$.#handler = Function(this.args, this.innerHTML);
                    }
                    return this.$.#handler; 
                }
            }
        });
        this.#spvt.register(this);
    }

    #handler;

    #pvt = share(this, DataHandlerBase, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent(pvt.make("script", {}, {
                children: [
                    pvt.make("slot")
                ]
            }));
        }
    });

    constructor() {
        super();

        //Make sure this is initialized...
        this.handler;        
    }
});
