import { saveSelf } from "../../node_modules/cfprotected/index.mjs";

const hexc = /^#(?:[0-9a-fA-F]{2}){3,4}$/;
const rgba = /^rgb(a)?\(\s*([12]?\d{1,2})\s*,\s*([12]?\d{1,2})\s*,\s*([12]?\d{1,2})\s*(?:,\s*([01]?(?:\.\d+)?)\s*)?\)$/;
const hsla = /^hsl(a)?\(\s*([1-3]?\d{1,2})\s*,\s*(1?\d{1,2})%\s*,\s*(1?\d{1,2})%\s*(?:,\s*([01]?(?:\.\d+)?)\s*)?\)$/;
const colorNames = {
    "AliceBlue": "#F0F8FF",
    "AntiqueWhite": "#FAEBD7",
    "Aqua": "#00FFFF",
    "Aquamarine": "#7FFFD4",
    "Azure": "#F0FFFF",
    "Beige": "#F5F5DC",
    "Bisque": "#FFE4C4",
    "Black": "#000000",
    "BlanchedAlmond": "#FFEBCD",
    "Blue": "#0000FF",
    "BlueViolet": "#8A2BE2",
    "Brown": "#A52A2A",
    "BurlyWood": "#DEB887",
    "CadetBlue":"#5F9EA0",
    "Chartreuse": "#7FFF00",
    "Chocolate": "#D2691E",
    "Coral": "#FF7F50",
    "CornflowerBlue": "#6495ED",
    "Cornsilk": "#FFF8DC",
    "Crimson": "#DC143C",
    "Cyan": "#00FFFF",
    "DarkBlue": "#00008B",
    "DarkCyan": "#008B8B",
    "DarkGoldenRod": "#B8860B",
    "DarkGray": "#A9A9A9",
    "DarkGrey": "#A9A9A9",
    "DarkGreen": "#006400",
    "DarkKhaki": "#BDB76B",
    "DarkMagenta": "#8B008B",
    "DarkOliveGreen": "#556B2F",
    "DarkOrange": "#FF8C00",
    "DarkOrchid": "#9932CC",
    "DarkRed": "#8B0000",
    "DarkSalmon": "#E9967A",
    "DarkSeaGreen": "#8FBC8F",
    "DarkSlateBlue": "#483D8B",
    "DarkSlateGray": "#2F4F4F",
    "DarkSlateGrey": "#2F4F4F",
    "DarkTurquoise": "#00CED1",
    "DarkViolet": "#9400D3",
    "DeepPink": "#FF1493",
    "DeepSkyBlue": "#00BFFF",
    "DimGray": "#696969",
    "DimGrey": "#696969",
    "DodgerBlue": "#1E90FF",
    "FireBrick": "#B22222",
    "FloralWhite": "#FFFAF0",
    "ForestGreen": "#228B22",
    "Fuchsia": "#FF00FF",
    "Gainsboro": "#DCDCDC",
    "GhostWhite": "#F8F8FF",
    "Gold": "#FFD700",
    "GoldenRod": "#DAA520",
    "Gray": "#808080",
    "Grey": "#808080",
    "Green": "#008000",
    "GreenYellow": "#ADFF2F",
    "HoneyDew": "#F0FFF0",
    "HotPink": "#FF69B4",
    "IndianRed": "#CD5C5C",
    "Indigo": "#4B0082",
    "Ivory": "#FFFFF0",
    "Khaki": "#F0E68C",
    "Lavender": "#E6E6FA",
    "LavenderBlush": "#FFF0F5",
    "LawnGreen": "#7CFC00",
    "LemonChiffon": "#FFFACD",
    "LightBlue": "#ADD8E6",
    "LightCoral": "#F08080",
    "LightCyan": "#E0FFFF",
    "LightGoldenRodYellow": "#FAFAD2",
    "LightGray": "#D3D3D3",
    "LightGrey": "#D3D3D3",
    "LightGreen": "#90EE90",
    "LightPink": "#FFB6C1",
    "LightSalmon": "#FFA07A",
    "LightSeaGreen": "#20B2AA",
    "LightSkyBlue": "#87CEFA",
    "LightSlateGray": "#778899",
    "LightSlateGrey": "#778899",
    "LightSteelBlue": "#B0C4DE",
    "LightYellow": "#FFFFE0",
    "Lime": "#00FF00",
    "LimeGreen": "#32CD32",
    "Linen": "#FAF0E6",
    "Magenta": "#FF00FF",
    "Maroon": "#800000",
    "MediumAquaMarine": "#66CDAA",
    "MediumBlue": "#0000CD",
    "MediumOrchid": "#BA55D3",
    "MediumPurple": "#9370DB",
    "MediumSeaGreen": "#3CB371",
    "MediumSlateBlue": "#7B68EE",
    "MediumSpringGreen": "#00FA9A",
    "MediumTurquoise": "#48D1CC",
    "MediumVioletRed": "#C71585",
    "MidnightBlue": "#191970",
    "MintCream": "#F5FFFA",
    "MistyRose": "#FFE4E1",
    "Moccasin": "#FFE4B5",
    "NavajoWhite": "#FFDEAD",
    "Navy": "#000080",
    "OldLace": "#FDF5E6",
    "Olive": "#808000",
    "OliveDrab": "#6B8E23",
    "Orange": "#FFA500",
    "OrangeRed": "#FF4500",
    "Orchid": "#DA70D6",
    "PaleGoldenRod": "#EEE8AA",
    "PaleGreen": "#98FB98",
    "PaleTurquoise": "#AFEEEE",
    "PaleVioletRed": "#DB7093",
    "PapayaWhip": "#FFEFD5",
    "PeachPuff": "#FFDAB9",
    "Peru": "#CD853F",
    "Pink": "#FFC0CB",
    "Plum": "#DDA0DD",
    "PowderBlue": "#B0E0E6",
    "Purple": "#800080",
    "RebeccaPurple": "#663399",
    "Red": "#FF0000",
    "RosyBrown": "#BC8F8F",
    "RoyalBlue": "#4169E1",
    "SaddleBrown": "#8B4513",
    "Salmon": "#FA8072",
    "SandyBrown": "#F4A460",
    "SeaGreen": "#2E8B57",
    "SeaShell": "#FFF5EE",
    "Sienna": "#A0522D",
    "Silver": "#C0C0C0",
    "SkyBlue": "#87CEEB",
    "SlateBlue": "#6A5ACD",
    "SlateGray": "#708090",
    "SlateGrey": "#708090",
    "Snow": "#FFFAFA",
    "SpringGreen": "#00FF7F",
    "SteelBlue": "#4682B4",
    "Tan": "#D2B48C",
    "Teal": "#008080",
    "Thistle": "#D8BFD8",
    "Tomato": "#FF6347",
    "Turquoise": "#40E0D0",
    "Violet": "#EE82EE",
    "Wheat": "#F5DEB3",
    "White": "#FFFFFF",
    "WhiteSmoke": "#F5F5F5",
    "Yellow": "#FFFF00",
    "YellowGreen": "#9ACD32"
};

