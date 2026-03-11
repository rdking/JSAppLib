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
import MDIWindow from "../../src/jsMDIWindow.mjs";

describe("jsMDIWindow (MDIWindow)", () => {
    let win;
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
        win = document.createElement("js-mdiwindow");
        document.body.appendChild(win);
        // Force render
        win.fireEvent("render");
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    test("Initializes correctly", () => {
        const shadow = win.shadowRoot;
        expect(shadow.querySelector(".header")).not.toBeNull();
        expect(shadow.querySelector(".body")).not.toBeNull();
        expect(shadow.querySelector("#title")).not.toBeNull();
    });

    test("Responds to title attribute", () => {
        win.setAttribute("title", "My Window");
        const titleLabel = win.shadowRoot.querySelector("#title");
        expect(titleLabel.innerText).toBe("My Window");
    });

    test("Responds to uri attribute", () => {
        win.setAttribute("uri", "test.html");
        const iframe = win.shadowRoot.querySelector("iframe");
        expect(iframe.src).toContain("test.html");
    });

    test("Maximize toggle via buttons", () => {
        const maxBtn = win.shadowRoot.querySelector("#maximize");
        const tiledBtn = win.shadowRoot.querySelector("#tiled");
        
        expect(win.hasAttribute("maximized")).toBe(false);
        
        maxBtn.click();
        expect(win.hasAttribute("maximized")).toBe(true);
        expect(maxBtn.classList.contains("hidden")).toBe(true);
        expect(tiledBtn.classList.contains("hidden")).toBe(false);

        tiledBtn.click();
        expect(win.hasAttribute("maximized")).toBe(false);
        expect(maxBtn.classList.contains("hidden")).toBe(false);
        expect(tiledBtn.classList.contains("hidden")).toBe(true);
    });

    test("Minimize toggle via buttons", () => {
        const minBtn = win.shadowRoot.querySelector("#minimize");
        
        expect(win.hasAttribute("minimized")).toBe(false);
        
        minBtn.click();
        expect(win.hasAttribute("minimized")).toBe(true);
        expect(win.slot).toBe("minArea");

        // Unminimize via dblclick on titleArea
        const titleArea = win.shadowRoot.querySelector("#titleArea");
        titleArea.dispatchEvent(new MouseEvent("dblclick"));
        
        expect(win.hasAttribute("minimized")).toBe(false);
        expect(win.slot).toBe("");
    });

    test("Close button fires closing event and removes window", () => {
        const closeBtn = win.shadowRoot.querySelector("#close");
        const closingHandler = jest.fn((e) => {
            // e.detail is the response object in fireEvent call
        });
        win.addEventListener("closing", closingHandler);
        
        const parent = win.parentElement;
        closeBtn.click();
        
        expect(closingHandler).toHaveBeenCalled();
        expect(win.parentElement).toBeNull();
    });

    test("focus() calls moveToTop on parent", () => {
        const mockParent = {
            moveToTop: jest.fn()
        };
        // Bypass normal DOM structure for this test
        Object.defineProperty(win, "parentElement", { value: mockParent });
        
        win.focus();
        expect(mockParent.moveToTop).toHaveBeenCalledWith(win);
    });

    test("Attribute properties: maximized and minimized", () => {
        // Properties match 'caption' in initAttributeProperties
        win.maximized = true;
        expect(win.hasAttribute("maximized")).toBe(true);
        
        win.maximized = false;
        expect(win.hasAttribute("maximized")).toBe(false);

        win.minimized = true;
        expect(win.hasAttribute("minimized")).toBe(true);
        
        win.minimized = false;
        expect(win.hasAttribute("minimized")).toBe(false);
    });
});
