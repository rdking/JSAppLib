import { share, saveSelf, abstract, accessor } from "../../node_modules/cfprotected/index.mjs";

/**
 * @summary A simple function self-reference contract.
 * @description Just a super basic way to assure that your function class is 
 * bound to itself so calls to the core function have access to `this`.
 */
const BoundFunction = abstract(class _BoundFunction extends Function{
    static {
        saveSelf(this, "$");
    }

    constructor(fn) {
        super("", "");
        let retval = fn.bind(fn);
        Object.defineProperty(fn, "_", {value: retval});
        
        const proto = Object.getPrototypeOf(this);
        Object.defineProperty(retval, "prototype", { value: new.target.prototype });
        Object.setPrototypeOf(retval, proto);
        //saveSelf(retval, "$");
        if (!retval.cla$$) throw "Dah, which way did it go, George?!!!!";
        return retval;
    }
});

/**
 * @summary A functional CSS selector builder.
 * @description This class enables a DSL for defining CSS selectors using 
 * tagged template literals and fluent method chaining. Instances are 
 * callable functions that return new instances with appended selector segments.
 */
const SelectorBuilder = abstract(class SelectorBuilder extends BoundFunction {
    #value = "";

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
     */
    constructor(initialValue = "") {
        // let fnBody = SelectorBuilder.#cssTag.toString();
        // fnBody = fnBody.substring(fnBody.indexOf("{") + 1, fnBody.lastIndexOf("}")).trim();
        // // Clean coverage artifacts
        // fnBody = fnBody.replace(/cov_[a-z0-9]+(\(\))?\.[a-z](\[\d+\])+\+\+;?/gi, "");
        // super('strings', '...values', fnBody);

        /**
         * @summary The function logic used for the tag function implementation.
         * @param {Array<string>} strings 
         * @param  {...any} values 
         * @returns {SelectorBuilder}
         * @private
         */
        function cssTag(strings, ...values) {
            const self = this._;
            let segment = strings;
            if (Array.isArray(strings) && Array.isArray(strings.raw)) {
                segment = strings.reduce((acc, str, i) => {
                    return acc + str + (values[i] ?? "");
                }, "");
            }

            return new self.cla$$(self.valueOf() + segment);
        };

        super(cssTag);
        saveSelf(this, "$");

        this.#value = initialValue;
    }

    /**
     * @returns {string} The accumulated CSS selector string.
     */
    valueOf() {
        return this.$.#value;
    }

    /**
     * Adds a pseudo-class or pseudo-element.
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    Is(selector) {
        return new this.cla$$(this.valueOf() + selector.valueOf());
    }

    /**
     * Alias for Is()
     * @param {string|SelectorBuilder} selector
     * @returns {SelectorBuilder}
     */
    Where(selector) {
        return this.Is(selector);
    }

    /**
     * Adds a child combinator ('>').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    Child(selector) {
        const val = selector?.valueOf() ?? "";
        return new this.cla$$(`${this.valueOf()} > ${val}`.trim());
    }

    /**
     * Adds a descendant combinator (' ').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    Descendant(selector) {
        const val = selector?.valueOf() ?? "";
        return new this.cla$$(`${this.valueOf()} ${val}`.trim());
    }

    /**
     * Adds a sibling combinator ('~').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    Sibling(selector) {
        const val = selector?.valueOf() ?? "";
        return new this.cla$$(`${this.valueOf()} ~ ${val}`.trim());
    }

    /**
     * Adds an adjacent sibling combinator ('+').
     * @param {string|SelectorBuilder} selector 
     * @returns {SelectorBuilder}
     */
    Adjacent(selector) {
        const val = selector?.valueOf() ?? "";
        return new this.cla$$(`${this.valueOf()} + ${val}`.trim());
    }

    /**
     * Adds an attribute selector.
     * @param {string} name 
     * @param {string} [op]
     * @param {string} [value] 
     * @returns {SelectorBuilder}
     */
    Attr(name, op, value) {
        let attr = `[${name}`;
        if (op && value !== undefined) {
            attr += `${op}"${value}"`;
        }
        attr += "]";
        return new this.cla$$(this.valueOf() + attr);
    }
});

export default SelectorBuilder;