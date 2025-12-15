import { share, abstract } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

const ManageableBase = abstract(class ManageableBase extends Base {
    static #spvt = share(this, {});
    static get isManagement() { return true; };
    
    static get observedAttributes() {
        return Base.observedAttributes; 
    }

    #pvt = share(this, ManageableBase, {
        render() {}
    });
});

export default ManageableBase;