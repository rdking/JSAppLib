import { share } from "../../cfprotected/index.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import AppLibError from "./errors/AppLibError.mjs";

export default class ActionManager extends ManagerBase {
    static #spvt = share(this, {});

    static {
        this.#spvt.register(this);
    }

    #keyMap = {};

    #pvt = share(this, ActionManager, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            if (document.querySelectorAll(ActionManager.tagName).length > 1) {
                throw new TypeError("Only 1 instance of ActionManager allowed");
            }
            pvt.validateChildren(pvt.tagType("action"),
                "ActionManager can only contain Action elements");
        },
        onKeyPress(e) {
            let key = "";
            key += e.altKey ? "Alt" : "";
            key += e.ctrlKey ? (key.length ? "+" : "") + "Ctrl" : "";
            key += e.shiftKey ? (key.length ? "+" : "") + "Shift" : "";
            key += e.metaKey ? (key.length ? "+" : "") + "Win" : "";
            key += (key.length ? "+" : "") + e.key.toUpperCase();
            console.log(`key: ${key}`);

            let entry = this.$.#keyMap[key];

            if (entry) {
                Function(entry.action).call();
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("render", pvt.render);
        this.addEventListener("preRender", pvt.onPreRender);
        window.addEventListener("keypress", pvt.onKeyPress)

        console.log("***** ActionManager Ready!");
    }

    /**
     * Returns the action object with a given name.
     * @param {string} name Name of the action to retrieve.
     * @returns Action
     */
    getAction(name) {
        return this.querySelector(`${this.$.#pvt.tagType("action")}[name=${name}]`);
    }

    registerHotKey(hotkey, action) {
        const presses = hotkey.split(",");
        let value = { keys: [], action };

        for (let press of presses) {
            const keys = press.split("+");
            let keyData = {
                altKey: keys.includes("Alt"),
                ctrlKey: keys.includes("Ctrl"),
                shift: keys.includes("Shift"),
                metaKey: keys.includes("Meta") || keys.includes("Win")
            };

            let i = 0;
            while (keys[i]) {
                if (["Alt", "Ctrl", "Shift", "Meta", "Win"].includes(keys[i])) {
                    keys.shift();
                } else {
                    ++i;
                }
            }
            if (keys.length != 1) {
                throw new AppLibError(`Invalid hotkey sequence: ${press}`);
            }

            keyData.key = keys[0];
            value.keys.push(keyData);
        }

        if (hotkey in this.$.#keyMap) {
            throw new AppLibError(`Hotkey sequence already in use: ${hotkey}`);
        }

        this.$.#keyMap[hotkey] = value;
    }

    unregisterHotKey(hotkey, action) {
        let entry = this.$.#keyMap[hotkey];

        if (entry) {
            if (entry.action === action) {
                delete this.$.#keyMap[hotkey];
            }
            else {
                throw new AppLibError(`Can't delete a hotkey you don't own!`);
            }
        }
    }
};
