import { share, abstract } from "../node_modules/cfprotected/index.mjs";
import Enum from "./util/Enum.mjs";
import ControlBase from "./jsControlBase.mjs";

const ActionControlBase = abstract(class ActionControlBase extends ControlBase {
    static #spvt = share(this, {});
    static #buttonModes = new Enum("ButtonModes", ["iconOnly", "textOnly", "both"]);
    static get ButtonModes() { return ActionControlBase.#buttonModes; }

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([
            "caption", "description", "disabled", "hotkey", "icon", "onaction",
            "toggle", "selected", "action"
        ]);
    }

    static #ggetter(attr) {
        return function actionPropGetter() {
            let value = this.getAttribute(attr);
            return (this.currentAction) ? this.currentAction[attr] || value : value;
        }
    }

    static #bgetter(attr) {
        return function binaryActionPropGetter() {
            let value = !!this.hasAttribute(attr) &&
                !["no", "false", "0"].includes(this.getAttribute(attr).toLowerCase().trim());
            return !!((this.currentAction) ? this.currentAction[attr] : value);
        }
    }

    static #bsetter(attr) {
        return function binaryActionPropSetter(val) {
            const action = this.currentAction;
            if (action) {
                if (action[attr] !== !!val) {
                    action[attr] = !!val;
                }
            }
            else {
                if (!!val) {
                    this.setAttribute(attr, "");
                } else {
                    this.removeAttribute(attr);
                }
            }
        }
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            action: { readonly: true },
            caption: { getter: this.#ggetter("caption") },
            description: { getter: this.#ggetter("description") },
            disabled: { isBool: true, caption: "disabled",
                getter: this.#bgetter("disabled"),
                setter: this.#bsetter("disabled")
            },
            icon: { getter: this.#ggetter("icon") },
            hotkey: { getter: this.#ggetter("hotkey") },
            toggle: { isBool: true, readonly: true, caption: "toggle",
                getter: this.#bgetter("toggle")
            },
            selected: { isBool: true, caption: "selected",
                getter: this.#bgetter("selected"),
                setter: this.#bsetter("selected")
            },
            onaction: { getter: this.#ggetter("onaction") }
        });
    }

    #oldStatus = "";

    #pvt = share(this, ActionControlBase, {
        onMouseEnter(e) {
            const app = JSAppLib.app;
            if (!this.disabled && app.statusBar) {
                this.$.#oldStatus = app.statusBar.status;
                if (this.description) {
                    app.statusBar.status = this.description || "";
                }
            }
        },
        onMouseLeave(e) {
            const app = JSAppLib.app;
            if (!this.disabled && app.statusBar) {
                app.statusBar.status = this.$.#oldStatus;
                this.$.#oldStatus = "";
            }
        },
        onAction() {
            if (!this.disabled) {
                if (this.toggle) {
                    this.selected = !this.selected;
                } else if (this.action) {
                    this.currentAction?.trigger();
                }
                else {
                    this.$.#pvt.callEventHandler("action");
                }
            }
        },
        onSelectedChanged(e) {
            //NOP. For use by descendant classes.
        },
        onActionChanged(e) {
            const pvt = this.$.#pvt;
            const app = JSAppLib.app;
            const oldAction = app?.actionManager?.getAction(e.detail.oldValue);
            if (oldAction) {
                oldAction.unregister(this, pvt.onSelectedChanged);
            }
            if (this.toggle) {
                this.currentAction.register(this, pvt.onSelectedChanged);
            }
        }
    });

    constructor() {
        super()

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            action: "onAction",
            actionChanged: "onActionChanged",
            selectedChanged: "onSelectedChanged",
            mouseenter: "onMouseEnter",
            mouseleave: "onMouseLeave"
        });
    }

    triggerAction() {
        this.fireEvent("action");
    }

    get currentAction() {
        const app = JSAppLib.app;
        let retval = null;
        if (this.action && app.actionManager) {
            retval = app.actionManager.getAction(this.action);
        }

        return retval;
    }
});

export default ActionControlBase;