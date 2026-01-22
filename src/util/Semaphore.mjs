import { final, saveSelf } from "../../node_modules/cfprotected/index.mjs";

const Semaphore = final(class Semaphore {
    #locked = false;
    #queue = [];

    constructor() {
        saveSelf(this, "$");
    }

    /**
     * @private
     * @returns {void}
     */
    #dispatch() {
        if (!this.$.#locked && this.$.#queue.length > 0) {
            this.$.#locked = true;
            const task = this.$.#queue.shift();
            
            // Yield to the event loop before executing the task. This prevents a
            // long chain of synchronous tasks from blocking the main thread, 
            // allowing other events (like new calls to lock()) to be processed.
            setTimeout(() => task(), 0);
        }
    }
    
    /**
     * @param {function} callback the callback to run
     * @returns {void}
     */
    lock(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        this.$.#queue.push(() => {
            try {
                callback();
            }
            finally {
                this.$.#locked = false;
                this.#dispatch();
            }
        });
        this.#dispatch();
    }

    /**
     * @param {function} callback the async callback to run
     * @returns {Promise<any>}
     */
    lockAsync(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        return new Promise((resolve, reject) => {
            this.$.#queue.push(async () => {
                try {
                    const result = await callback();
                    resolve(result);
                } catch(e) {
                    reject(e);
                }
                finally {
                    this.$.#locked = false;
                    this.#dispatch();
                }
            });
            this.#dispatch();
        });
    }
});

export default Semaphore;
