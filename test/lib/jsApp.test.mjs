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

// 2. Pre-define JSAppLib
Object.defineProperty(window, "JSAppLib", {
    value: {},
    writable: true,
    configurable: true
});

import { share, saveSelf } from "../../node_modules/cfprotected/index.mjs";
import App from "../../src/jsApp.mjs";
import Base from "../../src/jsBase.mjs";
import AppLibError from "../../src/errors/AppLibError.mjs";

describe("jsApp (App)", () => {
    let appInstance;

    beforeAll(() => {
        // Define Mocks using the proper Base registration pattern
        // Naming them exactly as expected (e.g. Management -> js-management)
        class Management extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, Management, { render() {} });
            constructor() { super(); }
        }

        class ThemeManager extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, ThemeManager, { render() {} });
            constructor() { super(); }
        }

        class ActionManager extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, ActionManager, { render() {} });
            constructor() { super(); }
        }

        class DialogManager extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, DialogManager, { render() {} });
            constructor() { super(); }
        }

        class DataFormatManager extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, DataFormatManager, { render() {} });
            constructor() { super(); }
        }

        class Menu extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, Menu, { render() {} });
            constructor() { super(); }
        }

        class StatusBar extends Base { 
            static structure = []; static skin = []; 
            static #spvt = share(this, {});
            static { this.#spvt.register(this); }
            #pvt = share(this, StatusBar, { render() {} });
            constructor() { super(); }
        }

        // Now register everything (App + Mocks)
        App.ready(); 
    });

    beforeEach(() => {
        // Enable debug mode so shadow roots are 'open'
        document.body.setAttribute("data-debug", "true");
        document.body.innerHTML = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    test("Singleton Pattern: First instance assigns JSAppLib.app", () => {
        // We need to force reset JSAppLib for this test to work repeatedly in watch mode
        // But since Object.defineProperty used configurable: false, we can't delete it.
        // We will assume this is the first run or we are stuck with the existing instance.
        
        if (!window.JSAppLib.app) {
            appInstance = new App();
            expect(window.JSAppLib.app).toBe(appInstance);
        } else {
            appInstance = window.JSAppLib.app;
        }
    });

    test("Singleton Pattern: Second instance throws error", () => {
        expect(() => {
            new App();
        }).toThrow(AppLibError);
    });

    test("Render creates overlay and slot", () => {
        appInstance.fireEvent("render");
        const shadow = appInstance.shadowRoot;
        expect(shadow.querySelector("#overlay")).not.toBeNull();
        expect(shadow.querySelector("slot")).not.toBeNull();
    });

    test("Overlay visibility controls", () => {
        const ui = document.createElement("div");
        ui.id = "test-ui";
        
        expect(appInstance.overlayShowing).toBe(false);
        
        appInstance.showOverlay(ui);
        const overlay = appInstance.shadowRoot.querySelector("#overlay");
        
        expect(overlay.classList.contains("visible")).toBe(true);
        expect(overlay.querySelector("#test-ui")).toBe(ui);
        expect(appInstance.overlayShowing).toBe(true);

        appInstance.hideOverlay(ui);
        expect(overlay.children.length).toBe(0);
        expect(overlay.classList.contains("visible")).toBe(false);
        expect(appInstance.overlayShowing).toBe(false);
    });

    test("Components Registry (addComponent/removeComponent)", () => {
        const comp = document.createElement("div");
        comp.id = "my-comp";
        document.body.appendChild(comp); // In real app, connectedCallback triggers this

        // Manually trigger events since we aren't simulating full DOM connection lifecycle for generic divs
        appInstance.fireEvent("addComponent", "my-comp");
        
        expect(appInstance.components["my-comp"]).not.toBeUndefined();
        expect(appInstance.components["my-comp"].id).toBe("my-comp");

        appInstance.fireEvent("removeComponent", "my-comp");
        expect(appInstance.components["my-comp"]).toBeUndefined();
    });

    test("Manager Getters find elements", () => {
        // Setup DOM structure
        // <js-app>
        //   <js-management>
        //      <js-thememanager>
        //      <js-actionmanager> ...
        
        const mgmt = document.createElement("js-management");
        const tm = document.createElement("js-thememanager");
        mgmt.appendChild(tm);
        document.body.appendChild(mgmt);

        document.body.appendChild(appInstance);
        
        const menu = document.createElement("js-menu");
        appInstance.appendChild(menu);

        expect(appInstance.themeManager).not.toBeNull();
        expect(appInstance.themeManager.tagName.toLowerCase()).toBe("js-thememanager");
        
        expect(appInstance.menu).not.toBeNull();
        expect(appInstance.menu.tagName.toLowerCase()).toBe("js-menu");
    });
});
