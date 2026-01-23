import { share, saveSelf, abstract } from '../../../node_modules/cfprotected/index.mjs';

/**
 * @class BigNumber
 * @extends Number
 * @abstract
 * @summary Provides a base for arbitrary-precision numeric types.
 * @description This is an abstract class and cannot be instantiated directly.
 * It defines a common interface for big number arithmetic operations.
 */
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

    /**
     * @constructor
     * @description Initializes a new instance of a BigNumber-derived class.
     * @throws {TypeError} if an attempt is made to construct a BigNumber instance directly.
     */
    constructor() {
        super();
        saveSelf(this, "$");
        if (new.target === BigNumber) {
            throw new TypeError("Cannot construct BigNumber instances directly");
        }
    }

    // --- Public API ---

    /**
     * Adds another BigNumber to this one.
     * @param {BigNumber | number | string} other The number to add.
     * @returns {BigNumber} A new BigNumber instance representing the sum.
     */
    add(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.add(otherBn);
    }

    /**
     * Subtracts another BigNumber from this one.
     * @param {BigNumber | number | string} other The number to subtract.
     * @returns {BigNumber} A new BigNumber instance representing the difference.
     */
    subtract(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.subtract(otherBn);
    }

    /**
     * Multiplies this BigNumber by another.
     * @param {BigNumber | number | string} other The number to multiply by.
     * @returns {BigNumber} A new BigNumber instance representing the product.
     */
    multiply(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.multiply(otherBn);
    }

    /**
     * Divides this BigNumber by another.
     * @param {BigNumber | number | string} other The number to divide by.
     * @returns {BigNumber} A new BigNumber instance representing the quotient.
     */
    divide(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.divide(otherBn);
    }

    /**
     * Calculates the remainder of a division.
     * @param {BigNumber | number | string} other The divisor.
     * @returns {BigNumber} A new BigNumber instance representing the remainder.
     */
    remainder(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.remainder(otherBn);
    }

    /**
     * Raises this BigNumber to the power of an exponent.
     * @param {BigNumber | number | string} exponent The exponent.
     * @returns {BigNumber} A new BigNumber instance representing the result.
     */
    pow(exponent) {
        // Exponent might not need to be a BigNumber, but for consistency we can convert it.
        const otherBn = (exponent instanceof BigNumber) ? exponent : new this.constructor(exponent);
        return this.$.#pvt.pow(otherBn);
    }

    /**
     * Returns a new BigNumber with the sign negated.
     * @returns {BigNumber} A new BigNumber instance with the opposite sign.
     */
    negate() {
        return this.$.#pvt.negate();
    }

    /**
     * Returns the absolute value of this BigNumber.
     * @returns {BigNumber} A new BigNumber instance representing the absolute value.
     */
    abs() {
        return this.$.#pvt.abs();
    }

    /**
     * Compares this BigNumber to another.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {number} -1 if this is less than other, 0 if equal, 1 if greater.
     */
    compareTo(other) {
        const otherBn = (other instanceof BigNumber) ? other : new this.constructor(other);
        return this.$.#pvt.compareTo(otherBn);
    }

    /**
     * Checks for equality with another BigNumber.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {boolean} True if the numbers are equal.
     */
    equals(other) {
        return this.compareTo(other) === 0;
    }

    /**
     * Checks if this BigNumber is greater than another.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {boolean} True if this number is greater.
     */
    greaterThan(other) {
        return this.compareTo(other) > 0;
    }

    /**
     * Checks if this BigNumber is less than another.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {boolean} True if this number is less.
     */
    lessThan(other) {
        return this.compareTo(other) < 0;
    }

    /**
     * Checks if this BigNumber is greater than or equal to another.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {boolean} True if this number is greater than or equal.
     */
    greaterThanOrEqual(other) {
        return this.compareTo(other) >= 0;
    }

    /**
     * Checks if this BigNumber is less than or equal to another.
     * @param {BigNumber | number | string} other The number to compare to.
     * @returns {boolean} True if this number is less than or equal.
     */
    lessThanOrEqual(other) {
        return this.compareTo(other) <= 0;
    }

    /**
     * Returns the string representation of this BigNumber.
     * @returns {string} The string representation.
     */
    toString() {
        return this.$.#pvt.toString();
    }

    /**
     * Returns the primitive number value of this BigNumber.
     * @returns {number} The primitive number value.
     */
    valueOf() {
        return this.$.#pvt.valueOf();
    }

    /**
     * Creates a new instance of the BigNumber-derived class from a value.
     * @param {any} value The initial value.
     * @returns {BigNumber} A new instance of the class.
     */
    static from(value) {
        return new this(value);
    }
    
    /**
     * @summary Static helper to add two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {BigNumber} The sum.
     */
    static add(a, b) { return new this(a).add(b); }
    /**
     * @summary Static helper to subtract two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {BigNumber} The difference.
     */
    static subtract(a, b) { return new this(a).subtract(b); }
    /**
     * @summary Static helper to multiply two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {BigNumber} The product.
     */
    static multiply(a, b) { return new this(a).multiply(b); }
    /**
     * @summary Static helper to divide two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {BigNumber} The quotient.
     */
    static divide(a, b) { return new this(a).divide(b); }
    /**
     * @summary Static helper to find the remainder of two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {BigNumber} The remainder.
     */
    static remainder(a, b) { return new this(a).remainder(b); }
    /**
     * @summary Static helper to raise a number to a power.
     * @param {BigNumber | number | string} base The base.
     * @param {BigNumber | number | string} exponent The exponent.
     * @returns {BigNumber} The result.
     */
    static pow(base, exponent) { return new this(base).pow(exponent); }
    /**
     * @summary Static helper to compare two numbers.
     * @param {BigNumber | number | string} a The first number.
     * @param {BigNumber | number | string} b The second number.
     * @returns {number} -1, 0, or 1.
     */
    static compare(a, b) { return new this(a).compareTo(b); }
});
