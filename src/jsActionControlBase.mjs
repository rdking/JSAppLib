import { share, abstract } from "../../cfprotected/index.mjs";
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

    static #ghandler(attr) {
        return function actionPropGetter() {
            let value = this.getAttribute(attr);
            return (this.currentAction) ? this.currentAction[attr] || value : value;
        }
    }

    static #bhandler(attr) {
        return function binaryActionPropGetter() {
            let value = !!this.getAttribute(attr);
            return !!((this.currentAction) ? this.currentAction[attr] : value);
        }
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            action: { readonly: true },
            caption: { getter: this.#ghandler("caption") },
            description: { getter: this.#ghandler("description") },
            disabled: { getter: this.#bhandler("disabled"), isBool: true, caption: "disabled" },
            icon: { getter: this.#ghandler("icon") },
            hotkey: { getter: this.#ghandler("hotkey") },
            toggle: { getter: this.#bhandler("toggle"), isBool: true, caption: "toggle" },
            selected: { getter: this.#bhandler("selected"), isBool: true, caption: "selected" },
            onaction: { getter: this.#ghandler("onaction") }
        });
    }

    #oldStatus = "";

    #pvt = share(this, ActionControlBase, {
        onMouseEnter(e) {
            if (!this.disabled && app.statusBar) {
                this.$.#oldStatus = app.statusBar.status;
                if (this.description) {
                    app.statusBar.status = this.description || "";
                }
            }
        },
        onMouseLeave(e) {
            if (!this.disabled && app.statusBar) {
                app.statusBar.status = this.$.#oldStatus;
                this.$.#oldStatus = "";
            }
        },
        onClick() {
            if (!this.disabled) {
                if (this.toggle) {
                    this.selected = !this.selected;
                } else {
                    if (typeof(this.onaction) == "string") {
                        Function(this.onaction).call();
                    }
                }
            }
        },
        onSelectedChanged(e) {
            let { oldValue, newValue } = e.detail;

            if (oldValue !== newValue) {
                let action = this.currentAction;
                if (action) {
                    action.selected = (newValue != null);
                }
            }
        },
        onActionChanged() {
            if (this.toggle) {
                this.currentAction.register(this);
            }
        }
    });

    constructor() {
        super()

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            actionChanged: pvt.onActionChanged,
            selectedChanged: pvt.onSelectedChanged,
            mouseenter: pvt.onMouseEnter,
            mouseleave: pvt.onMouseLeave,
            click: pvt.onClick
        });
    }

    get currentAction() {
        let retval = null;
        if (this.action && app.actionManager) {
            retval = app.actionManager.getAction(this.action);
        }

        return retval;
    }
});

export default ActionControlBase;