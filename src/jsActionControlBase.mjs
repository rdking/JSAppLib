import { share, abstract } from "../../cfprotected/index.mjs";
import Enum from "./util/Enum.mjs";
import Base from "./jsBase.mjs";

const ActionControlBase = abstract(class ActionControlBase extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "caption", "description", "disabled", "hotkey", "icon", "onaction",
            "toggle", "selected", "action"
        ]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            action: { readonly: true },
            caption: { writeonly: true },
            description: { writeonly: true },
            disabled: { writeonly: true, isBool: true, caption: "disabled" },
            icon: { writeonly: true },
            hotkey: { writeonly: true },
            toggle: { writeonly: true, isBool: true, caption: "toggle" },
            selected: { writeonly: true, isBool: true, caption: "selected" },
            onaction: { writeonly: true }
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
        this.addEventListener("actionChanged", pvt.onActionChanged);
        this.addEventListener("selectedChanged", pvt.onSelectedChanged);
        this.addEventListener("mouseenter", pvt.onMouseEnter);
        this.addEventListener("mouseleave", pvt.onMouseLeave);
        this.addEventListener("click", pvt.onClick);
    }

    get currentAction() {
        let retval = null;
        if (this.action && app.actionManager) {
            retval = app.actionManager.getAction(this.action);
        }

        return retval;
    }
    
    get caption() {
        let caption = this.getAttribute("caption");
        return (this.currentAction) ? this.currentAction.caption || caption : caption;
    }

    get description() {
        let description = this.getAttribute("description") || "";
        return (this.currentAction) ? this.currentAction.description || description : description;
    }

    get disabled() {
        let disabled = !!this.hasAttribute("disabled");
        return !!((this.currentAction) ? this.currentAction.disabled : disabled);
    }

    get hotkey() {
        let hotkey = this.getAttribute("hotkey") || "";
        return (this.currentAction) ? this.currentAction.hotkey || hotkey : hotkey;
    }

    get icon() {
        let icon = this.getAttribute("icon") || "";
        return (this.currentAction) ? this.currentAction.icon || icon : icon;
    }

    get onaction() {
        let onaction = this.getAttribute("onaction") || "";
        return (this.currentAction) ? this.currentAction.ontriggered || onaction : onaction;
    }

    get toggle() {
        let toggle = !!this.hasAttribute("toggle");
        return !!((this.currentAction) ? this.currentAction.toggle : toggle);
    }

    get selected() {
        let selected = !!this.hasAttribute("selected");
        return !!((this.currentAction) ? this.currentAction.selected : selected);
    }
});

export default ActionControlBase;