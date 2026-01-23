import { share, abstract } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs";

const ManageableBase = abstract(class ManageableBase extends Base {
    static #spvt = share(this, {});
    static get isManagement() { return true; };
    
    static get observedAttributes() {
        return Base.observedAttributes; 
    }

    #pvt = share(this, ManageableBase, {
        render() {
            this.$.#pvt.renderContent([]);
        }
    });
});

export default ManageableBase;