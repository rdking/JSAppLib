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
        super(name, initfn, "initfn", "name", "value", fn);
    }
}

export default class Enum extends EnumBase {
    #keys = [];
    #values = [];

    static #EnumType(kv) {
        let retval;
        if (kv instanceof this) {
            retval = this[kv.name];
        }
        else if (this.#keys.includes(kv)) {
            retval = this[kv];
        }
        else if (this.#values.includes(kv)) {
            let index = this.#values.indexOf(kv);
            retval = this[this.#keys[index]];
        }
        else {
            throw new TypeError('No matching enum value found');
        }
        
        return retval;
    }

    [Symbol.hasInstance](inst) {
        return inst && (typeof(inst) == "object") 
            && ("name" in inst) && ("value" in inst)
            && (Object.getPrototypeOf(inst) == null)
            && this.pvt.#keys.includes(inst.name)
            && this.pvt.#values.includes(inst.value)
            && (this.pvt[inst.name].value === inst.value);
    }

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
            this.#keys.push(key);
            this.#values.push(value);
            this[key] = new this(key, value);
        }

        let bound = this.bound;
        delete this.bound;
        Object.freeze(bound);
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}
