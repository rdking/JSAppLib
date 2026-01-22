import BigFloat from '../../node_modules/jsapplib/src/util/Math/BigFloat.mjs';
import BigFixed from '../../node_modules/jsapplib/src/util/Math/BigFixed.mjs';

describe('BigFloat', () => {
    describe('Constructor', () => {
        test('should construct from a string integer', () => {
            const num = new BigFloat('123');
            expect(num.toString()).toBe('123');
        });

        test('should construct from a string float', () => {
            const num = new BigFloat('123.456');
            expect(num.toString()).toBe('123.456');
        });

        test('should construct from a string with leading zeros', () => {
            const num = new BigFloat('0.00123');
            expect(num.toString()).toBe('0.00123');
        });

        test('should construct from scientific notation string', () => {
            const num = new BigFloat('1.23e-4');
            expect(num.toString()).toBe('0.000123');
        });

        test('should construct from another BigFloat', () => {
            const num1 = new BigFloat('123.456');
            const num2 = new BigFloat(num1);
            expect(num2.toString()).toBe('123.456');
        });

        test('should construct from a number', () => {
            const num = new BigFloat(123.456);
            expect(num.toString()).toBe('123.456');
        });

        test('should normalize the internal representation', () => {
            // 12300 * 10^-2 => 123 * 10^0
            const num = new BigFloat(12300n, -2n);
            expect(num.mantissa).toBe(123n);
            expect(num.exponent).toBe(0n);
        });
    });

    describe('Arithmetic Operations', () => {
        const a = new BigFloat('10.5'); // 105 * 10^-1
        const b = new BigFloat('2.5');  // 25 * 10^-1

        test('add', () => {
            const result = a.add(b);
            expect(result.toString()).toBe('13');
        });

        test('subtract', () => {
            const result = a.subtract(b);
            expect(result.toString()).toBe('8');
        });

        test('multiply', () => {
            const result = a.multiply(b);
            expect(result.toString()).toBe('26.25');
        });

        test('divide', () => {
            // 10.5 / 2.5 = 4.2
            const result = a.divide(b);
            expect(result.toString()).toBe('4.2');
        });

        test('division by zero should throw error', () => {
            expect(() => a.divide(new BigFloat('0'))).toThrow('Division by zero');
        });
        
        test('add with BigFixed', () => {
            const bf = new BigFloat('10.5');
            const bfix = new BigFixed('2.5');
            const result = bf.add(bfix);
            expect(result).toBeInstanceOf(BigFloat);
            expect(result.toString()).toBe('13');
        });
    });

    describe('Comparison', () => {
        const a = new BigFloat('10.5');
        const b = new BigFloat('10.5');
        const c = new BigFloat('12');
        const d = new BigFloat('-10.5');

        test('compareTo (equal)', () => {
            expect(a.compareTo(b)).toBe(0);
        });

        test('compareTo (greater)', () => {
            expect(c.compareTo(a)).toBe(1);
        });

        test('compareTo (less)', () => {
            expect(a.compareTo(c)).toBe(-1);
        });

        test('compareTo (different signs)', () => {
            expect(a.compareTo(d)).toBe(1);
            expect(d.compareTo(a)).toBe(-1);
        });

        test('equals', () => {
            expect(a.equals(b)).toBe(true);
            expect(a.equals(c)).toBe(false);
        });
    });

    describe('Unary Operations', () => {
        const a = new BigFloat('10.5');
        const b = new BigFloat('-10.5');

        test('negate', () => {
            expect(a.negate().toString()).toBe('-10.5');
            expect(b.negate().toString()).toBe('10.5');
        });

        test('abs', () => {
            expect(a.abs().toString()).toBe('10.5');
            expect(b.abs().toString()).toBe('10.5');
        });
    });

    describe('Power', () => {
        const base = new BigFloat('2.5');

        test('pow with positive integer', () => {
            const result = base.pow(new BigFloat('2'));
            expect(result.toString()).toBe('6.25');
        });

        test('pow with negative integer', () => {
            const result = base.pow(new BigFloat('-2')); // 1 / 6.25 = 0.16
            expect(result.toString()).toBe('0.16');
        });

        test('pow with zero', () => {
            const result = base.pow(new BigFloat('0'));
            expect(result.toString()).toBe('1');
        });
        
        test('pow with fractional exponent should throw', () => {
            expect(() => base.pow(new BigFloat('0.5'))).toThrow('pow() with fractional exponents is not supported.');
        });
    });

    describe('toString', () => {
        test('should format integers correctly', () => {
            expect(new BigFloat('12300').toString()).toBe('12300');
        });
        
        test('should format floats correctly', () => {
            expect(new BigFloat('123.45').toString()).toBe('123.45');
        });

        test('should format small numbers correctly', () => {
            expect(new BigFloat('0.000123').toString()).toBe('0.000123');
        });

        test('should format negative numbers correctly', () => {
            expect(new BigFloat('-123.45').toString()).toBe('-123.45');
        });
    });
});
