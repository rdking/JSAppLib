import { share, saveSelf } from '../../../node_modules/cfprotected/index.mjs';
import BigNumber from './BigNumber.mjs';
import BigFixed from './BigFixed.mjs';

export default class BigFloat extends BigNumber {
    static {
        saveSelf(this, "$");
    }

    // Default precision for division operations
    static defaultPrecision = 50;

    // Internal representation: mantissa * (10 ** exponent)
    #mantissa;
    #exponent;

    #pvt = share(this, BigFloat, {
        add(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const commonExponent = this.#exponent < other.#exponent ? this.#exponent : other.#exponent;

            const thisMantissa = this.#mantissa * (10n ** (this.#exponent - commonExponent));
            const otherMantissa = other.#mantissa * (10n ** (other.#exponent - commonExponent));

            return new BigFloat(thisMantissa + otherMantissa, commonExponent);
        },
        subtract(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const commonExponent = this.#exponent < other.#exponent ? this.#exponent : other.#exponent;

            const thisMantissa = this.#mantissa * (10n ** (this.#exponent - commonExponent));
            const otherMantissa = other.#mantissa * (10n ** (other.#exponent - commonExponent));

            return new BigFloat(thisMantissa - otherMantissa, commonExponent);
        },
        multiply(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            const newMantissa = this.#mantissa * other.#mantissa;
            const newExponent = this.#exponent + other.#exponent;

            return new BigFloat(newMantissa, newExponent);
        },
        divide(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }
            
            if (other.#mantissa === 0n) {
                throw new Error("Division by zero");
            }

            const precision = BigInt(BigFloat.defaultPrecision);
            const scaledMantissa = this.#mantissa * (10n ** precision);
            
            const newMantissa = scaledMantissa / other.#mantissa;
            const newExponent = this.#exponent - other.#exponent - precision;

            return new BigFloat(newMantissa, newExponent);
        },
        remainder(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }
            // Not typically well-defined for floating point numbers
            throw new Error("Remainder operation is not supported for BigFloat");
        },
        pow(exponent) {
            if (exponent instanceof BigFixed) { exponent = new BigFloat(exponent.toString()); }

            if (exponent.#exponent !== 0n) {
                throw new Error("pow() with fractional exponents is not supported.");
            }

            let exp = exponent.#mantissa;
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
            return new BigFloat(-this.#mantissa, this.#exponent);
        },
        abs() {
            return new BigFloat(this.#mantissa < 0n ? -this.#mantissa : this.#mantissa, this.#exponent);
        },
        compareTo(other) {
            if (other instanceof BigFixed) { other = new BigFloat(other.toString()); }

            // Easy cases:
            if (this.#mantissa === 0n && other.#mantissa === 0n) return 0;
            if (this.#mantissa === 0n) return other.#mantissa > 0n ? -1 : 1;
            if (other.#mantissa === 0n) return this.#mantissa > 0n ? 1 : -1;

            const thisSign = this.#mantissa > 0n ? 1 : -1;
            const otherSign = other.#mantissa > 0n ? 1 : -1;
            if (thisSign !== otherSign) return thisSign > otherSign ? 1 : -1;

            // Signs are the same. Compare absolute values.
            const expDiff = this.#exponent - other.#exponent;

            let thisMantissa = this.#mantissa;
            let otherMantissa = other.#mantissa;

            if (expDiff > 0) { // this.exponent is larger, scale this.mantissa up
                thisMantissa *= (10n ** expDiff);
            } else if (expDiff < 0) { // other.exponent is larger, scale other.mantissa up
                otherMantissa *= (10n ** (-expDiff));
            }

            if (thisMantissa > otherMantissa) return thisSign;
            if (thisMantissa < otherMantissa) return -thisSign;
            return 0;
        },
        toString() {
            const sign = this.#mantissa < 0n ? '-' : '';
            const mantissaStr = (this.#mantissa < 0n ? -this.#mantissa : this.#mantissa).toString();
            
            if (this.#exponent === 0n) {
                return sign + mantissaStr;
            }

            if (this.#exponent > 0n) {
                return sign + mantissaStr + '0'.repeat(Number(this.#exponent));
            }

            // exponent is negative
            const decimalPlaces = Number(-this.#exponent);
            if (decimalPlaces >= mantissaStr.length) {
                const zeros = '0'.repeat(decimalPlaces - mantissaStr.length);
                return sign + '0.' + zeros + mantissaStr;
            } else {
                const insertPos = mantissaStr.length - decimalPlaces;
                return sign + mantissaStr.slice(0, insertPos) + '.' + mantissaStr.slice(insertPos);
            }
        },
        valueOf() {
            return Number(this.$.#pvt.toString());
        }
    });

    constructor(value, exponent = null) {
        super();
        saveSelf(this, "$");

        if (value instanceof BigFloat && exponent === null) {
            this.#mantissa = value.#mantissa;
            this.#exponent = value.#exponent;
            return;
        } 
        
        if (exponent !== null) {
            this.#mantissa = BigInt(value);
            this.#exponent = BigInt(exponent);
        } else if (typeof value === 'string') {
            if (value.includes('e')) {
                let [mantissaStr, expStr] = value.split('e');
                this.#exponent = BigInt(expStr);
                if (mantissaStr.includes('.')) {
                    const decimalPlaces = mantissaStr.length - mantissaStr.indexOf('.') - 1;
                    this.#mantissa = BigInt(mantissaStr.replace('.', ''));
                    this.#exponent -= BigInt(decimalPlaces);
                } else {
                    this.#mantissa = BigInt(mantissaStr);
                }
            } else if (value.includes('.')) {
                const decimalPlaces = value.length - value.indexOf('.') - 1;
                this.#mantissa = BigInt(value.replace('.', ''));
                this.#exponent = -BigInt(decimalPlaces);
            } else {
                this.#mantissa = BigInt(value);
                this.#exponent = 0n;
            }
        } else if (typeof value === 'number') {
            // This is tricky and can lose precision for very large/small numbers.
            // Converting to string is a safe way to handle it.
            const temp = new BigFloat(value.toString());
            this.#mantissa = temp.#mantissa;
            this.#exponent = temp.#exponent;
        } else {
            this.#mantissa = BigInt(value);
            this.#exponent = 0n;
        }

        this.#normalize();
    }

    #normalize() {
        if (this.#mantissa === 0n) {
            this.#exponent = 0n;
            return;
        }
        
        // Remove trailing zeros from mantissa
        while (this.#mantissa % 10n === 0n) {
            this.#mantissa /= 10n;
            this.#exponent++;
        }
    }

    // Public getters for inspection
    get mantissa() {
        return this.#mantissa;
    }

    get exponent() {
        return this.#exponent;
    }
}
