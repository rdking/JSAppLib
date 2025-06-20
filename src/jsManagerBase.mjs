import { share, abstract } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";
import WaitBox from "./util/WaitBox.mjs";

let ManagerBase = abstract(class ManagerBase extends Base {
    static #spvt = share(this, {});

    static get isManagement() { return true; };

    #ready = false;
    #waitbox = new WaitBox();
    
    #pvt = share(this, ManagerBase, {
        doRender() {
            throw new AppLibError("ManagerBase - doRender not implemented.");
        },
        render() {
            this.$.#waitbox.add(this, this.$.#pvt.doRender);
        }
    });

    get ready() { return this.$.#pvt.ready; }
});

export default ManagerBase;