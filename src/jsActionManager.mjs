import { share } from "../node_modules/cfprotected/index.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import AppLibError from "./errors/AppLibError.mjs";

export default class ActionManager extends ManagerBase {
    static #spvt = share(this, {});

    static {
        this.#spvt.register(this);
    }

    #keyMap = {};
    #observer = null;

    #pvt = share(this, ActionManager, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            if (document.querySelectorAll(ActionManager.tagName).length > 1) {
                throw new AppLibError("Only 1 instance of ActionManager allowed");
            }
            pvt.validateChildren(pvt.tagType("action"),
                "ActionManager can only contain Action elements");
        },
        onKeyDown(e) {
            if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;

            let key = "";
            key += e.ctrlKey ? "Ctrl" : "";
            key += e.altKey ? (key.length ? "+" : "") + "Alt" : "";
            key += e.shiftKey ? (key.length ? "+" : "") + "Shift" : "";
            key += e.metaKey ? (key.length ? "+" : "") + "Meta" : "";
            
            let keyName = e.key;
            keyName = (keyName.length === 1) ? keyName.toUpperCase() : keyName.toLowerCase();
            key += (key.length ? "+" : "") + keyName;

            let entry = this.$.#keyMap[key];

            if (entry) {
                e.preventDefault();
                e.stopPropagation();
                entry.action.trigger();
            }
        },
        onMutation(mutations) {
            const pvt = this.$.#pvt;
            const actionTag = pvt.tagType("action").toUpperCase();
            
            for (const mutation of mutations) {
                for (const node of mutation.removedNodes) {
                    if (node.nodeType === 1 && node.tagName === actionTag) {
                        pvt.cleanupAction(node);
                    }
                }
            }
        },
        cleanupAction(action) {
            const map = this.$.#keyMap;
            Object.keys(map).forEach(key => {
                if (map[key].action === action) {
                    delete map[key];
                }
            });
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            render: "render",
            preRender: "onPreRender"
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const pvt = this.$.#pvt;
        window.addEventListener("keydown", pvt.onKeyDown);
        
        this.#observer = new MutationObserver(pvt.onMutation);
        this.#observer.observe(this, { childList: true });
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) super.disconnectedCallback();
        const pvt = this.$.#pvt;
        window.removeEventListener("keydown", pvt.onKeyDown);
        if (this.#observer) {
            this.#observer.disconnect();
            this.#observer = null;
        }
    }

    /**
     * Returns the action object with a given name.
     * @param {string} name Name of the action to retrieve.
     * @returns Action
     */
    getAction(name) {
        return this.querySelector(`${this.$.#pvt.tagType("action")}[name="${name}"]`);
    }

    registerHotKey(hotkey, action) {
        const presses = hotkey.split(",").map(p => p.trim()).filter(p => p);

        for (const press of presses) {
            if (press in this.$.#keyMap) {
                if (this.$.#keyMap[press].action !== action) {
                    throw new AppLibError(`Hotkey sequence already in use: ${press}`);
                }
            } else {
                this.$.#keyMap[press] = { action };
            }
        }
    }

    unregisterHotKey(hotkey, action) {
        const presses = hotkey.split(",").map(p => p.trim()).filter(p => p);

        for (const press of presses) {
            let entry = this.$.#keyMap[press];

            if (entry) {
                if (entry.action === action) {
                    delete this.$.#keyMap[press];
                }
                else {
                    throw new AppLibError(`Can't delete a hotkey you don't own!`);
                }
            }
        }
    }
};
