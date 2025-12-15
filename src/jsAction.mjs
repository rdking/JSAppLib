import { share } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";

export default class Action extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "caption", "description", "disabled", "hotkey", "icon", "name",
            "toggle", "selected"
        ]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            caption: { readonly: true },
            description: { readonly: true },
            disabled: { readonly: true, isBool: true, caption: "disabled" },
            hotkey: { readonly: true },
            icon: { readonly: true },
            name: { readonly: true },
            toggle: { readonly: true, isBool: true, caption: "toggle" },
            selected: { isBool: true, caption: "selected" }
        });
        spvt.register(this);
    }
    
    static #MODIFIERS = {
        "ctrl": "Ctrl", "control": "Ctrl",
        "alt": "Alt",
        "shift": "Shift",
        "meta": "Meta", "win": "Meta", "command": "Meta"
    };
    static #MODIFIER_ORDER = ["Ctrl", "Alt", "Shift", "Meta"];

    static validateHotKey(hotkey) {
        if (!hotkey) {
            return "";
        }
    
        const presses = hotkey.split(',').map(p => p.trim()).filter(p => p);
    
        const validatedPresses = presses.map(press => {
            const keys = press.toLowerCase().split('+').map(k => k.trim()).filter(k => k);
            const modifiers = new Set();
            let mainKey = null;
    
            for (const key of keys) {
                if (key in this.#MODIFIERS) {
                    modifiers.add(this.#MODIFIERS[key]);
                } else {
                    if (mainKey !== null) {
                        throw new AppLibError(`Invalid hotkey sequence: "${press}". Only one non-modifier key allowed.`);
                    }
                    mainKey = key;
                }
            }
    
            const sortedModifiers = [...modifiers].sort((a, b) => 
                this.#MODIFIER_ORDER.indexOf(a) - this.#MODIFIER_ORDER.indexOf(b)
            );
    
            const finalKeys = [...sortedModifiers];
            if (mainKey) {
                finalKeys.push(mainKey.length === 1 ? mainKey.toUpperCase() : mainKey);
            }
    
            return finalKeys.join('+');
        });
    
        return validatedPresses.join(',');
    }
    
    #registered = new Map();

    #pvt = share(this, Action, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        },
        onPreRender() {
            if (!this.hasAttribute("name") || !this.getAttribute("name").trim().length) {
                throw new TypeError("Action elements must have a name attribute");
            }
            if (!this.hasAttribute("caption") || !this.getAttribute("caption").trim().length) {
                throw new TypeError("Action elements must have a caption attribute");
            }
            this.$.#pvt.validateParent(this.$.#pvt.tagType("actionmanager"),
                "Action elements can only contained by an ActionManager element");
        },
        onPostRender() {
            if (this.hotkey) {
                this.parentElement.registerHotKey(this.hotkey, this);
            }
        },
        onHotkeyChanged(e) {
            let { oldValue, newValue } = e.detail;
            let hotkey = Action.validateHotKey(newValue);
            if (newValue != hotkey) {
                if (this.parentElement && oldValue) {
                    this.parentElement.unregisterHotKey(oldValue, this);
                }
                this.setAttribute("hotkey", hotkey);
            } else {
                if (this.parentElement) {
                    if (oldValue) {
                        this.parentElement.unregisterHotKey(oldValue, this);
                    }
                    if (hotkey) {
                        this.parentElement.registerHotKey(hotkey, this);
                    }
                }
            }
        },
        onSelectedChanged(e) {
            this.fireEvent(`actionSelectedChanged`, e.detail);
        },
        onAction() {
            this.$.#pvt.callEventHandler("action");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            action: "onAction",
            hotkeyChanged: "onHotkeyChanged",
            selectedChanged: "onSelectedChanged"
        });
    }

    register(item, onActionSelectedChanged) {
        this.$.#registered.set(item, onActionSelectedChanged);
        this.addEventListener("actionSelectedChanged", onActionSelectedChanged);
    }

    unregister(item) {
        if (this.$.#registered.has(item)) {
            const onActionSelectedChanged = this.$.#registered.get(item);
            this.removeEventListener("actionSelectedChanged", onActionSelectedChanged);
            this.$.#registered.delete(item);
        }
    }

    trigger() {
        this.fireEvent("action");
    }
};
