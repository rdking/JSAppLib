import { final, saveSelf } from "/node_modules/cfprotected/index.mjs";

const Semaphore = final(class Semaphore {
    #locked = false;

    constructor() {
        saveSelf(this, "pvt");
    }

    lock(onSuccess, onFailure) {
        if (!this.pvt.#locked) {
            if (typeof(onSuccess) !== "function") {
                throw new TypeError("Expected onSuccess to be a function");
            }
            this.pvt.#locked = true;
            onSuccess();
            this.pvt.#locked = false;
        }
        else if (typeof(onFailure) === "function") {
            onFailure();
        }
    }
});

export default Semaphore;
