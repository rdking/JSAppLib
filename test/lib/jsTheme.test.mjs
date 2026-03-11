import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// 1. Mock CSSStyleSheet globally
global.CSSStyleSheet = class {
    constructor() {
        this.cssRules = [];
        this.cssText = "";
    }
    replaceSync(css) {
        this.cssText = css;
        this.cssRules = [{ cssText: css }];
    }
    replace(css) {
        return new Promise(resolve => {
            this.replaceSync(css);
            resolve(this);
        });
    }
};

// 2. Mock fetch
global.fetch = jest.fn();

// 3. Setup a way to track cache calls from the mock
let lastRegisteredStyles = null;
const registerThemeSpy = jest.fn((name, styles) => {
    lastRegisteredStyles = styles;
});

// 4. Mock dependencies to bypass JSDOM/Proxy restrictions
jest.unstable_mockModule("../../src/jsManageableBase.mjs", async () => {
    const { share, saveSelf } = await import("../../node_modules/cfprotected/index.mjs");
    
    class MockManageableBase {
        static #spvt = share(this, {
            initAttributeProperties: (klass, attrs) => {
                const proto = klass.prototype;
                for (const [key, def] of Object.entries(attrs)) {
                    const propName = def.caption || key;
                    Object.defineProperty(proto, propName, {
                        get() { return this.getAttribute(key.toLowerCase()); },
                        set(v) { this.setAttribute(key.toLowerCase(), v); },
                        configurable: true
                    });
                }
            },
            register: () => {},
            tagType: (name) => name, 
            tagTypes: (names) => names
        });
        
        static { saveSelf(this, "$"); }

        #pvt = share(this, MockManageableBase, {
            registerEvents: () => {},
            validateParent: () => {},
            tagType: (name) => name,
            themeCache: {
                registerTheme: registerThemeSpy
            }
        });

        constructor() {
            this._attributes = new Map();
            this._listeners = {};
            saveSelf(this, "$");
        }
        setAttribute(k, v) { this._attributes.set(k, v); }
        getAttribute(k) { return this._attributes.get(k); }
        addEventListener(type, listener) {
            if (!this._listeners[type]) this._listeners[type] = [];
            this._listeners[type].push(listener);
        }
        dispatchEvent(event) {
            if (this._listeners[event.type]) {
                this._listeners[event.type].forEach(l => l(event));
            }
            return true;
        }
        static get observedAttributes() { return []; }
    }
    return { default: MockManageableBase };
});

const { default: Theme } = await import("../../src/jsTheme.mjs");

describe("jsTheme (Theme)", () => {
    let themeElement;
    let mockParent;

    beforeEach(() => {
        jest.clearAllMocks();
        lastRegisteredStyles = null;
        document.body.innerHTML = "";
        
        mockParent = {
            getAttribute: jest.fn().mockReturnValue("/libs"),
        };

        themeElement = new Theme();
        Object.defineProperty(themeElement, 'parentElement', {
            get: () => mockParent
        });
    });

    test("should load theme resources and register them with ThemeCache", async () => {
        fetch.mockImplementation((url) => {
            if (url.includes("theme.json")) {
                return Promise.resolve({
                    text: () => Promise.resolve(JSON.stringify({
                        components: {
                            global: "global.css",
                            color: "colors.css",
                            tags: ["js-button"]
                        }
                    }))
                });
            }
            if (url.includes("global.css")) return Promise.resolve({ text: () => Promise.resolve("global-css") });
            if (url.includes("colors.css")) return Promise.resolve({ text: () => Promise.resolve("color-css") });
            if (url.includes("js-button.css")) return Promise.resolve({ text: () => Promise.resolve("button-css") });
            return Promise.reject("404");
        });

        themeElement.setAttribute("themename", "test-theme");
        
        await themeElement.load();

        expect(fetch).toHaveBeenCalledTimes(4);
        expect(themeElement.loaded).toBe(true);
        
        // Verify the data pushed to ThemeCache
        expect(registerThemeSpy).toHaveBeenCalledWith("test-theme", expect.any(Object));
        expect(lastRegisteredStyles.global).toContain("global-css");
        expect(lastRegisteredStyles.global).toContain("color-css");
        expect(lastRegisteredStyles["js-button"]).toContain("button-css");
    });

    test("should handle inheritance in theme.json", async () => {
        fetch.mockImplementation((url) => {
            if (url.endsWith("child/theme.json")) {
                return Promise.resolve({
                    text: () => Promise.resolve(JSON.stringify({
                        components: {
                            inherits: "../parent",
                            global: "child-global.css"
                        }
                    }))
                });
            }
            if (url.endsWith("parent/theme.json")) {
                return Promise.resolve({
                    text: () => Promise.resolve(JSON.stringify({
                        components: {
                            color: "parent-color.css"
                        }
                    }))
                });
            }
            return Promise.resolve({ text: () => Promise.resolve("css-content") });
        });

        themeElement.setAttribute("themename", "child");
        themeElement.setAttribute("themepath", "/themes/child");

        await themeElement.load();
        
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("parent/theme.json"));
        expect(registerThemeSpy).toHaveBeenCalled();
    });
});
