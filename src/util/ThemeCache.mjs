import { share, saveSelf, final, accessor } from "../../node_modules/cfprotected/index.mjs";
import AppLibError from "../errors/AppLibError.mjs";

/**
 * @summary A cache and compiler for data-driven CSS stylesheets.
 * @description Manages the lifecycle of component styles, providing a 
 * registry for defaults and active themes. Supports granular updates 
 * and reactive broadcasting via internal event bus.
 */
const ThemeCache = final(class ThemeCache {
    #registry = new Map(); // tagName -> [ [defaultSheets], [themeSheets] ]
    #themeRepo = new Map(); // themeName -> Map<tagName, [sheets]>
    #globals = [[], []]; // [ [pre-defined], [theme-based] ]
    #activeThemeName = "default";
    #bus = new EventTarget();

    #pvt = share(this, ThemeCache, {
        registry: accessor({ get: () => this.#registry }),
        themeRepo: accessor({ get: () => this.#themeRepo }),
        globals: accessor({ get: () => this.#globals }),
        activeThemeName: accessor({
            get: () => this.#activeThemeName,
            set: (v) => { this.#activeThemeName = v; }
        }),
        bus: accessor({ get: () => this.#bus }),
        
        /**
         * Converts camelCase property names to kebab-case.
         * @param {string} str 
         * @returns {string}
         */
        kebab(str) {
            return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        },

        /**
         * Compiles a set of rules into a CSS string.
         * @param {Array} rules 
         * @returns {string}
         */
        compileRules(rules) {
            let css = "";
            for (const rule of rules) {
                const [selectors, body] = rule;
                
                // Handle @rules (selectors is an array containing a single SelectorBuilder/string)
                if (Array.isArray(body) && selectors.length === 1 && selectors[0].valueOf().startsWith("@")) {
                    css += `${selectors[0].valueOf()} {\n${this.$.#pvt.compileRules(body)}\n}\n`;
                    continue;
                }

                // Handle standard rules
                const selectorStr = selectors.map(s => s.valueOf()).join(", ");
                css += `${selectorStr} {\n`;
                for (const [prop, val] of Object.entries(body)) {
                    css += `  ${this.$.#pvt.kebab(prop)}: ${val};\n`;
                }
                css += "}\n";
            }
            return css;
        },

        /**
         * Creates a CSSStyleSheet from a rules array.
         * @param {Array} rules 
         * @returns {CSSStyleSheet}
         */
        createSheet(rules) {
            if (!rules || rules.length === 0) return null;
            const css = this.$.#pvt.compileRules(rules);
            const sheet = new CSSStyleSheet();
            if (typeof sheet.replaceSync === "function") {
                sheet.replaceSync(css);
            } else {
                // For environments without full support, we could polyfill, 
                // but we assume standard support in the project environment.
                // If it fails here, we'll see it in tests.
            }
            return sheet;
        },

        /**
         * Updates the active layer for all registered components based on a theme.
         * @param {string} themeName 
         */
        applyTheme(themeName) {
            this.$.#pvt.activeThemeName = themeName;
            const themeStyles = this.$.#pvt.themeRepo.get(themeName);
            const affectedTags = [];

            // Update components
            for (const [tag, tuple] of this.$.#pvt.registry) {
                tuple[1] = (themeStyles && themeStyles.has(tag)) 
                    ? themeStyles.get(tag) 
                    : [];
                affectedTags.push(tag);
            }

            // Update globals
            const globalThemeStyles = (themeStyles && themeStyles.has("global")) 
                ? themeStyles.get("global") 
                : [];
            this.$.#pvt.globals[1] = globalThemeStyles;

            this.$.#pvt.bus.dispatchEvent(new CustomEvent("styleUpdate", { detail: affectedTags }));
        }
    });

    constructor() {
        saveSelf(this, "$");
    }

    // EventTarget delegation
    addEventListener(...args) { this.$.#pvt.bus.addEventListener(...args); }
    removeEventListener(...args) { this.$.#pvt.bus.removeEventListener(...args); }
    dispatchEvent(...args) { return this.$.#pvt.bus.dispatchEvent(...args); }

    /**
     * Registers a component's default structural and skin styles.
     * @param {string} tag The component's tag name.
     * @param {Array} structure Rules for layout/structure.
     * @param {Array} skin Rules for default visual skin.
     */
    registerComponent(tag, structure, skin) {
        const pvt = this.$.#pvt;
        const structSheet = pvt.createSheet(structure);
        const skinSheet = pvt.createSheet(skin);
        
        const defaultSheets = [structSheet, skinSheet].filter(s => s !== null);
        
        // Initialize the tuple [ [defaults], [activeTheme] ]
        const themeStyles = pvt.themeRepo.get(pvt.activeThemeName);
        const themeSheets = (themeStyles && themeStyles.has(tag)) 
            ? themeStyles.get(tag) 
            : [];

        pvt.registry.set(tag, [defaultSheets, themeSheets]);
    }

    /**
     * Registers global styles (structure and default skin).
     * @param {Array} structure 
     * @param {Array} skin 
     */
    registerGlobal(structure, skin) {
        const pvt = this.$.#pvt;
        const structSheet = pvt.createSheet(structure);
        const skinSheet = pvt.createSheet(skin);
        pvt.globals[0] = [structSheet, skinSheet].filter(s => s !== null);
    }

    /**
     * Integrates a new theme into the repository.
     * @param {string} themeName 
     * @param {Object} tagStylesMap Map of tagName -> rulesArray
     */
    registerTheme(themeName, tagStylesMap) {
        const pvt = this.$.#pvt;
        if (!pvt.themeRepo.has(themeName)) {
            pvt.themeRepo.set(themeName, new Map());
        }
        
        const repo = pvt.themeRepo.get(themeName);
        const affectedTags = [];

        for (const [tag, rules] of Object.entries(tagStylesMap)) {
            const sheet = pvt.createSheet(rules);
            if (sheet) {
                repo.set(tag, [sheet]);
                if (themeName === pvt.activeThemeName) {
                    affectedTags.push(tag);
                }
            }
        }

        if (themeName === pvt.activeThemeName && affectedTags.length > 0) {
            pvt.applyTheme(themeName);
        }
    }

    /**
     * Latches onto a ThemeManager to sync active theme state.
     * @param {HTMLElement} manager The ThemeManager instance.
     */
    latch(manager) {
        // Listen for repeatable theme loading events
        manager.addEventListener("themeLoaded", (e) => {
            const { themeName, styles } = e.detail;
            this.registerTheme(themeName, styles);
        });

        // Listen for theme swaps
        manager.addEventListener("themeChange", () => {
            const newTheme = manager.currentTheme?.themeName || "default";
            this.$.#pvt.applyTheme(newTheme);
        });

        // Initial apply if manager already has a theme
        const current = manager.currentTheme?.themeName;
        if (current) {
            this.$.#pvt.applyTheme(current);
        }
    }

    /**
     * Retrieves the concatenated stylesheets for a component.
     * @param {string} tag 
     * @returns {Array<CSSStyleSheet>}
     */
    getStyles(tag) {
        const tuple = this.$.#pvt.registry.get(tag);
        if (!tuple) return [];
        return [...tuple[0], ...tuple[1]];
    }

    /**
     * Retrieves the concatenated global stylesheets.
     * @returns {Array<CSSStyleSheet>}
     */
    getGlobalStyles() {
        const globals = this.$.#pvt.globals;
        return [...globals[0], ...globals[1]];
    }
});

export default ThemeCache;