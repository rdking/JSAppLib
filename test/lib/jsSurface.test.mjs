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

// 2. Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === '2d') {
        return {
            canvas: this,
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(this.width * this.height * 4)
            })),
            putImageData: jest.fn(),
            toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
            set fillStyle(val) { this._fillStyle = val; },
            get fillStyle() { return this._fillStyle; },
            set strokeStyle(val) { this._strokeStyle = val; },
            get strokeStyle() { return this._strokeStyle; },
            set lineWidth(val) { this._lineWidth = val; },
            get lineWidth() { return this._lineWidth; },
            set font(val) { this._font = val; },
            get font() { return this._font; }
        };
    }
    return null;
};

// 3. Mock toDataURL on canvas itself (JSDOM might not have it)
HTMLCanvasElement.prototype.toDataURL = function() {
    return 'data:image/png;base64,mock';
};

// 4. Pre-define JSAppLib
Object.defineProperty(window, "JSAppLib", {
    value: {},
    writable: true,
    configurable: true
});

import App from "../../src/jsApp.mjs";
import Surface from "../../src/jsSurface.mjs";
import HTMLColor from "../../src/util/HTMLColor.mjs";

describe("jsSurface (Surface)", () => {
    let surface;
    let mockApp;

    beforeAll(() => {
        // Register components via App.ready()
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
        surface = document.createElement("js-surface");
        document.body.appendChild(surface);
        // Force render
        surface.fireEvent("render");
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    test("Initializes with default dimensions", () => {
        const front = surface.shadowRoot.querySelector("#front");
        expect(front.width).toBe(320);
        expect(front.height).toBe(240);
    });

    test("Responds to width and height attributes", () => {
        surface.setAttribute("width", "640");
        surface.setAttribute("height", "480");
        
        const front = surface.shadowRoot.querySelector("#front");
        expect(front.width).toBe(640);
        expect(front.height).toBe(480);
    });

    test("Responds to surfacewidth and surfaceheight attributes", () => {
        surface.setAttribute("surfacewidth", "800");
        surface.setAttribute("surfaceheight", "600");
        
        expect(surface.style.getPropertyValue("--surface-width")).toBe("800px");
        expect(surface.style.getPropertyValue("--surface-height")).toBe("600px");
    });

    test("Target layer management", () => {
        const BACK = Surface.Plane.BACK;
        surface.setTargetLayer(BACK);
        expect(surface.context.canvas.id).toBe("back");
        
        surface.setTargetLayer("FRONT");
        expect(surface.context.canvas.id).toBe("front");
    });

    test("Pixel editing mode", () => {
        expect(surface.isPixelEditing).toBe(false);
        surface.beginPixelUpdate();
        expect(surface.isPixelEditing).toBe(true);
        surface.endPixelUpdate();
        expect(surface.isPixelEditing).toBe(false);
    });

    test("getPixel and setPixel", () => {
        surface.beginPixelUpdate();
        const color = new HTMLColor("red");
        surface.setPixel(10, 10, color);
        
        const retrieved = surface.getPixel(10, 10);
        expect(retrieved.red).toBe(255);
        expect(retrieved.green).toBe(0);
        expect(retrieved.blue).toBe(0);
        
        surface.endPixelUpdate();
    });

    test("Throws error when getting/setting pixels without beginPixelUpdate", () => {
        expect(() => surface.getPixel(0, 0)).toThrow();
        expect(() => surface.setPixel(0, 0, "blue")).toThrow();
    });

    test("High-level drawing: drawRect", () => {
        const ctx = surface.context;
        const spy = jest.spyOn(ctx, "fillRect");
        
        surface.drawRect(0, 0, 50, 50, "blue", true);
        expect(spy).toHaveBeenCalledWith(0, 0, 50, 50);
        // HTMLColor "blue" is #0000ff
        expect(ctx.fillStyle).toBe("#0000ff");
    });

    test("High-level drawing: drawCircle", () => {
        const ctx = surface.context;
        const spy = jest.spyOn(ctx, "arc");
        
        surface.drawCircle(100, 100, 50, "green", true);
        expect(spy).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI * 2);
    });

    test("High-level drawing: drawLine", () => {
        const ctx = surface.context;
        const spy = jest.spyOn(ctx, "lineTo");
        
        surface.drawLine(0, 0, 100, 100, "white", 2);
        expect(spy).toHaveBeenCalledWith(100, 100);
        expect(ctx.lineWidth).toBe(2);
    });

    test("Clear and ClearLayer", () => {
        surface.clear();
        // Since we mock context per canvas, we can't easily count total clearRect calls across all contexts
        // unless we used a shared mock. But we can check the active one.
        expect(surface.context.clearRect).toHaveBeenCalled();
        
        surface.clearLayer("BACK", "black");
        surface.setTargetLayer("BACK");
        expect(surface.context.fillRect).toHaveBeenCalled();
        expect(surface.context.fillStyle).toBe("#000000");
    });

    test("Snapshot returns a data URL", () => {
        const dataUrl = surface.snapshot();
        expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    test("Scaling surfaces", () => {
        surface.setAttribute("width", "100");
        surface.setAttribute("height", "100");
        
        surface.scale(2, 2);
        
        const front = surface.shadowRoot.querySelector("#front");
        expect(front.width).toBe(200);
        expect(front.height).toBe(200);
        expect(surface.getAttribute("width")).toBe("200");
    });
});
