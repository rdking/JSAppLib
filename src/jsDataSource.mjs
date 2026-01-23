import { share } from "../node_modules/cfprotected/index.mjs";
import ManageableBase from "./jsManageableBase.mjs";
import AppLibError from "./errors/AppLibError.mjs"

/**
 * @description This is the management container tag for data sources. The data
 * sources registered to this class either via HTML tags or through this class
 * API become available to all tags designed to read from data sources.
 */
export default class DataSource extends ManageableBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManageableBase.observedAttributes.concat([]); 
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {

        });
        spvt.register(this); 
    }

    #pvt = share(this, DataSource, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren([pvt.tagType("datarecord"), pvt.tagType("dataschema")], 
                "Invalid child of DataSource. Children must be DataRecord or DataSchema tags only.");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;

        pvt.registerEvents(pvt, {

        });
    }
}
