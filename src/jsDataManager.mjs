import { share, abstract, accessor } from "../../cfprotected/index.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import AppLibError from "./errors/AppLibError.mjs"

/**
 * @description This is the management container tag for data sources. The data
 * sources registered to this class either via HTML tags or through this class
 * API become available to all tags designed to read from data sources.
 */
export default class DataManager extends ManagerBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManagerBase.observedAttributes.concat([]); 
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {

        });
        spvt.register(this); 
    }

    #pvt = share(this, DataFormatManager, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(pvt.tagType("datasource"), 
                "Invalid child of DataManager. Children must be DataSource tags only.");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;

        pvt.registerEvents(pvt, {

        });
    }
}
