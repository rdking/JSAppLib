import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Dialog from "/node_modules/jsapplib/src/jsDialog.mjs";

export default class DialogManager extends TagBase {
    static #tagName = "js-dialogmanager";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this, true); }
    static get tagName() { return this.$.#tagName; }
    static get isManagement() {return true};

    #clients = {};
    #prot = share(this, DialogManager, {
        render() {
            const prot = this.$.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onPreRender() {
            if (document.querySelectorAll(DialogManager.tagName).length > 1) {
                throw new TypeError("Only 1 instance of DialogManager allowed");
            }
            this.$.#prot.validateChildren("js-action",
                "DialogManager can only contain Dialog elements");
        },
        onManagerReady() {
            //Force the dialogs to re-render after the themes are ready
            for (let child of this.children) {
                child.fireEvent("render");
            }
        }
    });

    connectedCallback() {
        this.parentElement.addEventListener("ready", this.$.#prot.onManagerReady);
        super.connectedCallback();
        this.fireEvent("ready");
    }
};
