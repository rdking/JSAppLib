import { saveSelf, final } from "../../node_modules/cfprotected/index.mjs";
import AppLibError from "../errors/AppLibError.mjs";

/**
 * @summary A cache and compiler for data-driven CSS stylesheets.
 * @description Manages the lifecycle of component styles, providing a 
 * registry for defaults and active themes. Supports granular updates 
 * and reactive broadcasting via an internal event bus. This class is 
 * final and protects its private members against proxy wrapping.
 */
const ThemeCache = final(class ThemeCache {
    #registry = new Map(); // tagName -> [ [defaultSheets], [themeSheets] ]
    #themeRepo = new Map(); // themeName -> Map<tagName, [sheets]>
    #globals = [[], []]; // [ [pre-defined], [theme-based] ]
    #activeThemeName = "default";
    #bus = new EventTarget();
    #prefix = "";

    /**
     * Converts camelCase property names to kebab-case.
     * @param {string} str 
     * @returns {string}
     */
    #kebab(str) {
        return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    }

    /**
     * Compiles a set of rules into a CSS string.
     * @param {Array} rules 
     * @returns {string}
     */
    #compileRules(rules) {
        let css = "";
        for (const rule of rules) {
            const [selectors, body] = rule;
            
            // Handle @rules
            if (Array.isArray(body) && selectors.length === 1 && selectors[0].valueOf().startsWith("@")) {
                css += selectors[0].valueOf() + " {\n" + this.$.#compileRules(body) + "\n}\n";
                continue;
            }

            // Handle standard rules
            const selectorStr = selectors.map(s => s.valueOf()).join(", ");
            css += selectorStr + " {\n";
            for (const [prop, val] of Object.entries(body)) {
                if (prop === "DEFS" && typeof val === "object") {
                    for (const [varName, varVal] of Object.entries(val)) {
                        const name = varName.startsWith('--') ? varName : `--${this.$.#kebab(varName)}`;
                        css += `  ${name}: ${varVal};\n`;
                    }
                } else {
                    css += "  " + this.$.#kebab(prop) + ": " + val + ";\n";
                }
            }
            css += "}\n";
        }
        return css;
    }

    /**
     * Creates a CSSStyleSheet from a rules array.
     * @param {Array} rules 
     * @returns {CSSStyleSheet}
     */
    #createSheet(rules) {
        let retval = null;
        if (rules && rules.length > 0) {
            const css = Array.isArray(rules) ? this.$.#compileRules(rules) : rules;
            retval = new CSSStyleSheet();
            if (typeof retval.replaceSync === "function") {
                retval.replaceSync(css);
            }
        }
        return retval;
    }

    /**
     * @summary Updates the active layer for all registered components based on a theme.
     * @param {string} themeName 
     * @private
     */
    #applyTheme(themeName) {
        this.$.#activeThemeName = themeName;
        const themeStyles = this.$.#themeRepo.get(themeName);
        const affectedTags = [];

        // Update components
        for (const [tag, tuple] of this.$.#registry) {
            tuple[1] = (themeStyles && themeStyles.has(tag)) 
                ? themeStyles.get(tag) 
                : [];
            affectedTags.push(tag);
        }

        // Update globals
        const globalThemeStyles = (themeStyles && themeStyles.has("global")) 
            ? themeStyles.get("global") 
            : [];
        this.$.#globals[1] = globalThemeStyles;

        this.fireEvent("styleUpdate", affectedTags);
    }

    /**
     * @constructor
     */
    constructor(prefix) {
        saveSelf(this, "$");

        if ((typeof(prefix) == "string") && prefix.length) {
            this.#prefix = prefix;
        }
    }

    /**
     * @summary Adds an event listener to the internal bus.
     * @param {string} type 
     * @param {Function} callback 
     * @param {Object} [options] 
     */
    addEventListener(type, callback, options) { 
        this.$.#bus.addEventListener(type, callback, options); 
    }

    /**
     * @summary Removes an event listener from the internal bus.
     * @param {string} type 
     * @param {Function} callback 
     * @param {Object} [options] 
     */
    removeEventListener(type, callback, options) { 
        this.$.#bus.removeEventListener(type, callback, options); 
    }

    /**
     * @summary Dispatches an event on the internal bus.
     * @param {Event} event 
     * @returns {boolean}
     */
    dispatchEvent(event) { 
        return this.$.#bus.dispatchEvent(event); 
    }

    /**
     * @summary Creates and dispatches a CustomEvent on the internal bus.
     * @param {string} name The event name.
     * @param {*} obj The event detail payload.
     */
    fireEvent(name, obj) {
        this.dispatchEvent(new CustomEvent(name, { detail: obj }));
    }

    /**
     * @summary Dispatches a CustomEvent asynchronously.
     * @param {string} name The event name.
     * @param {*} obj The event detail payload.
     */
    fireEventAsync(name, obj) {
        setTimeout(() => {
            this.fireEvent(name, obj);
        }, 1);
    }

    /**
     * @summary Checks if a component is already registered.
     * @param {string} tag 
     * @returns {boolean}
     */
    has(tag) {
        return this.$.#registry.has(tag);
    }

    /**
     * @summary Registers a component's default structural and skin styles.
     * @param {string} tag The component's tag name.
     * @param {Array} structure Rules for layout/structure.
     * @param {Array} skin Rules for default visual skin.
     */
    registerComponent(tag, structure, skin) {
        const structSheet = this.$.#createSheet(structure);
        const skinSheet = this.$.#createSheet(skin);
        
        const defaultSheets = [structSheet, skinSheet].filter(s => s !== null);
        
        // Initialize the tuple [ [defaults], [activeTheme] ]
        const themeStyles = this.$.#themeRepo.get(this.$.#activeThemeName);
        const themeSheets = (themeStyles && themeStyles.has(tag)) 
            ? themeStyles.get(tag) 
            : [];

        this.$.#registry.set(tag, [defaultSheets, themeSheets]);
    }

    /**
     * @summary Registers global styles (structure and default skin).
     * @param {Array} structure 
     * @param {Array} skin 
     */
    registerGlobal(structure, skin) {
        const structSheet = this.$.#createSheet(structure);
        const skinSheet = this.$.#createSheet(skin);
        this.$.#globals[0] = [structSheet, skinSheet].filter(s => s !== null);
    }

    /**
     * @summary Integrates a new theme into the repository.
     * @param {string} themeName 
     * @param {Object} tagStylesMap Map of tagName -> rulesArray
     */
    registerTheme(themeName, tagStylesMap) {
        if (!this.$.#themeRepo.has(themeName)) {
            this.$.#themeRepo.set(themeName, new Map());
        }
        
        const repo = this.$.#themeRepo.get(themeName);
        const affectedTags = [];

        for (let [tag, sheets] of Object.entries(tagStylesMap)) {
            if (!Array.isArray(sheets)) {
                sheets = [sheets];
            }
            for (let rules of sheets) {
                const sheet = this.$.#createSheet(rules);
                if (sheet) {
                    repo.set(`${this.$.#prefix}-${tag}`, [sheet]);
                    if (themeName === this.$.#activeThemeName) {
                        affectedTags.push(tag);
                    }
                }
            }
        }

        if (themeName === this.$.#activeThemeName && affectedTags.length > 0) {
            this.#applyTheme(themeName);
        }
    }

    /**
     * @summary Retrieves the concatenated stylesheets for a component.
     * @param {string} tag 
     * @returns {Array<CSSStyleSheet>}
     */
    getStyles(tag) {
        const tuple = this.$.#registry.get(tag);
        let retval = [];
        if (tuple) {
            retval = [...tuple[0], ...tuple[1]];
        }
        return retval;
    }

    /**
     * @summary Retrieves the concatenated global stylesheets.
     * @returns {Array<CSSStyleSheet>}
     */
    getGlobalStyles() {
        const globals = this.$.#globals;
        return [...globals[0], ...globals[1]];
    }
});

export default ThemeCache;