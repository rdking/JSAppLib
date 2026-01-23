import { share, saveSelf } from '../../../node_modules/cfprotected/index.mjs';
import BigNumber from './BigNumber.mjs';
import BigFixed from './BigFixed.mjs';

/**
 * @class BigFloat
 * @extends BigNumber
 * @summary An arbitrary-precision floating-point number implementation.
 * @description Represents numbers as a BigInt mantissa and a BigInt exponent,
 * allowing for calculations far beyond the limits of standard JavaScript numbers.
 */
export default class BigFloat extends BigNumber {
    static #spvt = share(this, {
        defaultPrecision: 50
    });

    static {
        saveSelf(this, "$");
    }

    // Internal representation: mantissa * (10n ** exponent)
    #mantissa;
    #exponent;

    #pvt = share(this, BigFloat, {
        add(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const commonExponent = this.$.#exponent < other.$.#exponent ? this.$.#exponent : other.$.#exponent;

            const thisMantissa = this.$.#mantissa * (10n ** (this.$.#exponent - commonExponent));
            const otherMantissa = other.$.#mantissa * (10n ** (other.$.#exponent - commonExponent));

            return new BigFloat(thisMantissa + otherMantissa, commonExponent);
        },
        subtract(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const commonExponent = this.$.#exponent < other.$.#exponent ? this.$.#exponent : other.$.#exponent;

            const thisMantissa = this.$.#mantissa * (10n ** (this.$.#exponent - commonExponent));
            const otherMantissa = other.$.#mantissa * (10n ** (other.$.#exponent - commonExponent));

            return new BigFloat(thisMantissa - otherMantissa, commonExponent);
        },
        multiply(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const newMantissa = this.$.#mantissa * other.$.#mantissa;
            const newExponent = this.$.#exponent + other.$.#exponent;

            return new BigFloat(newMantissa, newExponent);
        },
        divide(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }
            
            if (other.$.#mantissa === 0n) {
                throw new Error("Division by zero");
            }

            const precision = BigInt(BigFloat.defaultPrecision);
            const scaledMantissa = this.$.#mantissa * (10n ** precision);
            
            const newMantissa = scaledMantissa / other.$.#mantissa;
            const newExponent = this.$.#exponent - other.$.#exponent - precision;

            return new BigFloat(newMantissa, newExponent);
        },
        remainder(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }
            // Not typically well-defined for floating point numbers
            throw new Error("Remainder operation is not supported for BigFloat");
        },
        pow(exponent) {
            if (exponent instanceof BigFixed) { exponent = new BigFloat(exponent.toString()); }

            if (exponent.$.#exponent !== 0n) {
                throw new Error("pow() with fractional exponents is not supported.");
            }

            let exp = exponent.$.#mantissa;
            let res = new BigFloat(1);
            let base = this;

            if (exp < 0n) {
                base = new BigFloat(1).divide(this);
                exp = -exp;
            }

            while (exp > 0n) {
                if (exp % 2n === 1n) {
                    res = res.multiply(base);
                }
                base = base.multiply(base);
                exp /= 2n;
            }

            return res;
        },
        negate() {
            return new BigFloat(-this.$.#mantissa, this.$.#exponent);
        },
        abs() {
            return new BigFloat(this.$.#mantissa < 0n ? -this.$.#mantissa : this.$.#mantissa, this.$.#exponent);
        },
        compareTo(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            // Easy cases:
            if (this.$.#mantissa === 0n && other.$.#mantissa === 0n) return 0;
            if (this.$.#mantissa === 0n) return other.$.#mantissa > 0n ? -1 : 1;
            if (other.$.#mantissa === 0n) return this.$.#mantissa > 0n ? 1 : -1;

            const thisSign = this.$.#mantissa > 0n ? 1 : -1;
            const otherSign = other.$.#mantissa > 0n ? 1 : -1;
            if (thisSign !== otherSign) return thisSign > otherSign ? 1 : -1;

            // Signs are the same. Compare absolute values.
            const expDiff = this.$.#exponent - other.$.#exponent;

            let thisMantissa = this.$.#mantissa;
            let otherMantissa = other.$.#mantissa;

            if (expDiff > 0) { // this.exponent is larger, scale this.mantissa up
                thisMantissa *= (10n ** expDiff);
            } else if (expDiff < 0) { // other.exponent is larger, scale other.mantissa up
                otherMantissa *= (10n ** (-expDiff));
            }

            let result = 0;
            if (thisMantissa > otherMantissa) {
                result = thisSign;
            } else if (thisMantissa < otherMantissa) {
                result = -thisSign;
            }
            return result;
        },
        toString() {
            const sign = this.$.#mantissa < 0n ? '-' : '';
            const mantissaStr = (this.$.#mantissa < 0n ? -this.$.#mantissa : this.$.#mantissa).toString();
            
            let result;
            if (this.$.#exponent === 0n) {
                result = sign + mantissaStr;
            } else if (this.$.#exponent > 0n) {
                result = sign + mantissaStr + '0'.repeat(Number(this.$.#exponent));
            } else {
                // exponent is negative
                const decimalPlaces = Number(-this.$.#exponent);
                if (decimalPlaces >= mantissaStr.length) {
                    const zeros = '0'.repeat(decimalPlaces - mantissaStr.length);
                    result = sign + '0.' + zeros + mantissaStr;
                } else {
                    const insertPos = mantissaStr.length - decimalPlaces;
                    result = sign + mantissaStr.slice(0, insertPos) + '.' + mantissaStr.slice(insertPos);
                }
            }
            return result;
        },
        valueOf() {
            return Number(this.$.#pvt.toString());
        }
    });

    /**
     * @constructor
     * @param {BigFloat | number | string | bigint} value The initial value. Can be another BigFloat, a number, a string representation, or a BigInt.
     * @param {number | string | bigint} [exponent=null] The exponent, if `value` is the mantissa.
     */
    constructor(value, exponent = null) {
        super();
        saveSelf(this, "$");

        let tempMantissa;
        let tempExponent;

        if (value instanceof BigFloat && exponent === null) {
            tempMantissa = value.$.#mantissa;
            tempExponent = value.$.#exponent;
        } else if (exponent !== null) {
            tempMantissa = BigInt(value);
            tempExponent = BigInt(exponent);
        } else if (typeof value === 'string') {
            if (value.includes('e')) {
                let [mantissaStr, expStr] = value.split('e');
                tempExponent = BigInt(expStr);
                if (mantissaStr.includes('.')) {
                    const decimalPlaces = mantissaStr.length - mantissaStr.indexOf('.') - 1;
                    tempMantissa = BigInt(mantissaStr.replace('.', ''));
                    tempExponent -= BigInt(decimalPlaces);
                } else {
                    tempMantissa = BigInt(mantissaStr);
                }
            } else if (value.includes('.')) {
                const decimalPlaces = value.length - value.indexOf('.') - 1;
                tempMantissa = BigInt(value.replace('.', ''));
                tempExponent = -BigInt(decimalPlaces);
            } else {
                tempMantissa = BigInt(value);
                tempExponent = 0n;
            }
        } else if (typeof value === 'number') {
            // This is tricky and can lose precision for very large/small numbers.
            // Converting to string is a safe way to handle it.
            const temp = new BigFloat(value.toString());
            tempMantissa = temp.$.#mantissa;
            tempExponent = temp.$.#exponent;
        } else {
            tempMantissa = BigInt(value);
            tempExponent = 0n;
        }
        
        this.#mantissa = tempMantissa;
        this.#exponent = tempExponent;

        this.#normalize();
    }

    #normalize() {
        if (this.$.#mantissa === 0n) {
            this.#exponent = 0n;
        } else {
            while (this.$.#mantissa % 10n === 0n && this.$.#mantissa !== 0n) {
                this.#mantissa /= 10n;
                this.#exponent++;
            }
        }
    }
    
    /**
     * @summary Gets the default precision (number of decimal places) for division operations.
     * @type {number}
     */
    static get defaultPrecision() {
        return this.$.#spvt.defaultPrecision;
    }

    /**
     * @summary Sets the default precision (number of decimal places) for division operations.
     * @type {number}
     */
    static set defaultPrecision(value) {
        this.$.#spvt.defaultPrecision = value;
    }

    /**
     * @summary The mantissa of the floating point number.
     * @description The integer part of the number before applying the exponent.
     * @type {bigint}
     * @readonly
     */
    get mantissa() {
        return this.$.#mantissa;
    }

    /**
     * @summary The exponent of the floating point number.
     * @description The power of 10 to apply to the mantissa.
     * @type {bigint}
     * @readonly
     */
    get exponent() {
        return this.$.#exponent;
    }
}
