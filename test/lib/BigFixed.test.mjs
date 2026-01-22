import BigFixed from '../../node_modules/jsapplib/src/util/Math/BigFixed.mjs';
import BigFloat from '../../node_modules/jsapplib/src/util/Math/BigFloat.mjs';

describe('BigFixed', () => {
    describe('Constructor', () => {
        test('should construct from a string integer', () => {
            const num = new BigFixed('123');
            expect(num.toString()).toBe('123');
        });

        test('should construct from a string float', () => {
            const num = new BigFixed('123.456');
            expect(num.toString()).toBe('123.456');
        });

        test('should construct with a specific precision', () => {
            const num = new BigFixed('123.456789', 3);
            expect(num.toString()).toBe('123.456');
            expect(num.precision).toBe(3);
        });

        test('should construct from another BigFixed', () => {
            const num1 = new BigFixed('123.456');
            const num2 = new BigFixed(num1);
            expect(num2.toString()).toBe('123.456');
            expect(num2.precision).toBe(num1.precision);
        });
        
        test('should construct from another BigFixed with different precision', () => {
            const num1 = new BigFixed('123.456', 5);
            const num2 = new BigFixed(num1, 3);
            expect(num2.toString()).toBe('123.456');
            expect(num2.precision).toBe(3);
        });

        test('should construct from a number', () => {
            const num = new BigFixed(123.456);
            expect(num.toString()).toBe('123.456');
        });

        test('should handle negative numbers from string', () => {
            const num = new BigFixed('-123.456');
            expect(num.toString()).toBe('-123.456');
        });
    });

    describe('Arithmetic Operations', () => {
        const a = new BigFixed('10.5', 2); // scaled: 1050
        const b = new BigFixed('2.5', 2);  // scaled: 250

        test('add', () => {
            const result = a.add(b);
            expect(result.toString()).toBe('13');
            expect(result.precision).toBe(2);
        });
        
        test('add with different precision', () => {
            const c = new BigFixed('1.123', 3); // scaled: 1123
            const result = a.add(c); // a becomes 10.500
            expect(result.precision).toBe(3);
            expect(result.toString()).toBe('11.623');
        });

        test('subtract', () => {
            const result = a.subtract(b);
            expect(result.toString()).toBe('8');
        });

        test('multiply', () => {
            const result = a.multiply(b); // 10.5 * 2.5 = 26.25
            expect(result.toString()).toBe('26.25');
            expect(result.precision).toBe(2);
        });
        
        test('multiply with different precision', () => {
            const x = new BigFixed('2.5', 1); // 25
            const y = new BigFixed('1.25', 2); // 125
            const result = x.multiply(y); // 2.5 * 1.25 = 3.125
            expect(result.precision).toBe(2);
            expect(result.toString()).toBe('3.12'); // Precision of result is max(p1, p2)
        });

        test('divide', () => {
            const a_div = new BigFixed('10.5', 4);
            const b_div = new BigFixed('2.5', 4);
            const result = a_div.divide(b_div); // 10.5 / 2.5 = 4.2
            expect(result.toString()).toBe('4.2');
            expect(result.precision).toBe(4);
        });

        test('division by zero should throw error', () => {
            expect(() => a.divide(new BigFixed('0'))).toThrow('Division by zero');
        });
        
        test('remainder', () => {
            const x = new BigFixed('10.5', 2);
            const y = new BigFixed('3', 2);
            const result = x.remainder(y);
            expect(result.toString()).toBe('1.5');
        });
        
        test('add with BigFloat', () => {
            const bfix = new BigFixed('10.5');
            const bf = new BigFloat('2.5');
            const result = bfix.add(bf);
            expect(result).toBeInstanceOf(BigFloat);
            expect(result.toString()).toBe('13');
        });
    });

    describe('Power', () => {
        const base = new BigFixed('2.5', 4);

        test('pow with positive integer', () => {
            const result = base.pow(new BigFixed('2'));
            expect(result.toString()).toBe('6.25');
        });

        test('pow with negative integer', () => {
            const result = base.pow(new BigFixed('-2')); // 1 / 6.25 = 0.16
            expect(result.toString()).toBe('0.16');
        });

        test('pow with zero', () => {
            const result = base.pow(new BigFixed('0'));
            expect(result.toString()).toBe('1');
        });
        
        test('pow with fractional exponent should throw', () => {
            expect(() => base.pow(new BigFixed('0.5'))).toThrow('pow() with fractional exponents is not supported for BigFixed.');
        });
    });

    describe('Comparison', () => {
        const a = new BigFixed('10.5');
        const b = new BigFixed('10.500', 20); // Different precision, same value
        const c = new BigFixed('12');
        const d = new BigFixed('-10.5');

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
        const a = new BigFixed('10.5');
        const b = new BigFixed('-10.5');

        test('negate', () => {
            expect(a.negate().toString()).toBe('-10.5');
            expect(b.negate().toString()).toBe('10.5');
        });

        test('abs', () => {
            expect(a.abs().toString()).toBe('10.5');
            expect(b.abs().toString()).toBe('10.5');
        });
    });

    describe('toString', () => {
        test('should format integers correctly', () => {
            expect(new BigFixed('12300').toString()).toBe('12300');
        });
        
        test('should format floats correctly and trim trailing zeros', () => {
            expect(new BigFixed('123.45000', 10).toString()).toBe('123.45');
        });

        test('should format small numbers correctly', () => {
            const num = new BigFixed('0.000123', 10);
            expect(num.toString()).toBe('0.000123');
        });

        test('should handle whole numbers with trailing point', () => {
            const num = new BigFixed('123.');
            expect(num.toString()).toBe('123');
        });
    });
});
