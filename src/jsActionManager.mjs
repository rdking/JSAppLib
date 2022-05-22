import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Action from "/node_modules/jsapplib/src/jsAction.mjs";

export default class ActionManager extends TagBase {
    static #tagName = "js-actionmanager";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this, true); }
    static get tagName() { return this.pvt.#tagName; }
    static get isManagement() {return true};

    #clients = {};
    #prot = share(this, ActionManager, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onPreRender() {
            if (document.querySelectorAll(ActionManager.tagName).length > 1) {
                throw new TypeError("Only 1 instance of ActionManager allowed");
            }
            this.pvt.#prot.validateChildren("js-action",
                "ActionManager can only contain Action elements");
        },
        refreshClient(client, actionName) {
            const action = this.querySelector(`[name=${actionName}]`);
            for (let field of Action.keyAttributes) {
                client.cla$$.setActionMappedField(client, field, action[field]);
            }
        }
    });

    connectedCallback() {
        super.connectedCallback();
        this.fireEvent("ready");
    }

    /**
     * Immediately updates all HTML elements registered to use the specified
     * field.
     * @param {Action} action The <js-action> whose attributes have changed.
     * @param {string} field The attribute of the <js-action> that changed.
     */
    updateClients(action, field) {
        const clients = this.pvt.#clients[action.name];
        if (Array.isArray(clients)) {
            for (let client of clients) {
                client.cla$$.setActionMappedField(client, field, action[field]);
            }
        }
    }

    /**
     * Adds a client HTML element to the list of HTML elements to be updated
     * when any attributes of the action changes.
     * @param {TagBase} client The custom HTML element being registered to use
     * a given action.
     * @param {string} actionName The name of the action that client is
     * registering to use.
     */
    registerActionClient(client, actionName) {
        const clients = this.pvt.#clients;
        if (!(actionName in clients)) {
            clients[actionName] = [];
        }
        if (!clients[actionName].includes(client)) {
            clients[actionName].push(client);
            this.pvt.#prot.refreshClient(client, actionName);
        }
    }

    /**
     * Removes a client HTML element from the list of HTML elements to be
     * updated when any attributes of the action changes.
     * @param {TagBase} client The custom HTML element being unregistered from
     * a given action.
     * @param {string} actionName The name of the action that client is
     * unregistering from.
     */
    unregisterActionClient(client, actionName) {
        const clients = this.pvt.#clients;
        if (actionName in clients) {
            clients.actionName = clients.actionName.filter(c => c != client);
        }
    }
};
