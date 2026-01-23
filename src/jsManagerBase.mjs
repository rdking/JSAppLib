import { share, abstract, accessor } from "../node_modules/cfprotected/index.mjs";
// import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";
// import WaitBox from "./util/WaitBox.mjs";

const ManagerBase = abstract(class ManagerBase extends Base {
    static #spvt = share(this, {});

    static get isManagement() { return true; };

    static get observedAttributes() {
        return Base.observedAttributes; 
    }

    #ready = false;
    // #renderwait = new WaitBox();
    
    #pvt = share(this, ManagerBase, {
        ready: accessor({
            set(v) {
                if (!this.$.#ready) {
                    this.$.#ready = !!v;
                    if (this.$.#ready) {
                        this.fireEvent("ready");
                    }
                }
            }
        }),
        // doRender() {
        //     throw new AppLibError("ManagerBase - doRender not implemented.");
        // },
        // render() {
        //     this.$.#renderwait.add(this, this.$.#pvt.doRender);
        // }
        render() {}
    });

    get ready() { return this.$.#ready; }
});

export default ManagerBase;