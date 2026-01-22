import { saveSelf } from "../../node_modules/cfprotected/index.mjs";

export default class WaitBox {
    #queue = [];
    #triggered = false;
    #processing = false;

    constructor() {
        saveSelf(this, "$");
    }

    add(inst, method, params) {
        if ((inst === null) ||
            (params === null) ||
            (typeof(method) != "function") ||
            ((inst !== void 0) && (typeof(inst) != "object")) ||
            ((params !== void 0) && !Array.isArray(params))) {
            throw new TypeError("Invalid parameters to WaitBox.add");
        }

        this.$.#queue.push({ inst, method, params });

        //If the trigger has already been called, go ahead and run it immediately.
        if (this.$.#triggered && !this.$.#processing) {
            this.trigger();
        }
    }

    get ready() { return !!this.$.#triggered; }

    trigger() {
        if (!this.$.#processing) {
            this.$.#processing = true;
            try {
                this.$.#triggered = true;
                const itemsToProcess = this.$.#queue;
                this.$.#queue = []; // Clear the queue before processing

                // Process only the items that were in the queue when trigger was called.
                for (const { inst, method, params } of itemsToProcess) {
                    method.apply(inst, params);
                }
            }
            finally {
                this.$.#processing = false;
            }
        }
    }
}
