import { share, abstract } from "/node_modules/cfprotected/index.mjs";
import ManageableBase from "/node_modules/jsapplib/src/jsManageableBase.mjs";

export default abstract(class DialogBase extends ManageableBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManageableBase.observedAttributes;
    }

    #dialog;

    #pvt = share(this, DialogBase, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(
                pvt.make("dialog", {}, {
                    children: [
                        pvt.make("header", {}, {
                            children: [ pvt.make("slot", { name: "title" }) ]
                        }),
                        pvt.make("section", { class: "body" }, {
                            children: [ pvt.make("slot") ] // Default slot for body
                        }),
                        pvt.make("footer", {}, {
                            children: [ pvt.make("slot", { name: "footer" }) ]
                        })
                    ]
                })
            );
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            this.$.#dialog = this.shadowRoot.querySelector("dialog");

            this.$.#dialog.addEventListener("close", () => {
                this.fireEvent("close", { returnValue: this.$.#dialog.returnValue });
            });

            pvt.validateParent(pvt.tagType("dialogmanager"),
                "Dialog components must be children of a DialogManager.");
        }
    });

    get returnValue() {
        return this.$.#dialog?.returnValue;
    }

    get isOpen() {
        return this.$.#dialog?.open ?? false;
    }

    /**
     * Displays the dialog as a modal, over the top of any other dialogs.
     */
    show() {
        if (this.$.#dialog && !this.$.#dialog.open) {
            this.$.#dialog.showModal();
        }
    }

    /**
     * Closes the dialog. An optional string can be passed as a return value.
     * @param {string} returnValue
     */
    hide(returnValue) {
        if (this.$.#dialog && this.$.#dialog.open) {
            this.$.#dialog.close(returnValue);
        }
    }
});