import { share, saveSelf, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import ManageableBase from "./jsManageableBase.mjs";

export default class DataRecord extends ManageableBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManageableBase.observedAttributes.concat([]);
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {});
        spvt.register(this);
    }

    #pvt = share(this, DataRecord, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(pvt.tagType("datafield"),
                "Invalid child of DataRecord. Children must be DataField tags only.");
        }
    });

    constructor() {
        super();

        const pvt = this.pvt;
    }
}