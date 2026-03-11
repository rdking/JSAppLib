import { jest, describe, test, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';

const applyThemeSpy = jest.fn();

// Mock dependencies
jest.unstable_mockModule("../../src/jsManagerBase.mjs", async () => {
    const { share, saveSelf } = await import("../../node_modules/cfprotected/index.mjs");
    
    // We extend HTMLElement to satisfy JSDOM customElements.define
    class MockManagerBase extends HTMLElement {
        static #spvt = share(this, {
            initAttributeProperties: (klass, attrs) => {
                const proto = klass.prototype;
                for (const [key, def] of Object.entries(attrs)) {
                    // Simple accessor mock
                    Object.defineProperty(proto, key, {
                        get() { return this.getAttribute(key) || ""; },
                        set(v) { this.setAttribute(key, v); },
                        configurable: true
                    });
                }
            },
            register: () => {},
            tagType: (name) => `js-${name}`
        });
        
        static { saveSelf(this, "$"); }

        #pvt = share(this, MockManagerBase, {
            tagType: (name) => `js-${name}`,
            make: (tag, props) => {
                const el = document.createElement(tag);
                // Simple prop application
                if (props) {
                    for (const [k, v] of Object.entries(props)) {
                        if (k === 'themeName') el.setAttribute('themename', v);
                        else if (k === 'themePath') el.setAttribute('themepath', v);
                        else el[k] = v;
                    }
                }
                return el;
            },
            themeCache: {
                applyTheme: applyThemeSpy
            }
        });

        constructor() {
            super();
            saveSelf(this, "$");
        }
        
        connectedCallback() {}
        disconnectedCallback() {}
        
        fireEvent(name, detail) {
            this.dispatchEvent(new CustomEvent(name, { detail }));
        }
        
        static get observedAttributes() { return []; }
    }
    return { default: MockManagerBase };
});

const { default: ThemeManager } = await import("../../src/jsThemeManager.mjs");

describe("jsThemeManager", () => {
    let manager;

    beforeAll(() => {
        // Define dependencies in JSDOM
        if (!customElements.get('js-theme')) {
            class MockTheme extends HTMLElement {
                load() { return Promise.resolve(); }
            }
            customElements.define('js-theme', MockTheme);
        }
        if (!customElements.get('js-thememanager')) {
            customElements.define('js-thememanager', ThemeManager);
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = "";
        manager = document.createElement("js-thememanager");
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should initialize default theme if missing", async () => {
        document.body.appendChild(manager);
        // connectedCallback is sync, but default theme creation happens there.
        
        const defaultTheme = manager.querySelector("js-theme[themename='default']");
        expect(defaultTheme).not.toBeNull();
        expect(defaultTheme.getAttribute("themename")).toBe("default");
    });

    test("should fire ready event after loading themes", async () => {
        const readySpy = jest.fn();
        manager.addEventListener("ready", readySpy);
        
        // Add a pre-existing theme to test loading collection
        const existingTheme = document.createElement("js-theme");
        existingTheme.load = jest.fn().mockResolvedValue("loaded");
        manager.appendChild(existingTheme);

        document.body.appendChild(manager);
        
        // Wait for microtasks (Promise.all)
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(existingTheme.load).toHaveBeenCalled();
        expect(readySpy).toHaveBeenCalled();
    });

    test("should apply theme via cache when currentTheme is set", () => {
        document.body.appendChild(manager);
        
        manager.currentTheme = "dark";
        
        expect(manager.getAttribute("currenttheme")).toBe("dark");
        expect(applyThemeSpy).toHaveBeenCalledWith("dark");
    });
});
