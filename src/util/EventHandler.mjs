import { abstract, saveSelf } from "/node_modules/cfprotected/index.mjs";

let EventHandler = abstract(class EventHandler {
    static #ONCE = Symbol("ONCE");
    static { saveSelf(this, "pvt"); }

    #listenerMap = new Map();

    constructor() { saveSelf(this, "pvt"); }

    fireEvent(evtName, data) {
        let event = new CustomEvent(evtName, { detail: data });
        this.pvt.#listenerMap.forEach(mapping => {
            if (evtName in mapping) {
                mapping.boundFn(evtName, event);
            }
        });
    }

    addEventListener(name, fn) {
        let mapping = this.pvt.#listenerMap.get(fn) || { boundFn: fn.bind(), [name]: 0 };
        ++mapping[name];
        this.pvt.#listenerMap.set(fn, mapping);
    }

    addEventListenerOnce(name, fn) {
        const ONCE = EventHandler.pvt.#ONCE;
        let self = this;
        let oFn = function(...args) {
            let retval = fn.call(self, ...args);
            self.removeEventListener(name, oFn);
            return retval;
        };
        let once = fn[ONCE] || {};
        once[name] = oFn;
        fn[ONCE] = once;
        this.addEventListener(name, oFn);
    }
    
    removeEventListener(name, fn) {
        const ONCE = EventHandler.pvt.#ONCE;
        let mapping = this.pvt.#listenerMap.get(fn);
        fn = fn?.[ONCE]?.[name] ?? fn;  //get the Once function if it exists
        
        if (mapping && (name in mapping)) {
            --mapping[name];

            if (!mapping[name]) {
                delete mapping[name];

                if (Object.keys(mapping).length == 1) {
                    this.pvt.#listenerMap.delete(fn);
                }
            }
        }
    }
});

export default EventHandler;
