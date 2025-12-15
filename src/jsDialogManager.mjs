import { share, final } from "/node_modules/cfprotected/index.mjs";
import ManagerBase from "/node_modules/jsapplib/src/jsManagerBase.mjs";
import DialogBase from "./jsDialogBase.mjs";

export default final(class DialogManager extends ManagerBase {
    static #spvt = share(this, {});

    static {
        this.#spvt.register(this);
    }

    #clients = {};
    #pvt = share(this, DialogManager, {
        render() {},
        onPreRender() {
            if (document.querySelectorAll(DialogManager.tagName).length > 1) {
                throw new TypeError("Only 1 instance of DialogManager allowed");
            }

            for (const child of this.children) {
                if (!(child instanceof DialogBase)) {
                    throw new TypeError("DialogManager can only contain components that extend DialogBase.");
                }
            }
        },
        onManagerReady() {
            //Force the dialogs to re-render after the themes are ready
            for (let child of this.children) {
                child.fireEvent("render");
            }
        }
    });

    connectedCallback() {
        this.$.#pvt.ready = true;
        super.connectedCallback();
    }
});
