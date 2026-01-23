import { share, saveSelf } from '../../../node_modules/cfprotected/index.mjs';
import BigNumber from './BigNumber.mjs';
import BigFloat from './BigFloat.mjs';

/**
 * @class BigFixed
 * @extends BigNumber
 * @summary An arbitrary-precision fixed-point decimal number implementation.
 * @description Uses a single scaled BigInt to store its value, representing V * (10 ** P)
 * for a value V and a precision P.
 */
export default class BigFixed extends BigNumber {
    static #spvt = share(this, {
        defaultPrecision: 18
    });
    
    static {
        saveSelf(this, "$");
    }

    #scaledValue; // The entire number stored as a scaled BigInt
    #precision;

    // --- Private Methods ---
    #rescale(newPrecision) {
        let result;
        if (newPrecision === this.$.#precision) {
            result = this;
        } else {
            const precisionDiff = BigInt(newPrecision - this.$.#precision);
            let newScaledValue;
            if (precisionDiff > 0n) {
                newScaledValue = this.$.#scaledValue * (10n ** precisionDiff);
            } else {
                newScaledValue = this.$.#scaledValue / (10n ** -precisionDiff);
            }
            result = new BigFixed(newScaledValue, newPrecision);
        }
        return result;
    }

    // --- Protected Methods ---
    #pvt = share(this, BigFixed, {
        add(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).add(other);
            }
            const resultPrecision = Math.max(this.$.#precision, other.$.#precision);
            const s1 = this.$.#rescale(resultPrecision).$.#scaledValue;
            const s2 = other.#rescale(resultPrecision).$.#scaledValue;
            return new BigFixed(s1 + s2, resultPrecision);
        },
        subtract(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).subtract(other);
            }
            const resultPrecision = Math.max(this.$.#precision, other.$.#precision);
            const s1 = this.$.#rescale(resultPrecision).$.#scaledValue;
            const s2 = other.#rescale(resultPrecision).$.#scaledValue;
            return new BigFixed(s1 - s2, resultPrecision);
        },
        multiply(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).multiply(other);
            }
            const p1 = this.$.#precision;
            const p2 = other.$.#precision;
            const interimScaled = this.$.#scaledValue * other.$.#scaledValue;
            const interimPrecision = p1 + p2;
            
            const resultPrecision = Math.max(p1, p2);
            const scaleDownFactor = 10n ** BigInt(interimPrecision - resultPrecision);

            return new BigFixed(interimScaled / scaleDownFactor, resultPrecision);
        },
        divide(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).divide(other);
            }
            if (other.$.#scaledValue === 0n) {
                throw new Error("Division by zero");
            }
            const p1 = this.$.#precision;
            const p2 = other.$.#precision;
            const resultPrecision = Math.max(p1, p2);

            const scaleUpFactor = 10n ** BigInt(resultPrecision - p1 + p2);
            const newScaledValue = (this.$.#scaledValue * scaleUpFactor) / other.$.#scaledValue;

            return new BigFixed(newScaledValue, resultPrecision);
        },
        remainder(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).remainder(other);
            }
            const resultPrecision = Math.max(this.$.#precision, other.$.#precision);
            const s1 = this.$.#rescale(resultPrecision).$.#scaledValue;
            const s2 = other.#rescale(resultPrecision).$.#scaledValue;
            return new BigFixed(s1 % s2, resultPrecision);
        },
        pow(exponent) {
            if (exponent instanceof BigFloat) {
                return new BigFloat(this.toString()).pow(exponent);
            }
            const expInt = BigInt(exponent.toString().split('.')[0]); // Treat exponent as integer
            if (exponent.compareTo(new BigFixed(expInt.toString())) !== 0) {
                 throw new Error("pow() with fractional exponents is not supported for BigFixed.");
            }

            let exp = expInt;
            let res = new BigFixed('1', this.$.#precision);
            let base = this;

            if (exp < 0n) {
                base = new BigFixed('1', this.$.#precision).divide(this);
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
            return new BigFixed(-this.$.#scaledValue, this.$.#precision);
        },
        abs() {
            return new BigFixed(this.$.#scaledValue < 0n ? -this.$.#scaledValue : this.$.#scaledValue, this.$.#precision);
        },
        compareTo(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).compareTo(other);
            }
            const resultPrecision = Math.max(this.$.#precision, other.$.#precision);
            const s1 = this.$.#rescale(resultPrecision).$.#scaledValue;
            const s2 = other.#rescale(resultPrecision).$.#scaledValue;
            
            let result = 0;
            if (s1 > s2) {
                result = 1;
            } else if (s1 < s2) {
                result = -1;
            }
            return result;
        },
        toString() {
            const scalingFactor = 10n ** BigInt(this.$.#precision);
            const sign = this.$.#scaledValue < 0n ? '-' : '';
            const absValue = this.$.#scaledValue < 0n ? -this.$.#scaledValue : this.$.#scaledValue;
            
            const wholePart = absValue / scalingFactor;
            const fractionalPart = (absValue % scalingFactor).toString().padStart(this.$.#precision, '0');

            const trimmedFractional = fractionalPart.replace(/0+$/, '');

            let result = sign + wholePart.toString();
            if (trimmedFractional !== '') {
                result += '.' + trimmedFractional;
            }
            return result;
        },
        valueOf() {
            return Number(this.$.#pvt.toString());
        }
    });

    /**
     * @constructor
     * @param {BigFixed | bigint | number | string} value The initial value. Can be another BigFixed, a pre-scaled BigInt, a number, or a string.
     * @param {number} [precision=BigFixed.defaultPrecision] The number of decimal places.
     */
    constructor(value, precision) {
        super();
        saveSelf(this, "$");

        const finalPrecision = (precision === undefined) ? BigFixed.defaultPrecision : precision;
        this.#precision = finalPrecision;
        
        let finalScaledValue;
        if (value instanceof BigFixed) {
            finalScaledValue = value.#rescale(finalPrecision).$.#scaledValue;
        } else if (typeof value === 'bigint') {
            finalScaledValue = value;
        } else {
            const str = String(value);
            const [wholeStr, fracStr = ''] = str.split('.');
            const scalingFactor = 10n ** BigInt(finalPrecision);

            const whole = BigInt(wholeStr);
            const paddedFrac = fracStr.padEnd(finalPrecision, '0').slice(0, finalPrecision);
            const fractional = BigInt(paddedFrac);

            if (whole < 0n || str.startsWith('-')) {
                finalScaledValue = (whole * scalingFactor) - fractional;
            } else {
                finalScaledValue = (whole * scalingFactor) + fractional;
            }
        }
        this.#scaledValue = finalScaledValue;
    }

    /**
     * @summary Gets the default precision (number of decimal places).
     * @type {number}
     */
    static get defaultPrecision() {
        return this.$.#spvt.defaultPrecision;
    }

    /**
     * @summary Sets the default precision (number of decimal places).
     * @type {number}
     */
    static set defaultPrecision(value) {
        this.$.#spvt.defaultPrecision = value;
    }

    /**
     * @summary The internal scaled BigInt value.
     * @type {bigint}
     * @readonly
     */
    get scaledValue() {
        return this.$.#scaledValue;
    }

    /**
     * @summary The number of decimal places for this instance.
     * @type {number}
     * @readonly
     */
    get precision() {
        return this.$.#precision;
    }
}

