import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class DataSchema extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return [];
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {});
        spvt.register(this);
    }

    #pvt = share(this, DataSchema, {
        render() {
            const pvt = this.$.#pvt;

            pvt.make("slot");
        }
    });

    constructor() {
        super();

        const pvt = this.pvt;
    }
}