import { share, saveSelf, accessor, abstract, final } from "../../../cfprotected/index.mjs";

export default class WaitBox {
    #queue = [];

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
    }

    get ready() { return !!this.$.#queue.length; }

    trigger() {
        let queue = this.$.#queue;

        while (queue.length) {
            let { inst, method, params } = queue.shift();
            method.apply(inst, params);
        }

        this.$.#queue.length = 0;
    }
}
