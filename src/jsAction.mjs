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
    
    static validateHotKey(hotkey) {
        let retval = "";

        if (hotkey) {
            const presses = hotkey.split(",");

            for (let press of presses) {
                let i = 0, keys = press.toLowerCase().split("+");
                let c = 0;
                let rPress = "";

                if (retval && keys.length) {
                    retval += ",";
                }
                if (keys.includes("ctrl")) {
                    rPress += "Ctrl";
                }
                if (keys.includes("alt")) {
                    rPress += (rPress.length ? "+" : "") + "Alt";
                }
                if (keys.includes("shift")) {
                    rPress += (rPress.length ? "+" : "") + "Shift";
                }
                if (keys.includes("meta")) {
                    if (keys.includes("win")) {
                        throw new AppLibError(`Invalid hotkey sequence. "Meta" === "Win": ${press}`);
                    }
                    rPress += (rPress.length ? "+" : "") + "Meta";
                }
                else if (keys.includes("win")) {
                    rPress += (rPress.length ? "+" : "") + "Win";
                }

                while (keys[i]) {
                    let key = keys[i].toLowerCase();
                    if (!["alt", "ctrl", "shift", "meta", "win"].includes(key)) {
                        if (++c > 1) {
                            throw new AppLibError(`Invalid hotkey sequence: ${press}`);
                        }
                        rPress += (rPress.length ? "+" : "") + key.toUpperCase();
                    }
                    ++i;
                }

                retval += rPress;
            }
        }

        return retval;
    }
    
    #registered = [];

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
        onHotkeyChanged(e) {
            let { oldValue, newValue } = e.detail;
            let hotkey = Action.validateHotKey(newValue);
            if (newValue != hotkey) {
                this.setAttribute("hotkey", hotkey);
            } else {
                const am = app.actionManager;
                if (am) {
                    am.unregisterHotKey(this.hotkey, this);
                    am.registerHotKey(this.hotkey, this);
                }
            }
        },
        onSelectedChanged() {
            for (let item of this.$.#registered) {
                if ("selected" in item) {
                    item.selected = this.selected;
                }
            }
            this.fireEvent(`${this.selected ? "" : "de"}selected`)
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            hotkeyChanged: pvt.onHotkeyChanged,
            selectedChanged: pvt.onSelectedChanged
        });
    }

    register(item) {
        this.$.#registered.push(item);
    }
};
