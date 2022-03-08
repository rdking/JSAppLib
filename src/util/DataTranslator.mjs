import { final, saveSelf } from "/node_modules/cfprotected/index.mjs";

const DataTranslator = final(class DataTranslator {
    static {
        Object.defineProperty(globalThis, "translator", {
            enumerable: true,
            value: new this()
        });
    }

    #schema = null;

    #translators = {};

    constructor() {
        saveSelf(this, "pvt");
        this.registerTranslator("js", {from: doc => doc, to: doc => doc, fixed: true, type: "code"});
        this.registerTranslator("json", {
            from: doc => JSON.parse(doc),
            to: doc => JSON.stringify(doc, null, "   ")
        });
    }

    get knownFormats() { return Object.getOwnPropertyNames(this.pvt.#translators); }
    get stringFormats() { return this.knownFormats.filter(f => this.pvt.#translators[f].type == "string")}

    isRegistered(format) {
        let handler = this.pvt.#translators[format];
        return (typeof(handler) == "object") && (typeof(handler.from) == "function") &&
            (typeof(handler.to) == "function");
    }

    registerTranslator(format, handlers) {
        let {from, to, type} = handlers;

        if (typeof(from) != "function") {
            throw new TypeError("Translator 'from' handler must be a function");
        }
        if (typeof(to) != "function") {
            throw new TypeError("Translator 'to' handler must be a function");
        }
        if ((typeof(format) != "string") || !format.trim().length) {
            throw new TypeError("Translator 'format' name must be a non-empty string")
        }
        if (![void 0,"code","string","binary"].includes(type)) {
            throw new TypeError(`If specified, type must be one of (code, string, binary)`)
        }
        if (format in this.pvt.#translators) {
            if (this.pvt.#translators[format].fixed) {
                throw new TypeError(`Cannot replace format handlers for '${format}`);
            }
            console.warn(`A translator for format '${format}' already exists. Replacing...`);
        }

        if (!("type" in handlers)) {
            handlers.type = "string";
        }
        this.pvt.#translators[format] = handlers;
    }

    translate(srcFormat, destFormat, data) {
        let xlators = this.pvt.#translators;
        if (!(srcFormat in xlators)) {
            throw new TypeError(`Unknown translation source format: ${srcFormat}`);
        }
        if (!(destFormat in xlators)) {
            throw new TypeError(`Unknown translation source format: ${destFormat}`);
        }

        try {
            return xlators[destFormat].to(xlators[srcFormat].from(data, {}), {});
        }
        catch(e) {
            throw new SyntaxError("An error occured while translating...", e);
        }
    }
});

export default DataTranslator;
