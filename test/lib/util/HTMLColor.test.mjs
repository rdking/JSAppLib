import HTMLColor from '../../../src/util/HTMLColor.mjs';

describe('HTMLColor', () => {
    describe('Construction from String', () => {
        it('should construct from a named color (e.g., "Red")', () => {
            const color = new HTMLColor('Red');
            expect(color.red).toBe(255);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });

        it('should construct from a named color case-insensitively (e.g., "bLuE")', () => {
            const color = new HTMLColor('bLuE');
            expect(color.red).toBe(0);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(255);
        });

        it('should construct from a 6-digit hex color string', () => {
            const color = new HTMLColor('#FF8800');
            expect(color.red).toBe(255);
            expect(color.green).toBe(136);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });

        it('should construct from an 8-digit hex color string (#AARRGGBB)', () => {
            const color = new HTMLColor('#80FF00FF');
            expect(color.alpha).toBe(128);
            expect(color.red).toBe(255);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(255);
        });

        it('should construct from an rgb() color string', () => {
            const color = new HTMLColor('rgb(10, 20, 30)');
            expect(color.red).toBe(10);
            expect(color.green).toBe(20);
            expect(color.blue).toBe(30);
            expect(color.alpha).toBe(255);
        });

        it('should construct from an rgba() color string', () => {
            const color = new HTMLColor('rgba(40, 50, 60, 0.5)');
            expect(color.red).toBe(40);
            expect(color.green).toBe(50);
            expect(color.blue).toBe(60);
            expect(color.alpha).toBe(127); // 255 * 0.5 rounded down
        });

        it('should construct from an hsl() color string', () => {
            const color = new HTMLColor('hsl(120, 100%, 50%)'); // Green
            expect(color.red).toBe(0);
            expect(Math.round(color.green)).toBe(255);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });

        it('should construct from an hsla() color string', () => {
            const color = new HTMLColor('hsla(240, 100%, 50%, 0.75)'); // Blue with alpha
            expect(Math.round(color.red)).toBe(0);
            expect(Math.round(color.green)).toBe(0);
            expect(Math.round(color.blue)).toBe(255);
            expect(color.alpha).toBe(191); // 255 * 0.75 rounded down
        });

        it('should throw TypeError for an unrecognized color string', () => {
            expect(() => new HTMLColor('not a color')).toThrow(TypeError);
        });
    });

    describe('Construction from Array', () => {
        it('should construct from an [r, g, b] array', () => {
            const color = new HTMLColor([10, 20, 30]);
            expect(color.red).toBe(10);
            expect(color.green).toBe(20);
            expect(color.blue).toBe(30);
            expect(color.alpha).toBe(255);
        });

        it('should construct from an [r, g, b, a] array', () => {
            const color = new HTMLColor([40, 50, 60, 0.5]);
            expect(color.red).toBe(40);
            expect(color.green).toBe(50);
            expect(color.blue).toBe(60);
            expect(color.alpha).toBe(127); // 255 * 0.5 rounded down
        });
    });
    
    describe('Edge Case Construction', () => {
        it('should default to black if constructor receives no arguments', () => {
            const color = new HTMLColor();
            expect(color.red).toBe(0);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });

        it('should default to black if constructor receives null', () => {
            const color = new HTMLColor(null);
            expect(color.red).toBe(0);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });

        it('should default to black for an empty array', () => {
            const color = new HTMLColor([]);
            expect(color.red).toBe(0);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(0);
            expect(color.alpha).toBe(255);
        });
    });

    describe('Value Clamping', () => {
        it('should throw on out-of-range rgb values', () => {
            expect(() => new HTMLColor('rgb(300, -20, 128)')).toThrow(TypeError);
        });

        it('should throw on out-of-range array values', () => {
            expect(() => new HTMLColor([-10, 256, 100, 1.5])).toThrow(TypeError);
        });

        it('should throw on out-of-range hsl values', () => {
            expect(() => new HTMLColor('hsl(480, 110%, -10%)')).toThrow(TypeError);
        });
    });

    describe('Computed Code Getters', () => {
        it('should return correct rgbaCode for color with no alpha', () => {
            const color = new HTMLColor('Red');
            expect(color.rgbaCode.toLowerCase()).toBe('#ff0000');
        });

        it('should return correct rgbaCode for color with alpha', () => {
            const color = new HTMLColor('rgba(255, 0, 255, 0.5)');
            // Note: implementation uses #AARRGGBB
            expect(color.rgbaCode.toLowerCase()).toBe('#7fff00ff');
        });

        it('should return correct hslCode for color with no alpha', () => {
            const color = new HTMLColor('Lime');
            // HSL can have rounding differences, so check components
            expect(color.hslCode).toMatch(/hsl\(120.0,100.0%,50.0%\)/);
        });

        it('should return correct hslCode for color with alpha', () => {
            const color = new HTMLColor('hsla(0, 100%, 50%, 0.5)'); // Red with 0.5 alpha
            // alpha becomes ~~_255 * 0.5) = 127. 127 / 255 = 0.49803...
            expect(color.hslCode).toMatch(/hsla\(0.0,100.0%,50.0%,\s*0.49803/);
        });
    });

    describe('Instance Checking', () => {
        it('should return true for "instanceof HTMLColor"', () => {
            const color = new HTMLColor('White');
            expect(color instanceof HTMLColor).toBe(true);
        });

        it('should return false for non-instances of HTMLColor', () => {
            const obj = {};
            expect(obj instanceof HTMLColor).toBe(false);
        });
        
        it('should work correctly with a Proxy', () => {
            const color = new HTMLColor('Black');
            const proxy = new Proxy(color, {});
            expect(proxy instanceof HTMLColor).toBe(true);
        });
    });
});