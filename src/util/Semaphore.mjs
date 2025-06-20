import { final, saveSelf } from "../../../cfprotected/index.mjs";

const Semaphore = final(class Semaphore {
    #locked = false;

    constructor() {
        saveSelf(this, "$");
    }

    lock(onSuccess, onFailure) {
        if (!this.$.#locked) {
            if (typeof(onSuccess) !== "function") {
                throw new TypeError("Expected onSuccess to be a function");
            }
            this.$.#locked = true;
            onSuccess();
            this.$.#locked = false;
        }
        else if (typeof(onFailure) === "function") {
            onFailure();
        }
    }
});

export default Semaphore;
