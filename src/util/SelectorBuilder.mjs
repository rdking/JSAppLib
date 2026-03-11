import { share, saveSelf, abstract, accessor } from "../../node_modules/cfprotected/index.mjs";

/**
 * @summary A simple function self-reference contract.
 * @description Just a super basic way to assure that your function class is 
 * bound to itself so calls to the core function have access to `this`.
 */
const BoundFunction = abstract(class _BoundFunction extends Function {
    static {
        saveSelf(this, "$");
    }

    constructor(fn) {
        super("", "");
        let retval = fn.bind(fn);
        Object.defineProperty(fn, "_", { value: retval });

        const proto = Object.getPrototypeOf(this);
        Object.defineProperty(retval, "prototype", { value: new.target.prototype });
        Object.setPrototypeOf(retval, proto);
        
        if (!retval.cla$$) throw "Dah, which way did it go, George?!!!!";
        return retval;
    }
});

/**
 * @summary A functional CSS selector builder.
 * @description This class enables a DSL for defining CSS selectors using 
 * function calls and fluent method chaining. Instances are callable 
 * functions that return new instances with appended or wrapped selector segments.
 */
const SelectorBuilder = abstract(class SelectorBuilder extends BoundFunction {
    #value = "";
    #wrapPrefix = "";
    #wrapSuffix = "";
    #transformer = null;

    static {
        saveSelf(this, "$");
    }

    #pvt = share(this, SelectorBuilder, {
        value: accessor({
            get() { return this.$.#value; },
            set(v) { this.$.#value = v; }
        })
    });

    /**
     * @param {string} initialValue The starting CSS selector string.
     * @param {string} wrapPrefix Optional prefix for wrapping function call arguments.
     * @param {string} wrapSuffix Optional suffix for wrapping function call arguments.
     * @param {Function} transformer Optional function to transform arguments before wrapping.
     */
    constructor(initialValue = "", wrapPrefix = "", wrapSuffix = "", transformer = null) {
        /**
         * @summary The function logic used for instance calls.
         * @param {Array<string>|string} strings 
         * @param  {...any} values 
         * @returns {SelectorBuilder}
         * @private
         */
        function callHandler(strings, ...values) {
            const self = this._;
            let segment = "";

            if (Array.isArray(strings) && Array.isArray(strings.raw)) {
                // Tagged Template mode
                segment = strings.reduce((acc, str, i) => {
                    return acc + str + (values[i] ?? "");
                }, "");
            } else {
                // Standard function mode
                segment = [strings, ...values].join("");
            }

            if (self.#transformer) {
                segment = self.#transformer(segment);
            }

            if (self.#wrapPrefix) {
                segment = self.#wrapPrefix + segment + self.#wrapSuffix;
            }

            return new self.cla$$(self.valueOf() + segment);
        }

        super(callHandler);
        saveSelf(this, "$");

        this.#value = initialValue;
        this.#wrapPrefix = wrapPrefix;
        this.#wrapSuffix = wrapSuffix;
        this.#transformer = transformer;
    }

    /**
     * @returns {string} The accumulated CSS selector string.
     */
    valueOf() {
        return this.$.#value;
    }

    /**
     * @returns {string} The accumulated CSS selector string.
     */
    toString() {
        return this.$.#value;
    }

    /**
     * Adds a pseudo-class or pseudo-element.
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    IS(selector) {
        const other = (typeof selector === 'string') ? new this.cla$$(selector) : selector;
        return new this.cla$$(this.valueOf() + other.valueOf(), other.#wrapPrefix, other.#wrapSuffix);
    }

    /**
     * Alias for IS()
     * @param {string|SelectorBuilder} selector
     * @returns {SelectorBuilder}
     */
    WHERE(selector) {
        return this.IS(selector);
    }

    /**
     * Adds a child combinator ('>').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    CHILD(selector) {
        const other = (typeof selector === 'string') ? new this.cla$$(selector) : selector;
        const segment = (this.valueOf() ? " > " : ">") + other.valueOf();
        return new this.cla$$(this.valueOf() + segment, other.#wrapPrefix, other.#wrapSuffix);
    }

    /**
     * Adds a descendant combinator (' ').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    DESCENDANT(selector) {
        const other = (typeof selector === 'string') ? new this.cla$$(selector) : selector;
        const segment = (this.valueOf() ? " " : "") + other.valueOf();
        return new this.cla$$(this.valueOf() + segment, other.#wrapPrefix, other.#wrapSuffix);
    }

    /**
     * Adds a sibling combinator ('~').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    SIBLING(selector) {
        const other = (typeof selector === 'string') ? new this.cla$$(selector) : selector;
        const segment = (this.valueOf() ? " ~ " : "~") + other.valueOf();
        return new this.cla$$(this.valueOf() + segment, other.#wrapPrefix, other.#wrapSuffix);
    }

    /**
     * Adds an adjacent sibling combinator ('+').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    ADJACENT(selector) {
        const other = (typeof selector === 'string') ? new this.cla$$(selector) : selector;
        const segment = (this.valueOf() ? " + " : "+") + other.valueOf();
        return new this.cla$$(this.valueOf() + segment, other.#wrapPrefix, other.#wrapSuffix);
    }

    /**
     * Adds an attribute selector.
     * @param {string} name 
     * @param {string|SelectorBuilder} [op]
     * @param {string} [value] 
     * @returns {SelectorBuilder}
     */
    ATTR(name, op, value) {
        let segment = name;
        if (op) {
            if (typeof op === 'string' && value !== undefined) {
                segment += `${op}"${value}"`;
            } else {
                segment += op.toString();
            }
        }
        return new this.cla$$(this.valueOf() + `[${segment}]`);
    }
});

export default SelectorBuilder;