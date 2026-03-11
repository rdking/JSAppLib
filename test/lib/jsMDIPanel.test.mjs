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

// 2. Mock ResizeObserver
global.ResizeObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

// 3. Mock MutationObserver
global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
};

// 4. Pre-define JSAppLib
Object.defineProperty(window, "JSAppLib", {
    value: {},
    writable: true,
    configurable: true
});

import App from "../../src/jsApp.mjs";
import MDIPanel from "../../src/jsMDIPanel.mjs";
import MDIWindow from "../../src/jsMDIWindow.mjs";

describe("jsMDIPanel (MDIPanel)", () => {
    let panel;
    let mockApp;

    beforeAll(() => {
        // Register components
        App.ready();

        // Mock the app object
        mockApp = document.createElement("div");
        Object.defineProperty(mockApp, "tagName", { value: "JS-APP" });
        mockApp.components = {};
        mockApp.themeManager = new EventTarget();
        mockApp.themeManager.currentTheme = { themeName: "default" };
        mockApp.fireEvent = jest.fn();

        window.JSAppLib.app = mockApp;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.setAttribute("data-debug", "true");
        document.body.innerHTML = "";
        panel = document.createElement("js-mdipanel");
        
        // Mock client dimensions for cascading logic
        Object.defineProperty(panel, "clientWidth", { value: 1024, configurable: true });
        Object.defineProperty(panel, "clientHeight", { value: 768, configurable: true });
        
        document.body.appendChild(panel);
        // Force render
        panel.fireEvent("render");
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    test("Initializes correctly", () => {
        const shadow = panel.shadowRoot;
        expect(shadow.querySelector(".dragoverlay")).not.toBeNull();
        expect(shadow.querySelector("slot")).not.toBeNull();
        expect(shadow.querySelector("#minArea")).not.toBeNull();
    });

    test("newWindow() adds an MDIWindow", () => {
        const win = panel.newWindow();
        expect(win.tagName.toLowerCase()).toBe("js-mdiwindow");
        expect(win.parentElement).toBe(panel);
    });

    test("newWindow() cascades window positions", () => {
        const win1 = panel.newWindow();
        const win2 = panel.newWindow();
        
        expect(win1.style.top).toBe("0px");
        expect(win1.style.left).toBe("0px");
        expect(win2.style.top).toBe("32px");
        expect(win2.style.left).toBe("32px");
    });

    test("appendChild validates children (only MDIWindows allowed)", () => {
        const win = document.createElement("js-mdiwindow");
        panel.appendChild(win);
        expect(win.parentElement).toBe(panel);

        const div = document.createElement("div");
        expect(() => panel.appendChild(div)).toThrow();
    });

    test("moveToTop updates z-indices and active classes", () => {
        const win1 = panel.newWindow();
        const win2 = panel.newWindow();
        
        // Force render for windows to ensure IDs and initial z-indices are set
        win1.fireEvent("render");
        win2.fireEvent("render");

        panel.moveToTop(win1);
        
        expect(win1.classList.contains("ontop")).toBe(true);
        expect(win2.classList.contains("ontop")).toBe(false);
        expect(parseInt(win1.style.zIndex)).toBeGreaterThan(parseInt(win2.style.zIndex));
    });

    test("Drag overlay classes on startDrag/endDrag events", () => {
        const overlay = panel.shadowRoot.querySelector(".dragoverlay");
        const win = panel.newWindow();
        win.style.zIndex = "10";

        // Simulate startDrag event (detail is the window)
        panel.fireEvent("startDrag", win);
        expect(overlay.classList.contains("dragging")).toBe(true);
        expect(parseInt(win.style.zIndex)).toBe(1000010);

        // Simulate endDrag
        panel.fireEvent("endDrag", win);
        expect(overlay.classList.contains("dragging")).toBe(false);
        expect(parseInt(win.style.zIndex)).toBe(10);
    });
});
