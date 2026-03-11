import { jest, describe, test, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';

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
};

// 2. Mock ResizeObserver globally
global.ResizeObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    observe(target) {
        this.target = target;
    }
    disconnect() {}
    trigger(entries) {
        this.callback(entries, this);
    }
};

// 3. Pre-define JSAppLib
Object.defineProperty(window, "JSAppLib", {
    value: {},
    writable: true,
    configurable: true
});

import SCSPanel from "../../src/jsSCSPanel.mjs";
import AppLibError from "../../src/errors/AppLibError.mjs";

describe("jsSCSPanel (SCSPanel)", () => {
    let panel;

    beforeAll(() => {
        // SCSPanel registers itself via static block, but we verify it here
        if (!customElements.get("js-scspanel")) {
            // It should be registered automatically by the import if the static block runs
            // But usually Base.registerElements needs to be called.
            // SCSPanel doesn't expose a 'ready' method like App.
            // We can rely on the fact that loading the module runs the static block.
            // But we need to call Base.registerElements to actually define it.
            // Since we can't easily access Base from here without importing it...
        }
        
        // Let's verify if we need to manually trigger registration
        // In jsBase.mjs, registerElements is on Base.#spvt.
        // We can expose a helper in SCSPanel if needed, or just mock the definition if the system relies on App.ready() normally.
        
        // For unit testing a single component, we often manually define if the auto-mechanism isn't triggered.
        // However, SCSPanel inherits Container -> FocusableTag -> ControlBase -> Base.
        // Base has the registry.
        
        // Let's try to just define it manually for the test to ensure it works.
        // But SCSPanel.register calls Base.register.
        
        // We need to trigger Base.registerElements().
        // We can create a dummy App to trigger it, or use a exposed method.
        // Let's try defining it manually since we want to test THIS class.
        if (!customElements.get("js-scspanel")) {
            customElements.define("js-scspanel", SCSPanel);
        }
    });

    beforeEach(() => {
        document.body.setAttribute("data-debug", "true");
        document.body.innerHTML = "";
        panel = new SCSPanel();
        document.body.appendChild(panel);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    test("Initialization", () => {
        expect(panel).toBeDefined();
        expect(panel.tagName.toLowerCase()).toBe("js-scspanel");
    });

    test("Structure contains focusable wrapper and container", () => {
        const shadow = panel.shadowRoot;
        const focusable = shadow.querySelector(".focusable");
        expect(focusable).not.toBeNull();
        
        const container = shadow.querySelector(".container");
        expect(container).not.toBeNull();
    });

    test("Slots exist (first, content, last)", () => {
        const shadow = panel.shadowRoot;
        const first = shadow.querySelector("slot[name='first']");
        const last = shadow.querySelector("slot[name='last']");
        const content = shadow.querySelector("slot:not([name])");

        expect(first).not.toBeNull();
        expect(last).not.toBeNull();
        expect(content).not.toBeNull();
    });

    test("Attributes: nofirst / nolast hide slots", () => {
        const shadow = panel.shadowRoot;
        const first = shadow.querySelector("slot[name='first']");
        const last = shadow.querySelector("slot[name='last']");

        expect(first.classList.contains("gone")).toBe(false);
        expect(last.classList.contains("gone")).toBe(false);

        panel.nofirst = true;
        expect(panel.hasAttribute("nofirst")).toBe(true);
        // The event handler 'onNoFirstChanged' should trigger class update
        expect(first.classList.contains("gone")).toBe(true);

        panel.nolast = true;
        expect(last.classList.contains("gone")).toBe(true);
        
        panel.nofirst = false;
        expect(first.classList.contains("gone")).toBe(false);
    });

    test("Attributes: horizontal", () => {
        expect(panel.horizontal).toBe(false);
        panel.horizontal = true;
        expect(panel.hasAttribute("horizontal")).toBe(true);
        expect(panel.horizontal).toBe(true);
    });
    
    test("Resize logic (basic coverage)", () => {
        // Mock properties used by onResize handler
        panel.computedStyleMap = { "margin-top": "0px", "margin-bottom": "0px" };

        // Use fireEvent which is idiomatic for this library
        expect(() => {
            panel.fireEvent("resize", {});
        }).not.toThrow();
    });
});