const keys = Object.keys(colorNames);
for (const name of keys) {
    Object.defineProperty(colorNames, name.toLowerCase(), 
        Object.getOwnPropertyDescriptor(colorNames, name));
}

export default class HTMLColor {
    static [Symbol.hasInstance](inst) {
        try {
            // Accessing a private field will succeed only if `inst` is an instance
            // of this class. We use `inst.$` to robustly handle proxied objects.
            // A simple access is enough to check for identity; the value is not needed.
            void inst.$.#red;
            return true;
        }
        catch (e) {
            // A TypeError will be thrown if `inst` is not an HTMLColor instance
            // (or a proxy of one), so we can safely return false.
            return false;
        }
    }

    static {
        saveSelf(this, "$");
    }

    #red = 0;
    #green = 0;
    #blue = 0;
    #alpha = 255;

    #clamp(val, min, max, parser) {
        return Math.min(max, Math.max(min, parser(val)));
    }

    #parseHex(color) {
        let index = 1;
        let terms = [];

        while (index < color.length) {
            terms.push(parseInt(color.substring(index, index+2), 16));
            index += 2;
        }

        if (terms.length == 4) {
            this.$.#alpha = terms.shift();
        }
        this.$.#red = terms.shift();
        this.$.#green = terms.shift();
        this.$.#blue = terms.shift();
    }

    #parseRGBA(color) {
        let parts = color.match(rgba);
        this.$.#red = this.$.#clamp(parts[2], 0, 255, parseInt);
        this.$.#green = this.$.#clamp(parts[3], 0, 255, parseInt);
        this.$.#blue = this.$.#clamp(parts[4], 0, 255, parseInt);
        if (parts[1] == "a") {
            this.$.#alpha = ~~(255 * this.$.#clamp(parts[5], 0, 1, parseFloat));
        }
    }

    #HSLtoRGB(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return [255 * f(0), 255 * f(8), 255 * f(4)];
    }

    #RGBtoHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        h = h * 360;
        s = s * 100;
        l = l * 100;

        return [h.toFixed(1), s.toFixed(1), l.toFixed(1)];
    }

    #parseHSLA(color) {
        let parts = color.match(hsla);
        let hue = this.$.#clamp(parts[2], 0, 360, parseInt) % 360;
        let sat = this.$.#clamp(parts[3], 0, 100, parseInt);
        let lum = this.$.#clamp(parts[4], 0, 100, parseInt);
        let rgb = this.#HSLtoRGB(hue, sat, lum);

        this.$.#red = rgb[0];
        this.$.#green = rgb[1];
        this.$.#blue = rgb[2];

        if (parts[1] == "a") {
            this.$.#alpha = ~~(255 * this.$.#clamp(parts[5], 0, 1, parseFloat));
        }
    }

    constructor(color) {
        saveSelf(this, "$");

        if (typeof(color) == "string") {
            color = color.trim();

            if (colorNames.hasOwnProperty(color.toLowerCase())) {
                color = colorNames[color.toLowerCase()];
            }

            if (hexc.test(color)) {
                this.#parseHex(color);
            }
            else if (rgba.test(color)) {
                this.#parseRGBA(color);
            }
            else if (hsla.test(color)) {
                this.#parseHSLA(color);
            }
            else {
                throw new TypeError(`Unrecognized color: ${color}`);
            }
        }
        else if (Array.isArray(color)) {
            let [red = 0, green = 0, blue = 0, alpha] = color;

            if (red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
                throw new TypeError('RGB values must be between 0 and 255.');
            }
            if (alpha !== undefined && (alpha < 0 || alpha > 1)) {
                throw new TypeError('Alpha value must be between 0 and 1.');
            }

            this.#red = red;
            this.#green = green;
            this.#blue = blue;
            if (alpha !== undefined) {
                this.#alpha = ~~(255 * alpha);
            }
        }
    }

    get red() { return this.$.#red; }
    get green() { return this.$.#green; }
    get blue() { return this.$.#blue; }
    get alpha() { return this.$.#alpha; }
    get rgbaCode() {
        const defaultAlpha = this.$.#alpha == 255;
        // This logic produces a non-standard #AARRGGBB format to match the original implementation's parser.
        const raw = (defaultAlpha ? 0 : this.$.#alpha << 24) + (this.$.#red << 16) + (this.$.#green << 8) + this.$.#blue;
        const len = defaultAlpha ? 6 : 8;
        
        // Use >>> 0 to ensure the raw number is treated as unsigned for hex conversion.
        const hex = (raw >>> 0).toString(16);

        return "#" + hex.padStart(len, "0");
    }
    get hslCode() {
        const hsl = this.#RGBtoHSL(this.$.#red, this.$.#green, this.$.#blue);
        const defaultAlpha = this.$.#alpha == 255;

        return `hsl${defaultAlpha ? "" : "a"}(${hsl[0]},${hsl[1]}%,${hsl[2]}%${defaultAlpha ? "" : `,${this.$.#alpha / 255}`})`;
    }
}
