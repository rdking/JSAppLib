import { share, saveSelf, abstract } from '../../../node_modules/cfprotected/index.mjs';

export default abstract(class BigNumber extends Number {
    static #spvt = share(this, {});

    static {
        saveSelf(this, "$");
    }

    #pvt = share(this, BigNumber, {
        // Protected abstract methods for descendants to implement
        add(other) { throw new TypeError("Abstract protected method: add"); },
        subtract(other) { throw new TypeError("Abstract protected method: subtract"); },
        multiply(other) { throw new TypeError("Abstract protected method: multiply"); },
        divide(other) { throw new TypeError("Abstract protected method: divide"); },
        remainder(other) { throw new TypeError("Abstract protected method: remainder"); },
        pow(exponent) { throw new TypeError("Abstract protected method: pow"); },
        negate() { throw new TypeError("Abstract protected method: negate"); },
        abs() { throw new TypeError("Abstract protected method: abs"); },
        compareTo(other) { throw new TypeError("Abstract protected method: compareTo"); },
        toString() { throw new TypeError("Abstract protected method: toString"); },
        valueOf() { throw new TypeError("Abstract protected method: valueOf"); }
    });

    constructor() {
        super();
        saveSelf(this, "$");
        if (new.target === BigNumber) {
            throw new TypeError("Cannot construct BigNumber instances directly");
        }
    }

    // --- Public API ---

    add(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.add(otherBn);
    }

    subtract(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.subtract(otherBn);
    }

    multiply(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.multiply(otherBn);
    }

    divide(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.divide(otherBn);
    }

    remainder(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.remainder(otherBn);
    }

    pow(exponent) {
        // Exponent might not need to be a BigNumber, but for consistency we can convert it.
        const otherBn = (exponent instanceof BigNumber) ? exponent : new this.constructor(exponent);
        return this.$.#pvt.pow(otherBn);
    }

    negate() {
        return this.$.#pvt.negate();
    }

    abs() {
        return this.$.#pvt.abs();
    }

    compareTo(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.compareTo(otherBn);
    }

    equals(other) {
        return this.compareTo(other) === 0;
    }

    greaterThan(other) {
        return this.compareTo(other) > 0;
    }

    lessThan(other) {
        return this.compareTo(other) < 0;
    }

    greaterThanOrEqual(other) {
        return this.compareTo(other) >= 0;
    }

    lessThanOrEqual(other) {
        return this.compareTo(other) <= 0;
    }

    toString() {
        return this.$.#pvt.toString();
    }

    valueOf() {
        return this.$.#pvt.valueOf();
    }

    static from(value) {
        return new this(value);
    }
    
    static add(a, b) { return new this(a).add(b); }
    static subtract(a, b) { return new this(a).subtract(b); }
    static multiply(a, b) { return new this(a).multiply(b); }
    static divide(a, b) { return new this(a).divide(b); }
    static remainder(a, b) { return new this(a).remainder(b); }
    static pow(base, exponent) { return new this(base).pow(exponent); }
    static compare(a, b) { return new this(a).compareTo(b); }
});
