import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class DataField extends Base {
    static #spvt = share(this, {});

    static #DataType = new Enum("DataType", [ "array", "number", "string", "json" ]);
    static get DataType() { return this.$.#DataType; }

    static get observedAttributes() {
        return [ "datatype", "name" ];
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, "$");

        spvt.initAttributeProperties(this, {
            datatype: { readonly: true, enumType: this.#DataType },
            name: { readonly: true }
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