import { share, saveSelf, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import DataRecord from "./jsDataRecord.mjs";

export default class DataSchema extends DataRecord {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return DataRecord.observedAttributes.concat(["tablename", "indexfield"]);
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {});
        spvt.register(this);
    }

    #pvt = share(this, DataSchema, {
    });

    constructor() {
        super();

        const pvt = this.pvt;
    }
}