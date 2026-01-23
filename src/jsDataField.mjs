import { share, saveSelf, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import ManageableBase from "./jsManageableBase.mjs";

export default class DataField extends ManageableBase {
    static #spvt = share(this, {});

    static #DataType = new Enum("DataType", [ "array", "number", "string", "json" ]);
    static get DataType() { return this.$.#DataType; }

    static get observedAttributes() {
        return ManageableBase.observedAttributes.concat([ "name", "type", "size", "precision", "validator" ]);
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {
            name: { readonly: true },
            type: { readonly: true, enumType: this.#DataType },
            size: { readonly: true, number: { range: [ 0, 100 ], step: 1 } },
            precision: { readonly: true },
            validator: { readonly: true }
        });
        spvt.register(this);
    }

    #pvt = share(this, DataField, {
        render() {
            const pvt = this.$.#pvt;
        }
    });

    constructor() {
        super();

        const pvt = this.pvt;
    }
}

/*
    <js-dataource name="ds1" type="">
    <js-datafield name="field1" datatype="string">default_value</js-datafield>

*/