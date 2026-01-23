class BoundFunction extends Function {
    static {
        Object.defineProperty(this, "pvt", {value: this});
    }

    constructor(name, base, ...args) {
        super(...args);
        Object.defineProperties(this, {
            pvt: { configurable: true, value: this },
            name: { value: name },
        });
        let retval = Object.setPrototypeOf(this.bind(this, base), null);
        retval.bound = this;
        Object.defineProperty(this, "pvt", {value: retval});
        return retval;
    }
}


class EnumBase extends BoundFunction {
    static #create(initfn, name, value) {
        if (new.target) {
            if (!Object.isExtensible(new.target)) {
                throw new TypeError(`Cannot create new enum elements for this enum`);
            }
            Object.defineProperties(this, {
                name: {
                    enumerable: true,
                    value: name
                },
                value: {
                    enumerable: true,
                    value
                }
            });
            Object.setPrototypeOf(this, null);
            Object.freeze(this);
        }
        else {
            return initfn.call(this.pvt, name);
        }
    }

    constructor(name, initfn) {
        let fn = EnumBase.#create.toString();
        fn = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}")).trim();
        // Remove code coverage artifacts
        fn = fn.replace(/cov_[a-z0-9]+(\(\))?\.[a-z](\[\d+\])+\+\+;?/gi, "");
        super(name, initfn, "initfn", "name", "value", fn);
    }
}

/**
 * An enumeration creation class. Each Enum instance is itself an enum function
 * with the given members as direct members of the function. The function itself
 * can convert a non-enum value into the matching enum value for that type if 
 * the name or value matches.
 */
export default class Enum extends EnumBase {
    #keys = new Set();
    #valueMap = new Map(); // Maps value -> key

    static #EnumType(kv) {
        let retval;
        if (kv instanceof this) {
            retval = this[kv.name];
        }
        // O(1) lookup
        else if (this.#keys.has(kv)) {
            retval = this[kv];
        }
        // O(1) lookup
        else if (this.#valueMap.has(kv)) {
            const key = this.#valueMap.get(kv);
            retval = this[key];
        }
        else {
            throw new TypeError(`No matching enum value found for '${kv}' in enum '${this.name}'`);
        }
        
        return retval;
    }

    [Symbol.hasInstance](inst) {
        return inst && (typeof(inst) == "object") 
            && ("name" in inst) && ("value" in inst)
            && (Object.getPrototypeOf(inst) == null)
            // O(1) check
            && this.pvt.#keys.has(inst.name)
            // O(1) check
            && this.pvt.#valueMap.has(inst.value)
            && (this.pvt[inst.name].value === inst.value);
    }

    /**
     * Creates a new enum object of the given name using the object or array as members.
     * @param {String} name The name of this enum type.
     * @param {Array|Object} values An array of strings or an object of key/value pairs representing the enum members.
     * @returns {function} A new enum function.
     */
    constructor(name, values) {
        if (!(values && (typeof(values) == "object"))) {
            throw new TypeError("Values must be supplied by either an object or an array");
        }

        if (Array.isArray(values)) {
            //Convert the array to a name:index map
            values = values.reduce((retval, c, i) => {
                retval[c] = i;
                return retval;
            }, {});
        }
    
        super(name, Enum.#EnumType);

        for (let key in values) {
            const value = values[key];
            this.#keys.add(key);
            // Only map the first key found for a given value to preserve original logic.
            if (!this.#valueMap.has(value)) {
                this.#valueMap.set(value, key);
            }
            this[key] = new this(key, value);
        }

        let bound = this.bound;
        delete this.bound;
        Object.defineProperty(this, "name", { value: name, enumerable: false, configurable: false, writable: false});
        Object.freeze(bound);
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}
