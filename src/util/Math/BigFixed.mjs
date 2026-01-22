import { share, saveSelf } from '../../../node_modules/cfprotected/index.mjs';
import BigNumber from './BigNumber.mjs';
import BigFloat from './BigFloat.mjs';

// BigFixed is a fixed-point decimal number implementation.
// It uses a single scaled BigInt to store its value.
// For a value V and a precision P, the internal scaled value is V * (10 ** P).

export default class BigFixed extends BigNumber {
    static {
        saveSelf(this, "$");
    }

    // Default precision (number of decimal places)
    static defaultPrecision = 18;

    #scaledValue; // The entire number stored as a scaled BigInt
    #precision;

    // --- Private Methods ---
    #rescale(newPrecision) {
        if (newPrecision === this.#precision) {
            return this;
        }
        const precisionDiff = BigInt(newPrecision - this.#precision);
        let newScaledValue;
        if (precisionDiff > 0n) {
            newScaledValue = this.#scaledValue * (10n ** precisionDiff);
        } else {
            newScaledValue = this.#scaledValue / (10n ** -precisionDiff);
        }
        return new BigFixed(newScaledValue, newPrecision);
    }

    // --- Protected Methods ---
    #pvt = share(this, BigFixed, {
        add(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).add(other);
            }
            const resultPrecision = Math.max(this.#precision, other.#precision);
            const s1 = this.#rescale(resultPrecision).#scaledValue;
            const s2 = other.#rescale(resultPrecision).#scaledValue;
            return new BigFixed(s1 + s2, resultPrecision);
        },
        subtract(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).subtract(other);
            }
            const resultPrecision = Math.max(this.#precision, other.#precision);
            const s1 = this.#rescale(resultPrecision).#scaledValue;
            const s2 = other.#rescale(resultPrecision).#scaledValue;
            return new BigFixed(s1 - s2, resultPrecision);
        },
        multiply(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).multiply(other);
            }
            const p1 = this.#precision;
            const p2 = other.#precision;
            const interimScaled = this.#scaledValue * other.#scaledValue;
            const interimPrecision = p1 + p2;
            
            const resultPrecision = Math.max(p1, p2);
            const scaleDownFactor = 10n ** BigInt(interimPrecision - resultPrecision);

            return new BigFixed(interimScaled / scaleDownFactor, resultPrecision);
        },
        divide(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).divide(other);
            }
            if (other.#scaledValue === 0n) {
                throw new Error("Division by zero");
            }
            const p1 = this.#precision;
            const p2 = other.#precision;
            const resultPrecision = Math.max(p1, p2);

            const scaleUpFactor = 10n ** BigInt(resultPrecision - p1 + p2);
            const newScaledValue = (this.#scaledValue * scaleUpFactor) / other.#scaledValue;

            return new BigFixed(newScaledValue, resultPrecision);
        },
        remainder(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).remainder(other);
            }
            const resultPrecision = Math.max(this.#precision, other.#precision);
            const s1 = this.#rescale(resultPrecision).#scaledValue;
            const s2 = other.#rescale(resultPrecision).#scaledValue;
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
            let res = new BigFixed('1', this.#precision);
            let base = this;

            if (exp < 0n) {
                base = new BigFixed('1', this.#precision).divide(this);
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
            return new BigFixed(-this.#scaledValue, this.#precision);
        },
        abs() {
            return new BigFixed(this.#scaledValue < 0n ? -this.#scaledValue : this.#scaledValue, this.#precision);
        },
        compareTo(other) {
            if (other instanceof BigFloat) {
                return new BigFloat(this.toString()).compareTo(other);
            }
            const resultPrecision = Math.max(this.#precision, other.#precision);
            const s1 = this.#rescale(resultPrecision).#scaledValue;
            const s2 = other.#rescale(resultPrecision).#scaledValue;

            if (s1 > s2) return 1;
            if (s1 < s2) return -1;
            return 0;
        },
        toString() {
            const scalingFactor = 10n ** BigInt(this.#precision);
            const sign = this.#scaledValue < 0n ? '-' : '';
            const absValue = this.#scaledValue < 0n ? -this.#scaledValue : this.#scaledValue;
            
            const wholePart = absValue / scalingFactor;
            const fractionalPart = (absValue % scalingFactor).toString().padStart(this.#precision, '0');

            const trimmedFractional = fractionalPart.replace(/0+$/, '');

            if (trimmedFractional === '') {
                return sign + wholePart.toString();
            }

            return sign + wholePart.toString() + '.' + trimmedFractional;
        },
        valueOf() {
            return Number(this.$.#pvt.toString());
        }
    });

    constructor(value, precision = BigFixed.defaultPrecision) {
        super();
        saveSelf(this, "$");

        this.#precision = precision;
        
        if (value instanceof BigFixed) {
            this.#scaledValue = value.#rescale(this.#precision).#scaledValue;
            return;
        }

        // Internal constructor for operations that provide a pre-scaled value
        if (typeof value === 'bigint') {
            this.#scaledValue = value;
            return;
        }
        
        const str = String(value);
        const [wholeStr, fracStr = ''] = str.split('.');
        const scalingFactor = 10n ** BigInt(this.#precision);

        const whole = BigInt(wholeStr);
        const paddedFrac = fracStr.padEnd(this.#precision, '0').slice(0, this.#precision);
        const fractional = BigInt(paddedFrac);

        if (whole < 0n || str.startsWith('-')) {
            this.#scaledValue = (whole * scalingFactor) - fractional;
        } else {
            this.#scaledValue = (whole * scalingFactor) + fractional;
        }
    }

    // Public getters for inspection
    get scaledValue() {
        return this.#scaledValue;
    }

    get precision() {
        return this.#precision;
    }
}

