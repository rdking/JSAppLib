import { jest, describe, test, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import Base from "../../src/jsBase.mjs";
import App from "../../src/jsApp.mjs";
import { share, saveSelf } from "../../node_modules/cfprotected/index.mjs";
import AppLibError from "../../src/errors/AppLibError.mjs";

class TestElement extends Base {
    static #spvt = share(this, {});

    static {
        saveSelf(this, "$");
    }

    static register(klass) { return this.$.#spvt.register(klass); }
    static registerElements() { return this.$.#spvt.registerElements(); }
    static initAttributeProperties(klass, attrs) { return this.$.#spvt.initAttributeProperties(klass, attrs); }
    static testTagType(name) { return this.$.#spvt.tagType(name); }
    static testTagTypes(names) { return this.$.#spvt.tagTypes(names); }

    #pvt = share(this, TestElement, {
        render() {
            this.innerHTML = "Rendered";
        }
    });

    constructor() {
        super();
        saveSelf(this, "$");
    }

    testMake(tag, attrs, props) { return this.$.#pvt.make(tag, attrs, props); }
    testIsTagType(target, type) { return this.$.#pvt.isTagType(target, type); }
    testValidateParent(type, msg) { return this.$.#pvt.validateParent(type, msg); }
    testValidateChildren(type, msg) { return this.$.#pvt.validateChildren(type, msg); }
    testValidateAncestry(type, not, msg, noerr) { return this.$.#pvt.validateAncestry(type, not, msg, noerr); }
    testGetShadowParent(parent) { return this.$.#pvt.getShadowParent(parent); }
    testRegisterEvents(pvt, map) { return this.$.#pvt.registerEvents(pvt, map); }
    testTagError() { return this.$.#pvt.tagError(); }
    testGetShadowChild(type, sel) { return this.$.#pvt.getShadowChild(type, sel); }
    testGetShadowChildren(type, sel) { return this.$.#pvt.getShadowChildren(type, sel); }
    testOnWait(e) { return this.$.#pvt.onWait(e); }
    
    doRenderContent(content, target) {
        this.$.#pvt.renderContent(content, target);
    }
    
    getWaitBox() {
        return this.$.#pvt.waitbox;
    }

    getPvt() {
        return this.$.#pvt;
    }
}

describe("jsBase (Base)", () => {
    let element;
    let mockApp;

    beforeAll(() => {
        TestElement.register(TestElement);
        TestElement.registerElements(); 

        // Creating js-app triggers App constructor which defines window.JSAppLib.app
        mockApp = document.createElement("js-app");
        
        // Override read-only properties on the instance
        Object.defineProperty(mockApp, "components", {
            value: {},
            writable: true,
            configurable: true
        });
        Object.defineProperty(mockApp, "themeManager", {
            value: {
                getTagStyle: jest.fn(() => []),
                ready: true
            },
            writable: true,
            configurable: true
        });
        
        mockApp.fireEvent = jest.fn((name, detail) => {});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockApp.components = {};
        
        document.body.setAttribute("data-debug", "true");
        document.body.innerHTML = "";
        element = document.createElement("js-testelement");
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        document.body.removeAttribute("data-debug");
    });

    describe("Static Methods", () => {
        test("tagName returns the correct tag name", () => {
            expect(TestElement.tagName).toBe("js-testelement");
        });

        test("tagType returns correct tag name", () => {
            expect(TestElement.testTagType("TestElement")).toBe("js-testelement");
            expect(TestElement.testTagType("div")).toBe("div");
        });

        test("tagTypes returns array of tag names", () => {
            const types = TestElement.testTagTypes(["TestElement", "Span"]);
            expect(types).toEqual(["js-testelement", "span"]);
        });

        describe("initAttributeProperties", () => {
            class AttrTest extends Base {
                static #spvt = share(this, {}); 
                static { saveSelf(this, "$"); }
                render() {} 
            }
            
            beforeAll(() => {
                TestElement.register(AttrTest);
                TestElement.registerElements();
            });

            test("defines properties correctly", () => {
                const attrs = {
                    testStr: { default: "default" },
                    testBool: { isBool: true },
                    testEnum: { enumType: (v) => ({name: v}) },
                    testNum: { number: { range: [0, 10] }, default: 5 },
                    testCustom: { 
                        getter: function() { return "customGet"; },
                        setter: function(v) { this.setAttribute("custom", v); }
                    }
                };

                TestElement.initAttributeProperties(AttrTest, attrs);
                
                const instance = new AttrTest();
                
                // String
                expect(instance.testStr).toBe("default");
                instance.testStr = "newValue";
                expect(instance.getAttribute("teststr")).toBe("newValue");
                expect(instance.testStr).toBe("newValue");

                // Bool
                expect(instance.isTestBool).toBe(false);
                instance.isTestBool = true;
                expect(instance.hasAttribute("testbool")).toBe(true);
                
                instance.setAttribute("testbool", "true");
                expect(instance.isTestBool).toBe(true);

                instance.isTestBool = false;
                expect(instance.hasAttribute("testbool")).toBe(false);

                // Enum
                instance.testEnum = "Value";
                expect(instance.getAttribute("testenum")).toBe("Value");
                instance.testEnum = null;
                expect(instance.hasAttribute("testenum")).toBe(false);

                // Number
                expect(instance.testNum).toBe(5);
                instance.testNum = 8;
                expect(instance.getAttribute("testnum")).toBe("8");
                expect(instance.testNum).toBe(8);
                
                expect(() => { instance.testNum = 11; }).toThrow(AppLibError);

                // Custom
                expect(instance.testCustom).toBe("customGet");
                instance.testCustom = "val";
                expect(instance.getAttribute("custom")).toBe("val");
            });
        });
    });

    describe("Lifecycle & Instance Methods", () => {
        test("constructor creates shadow root", () => {
            expect(element.shadowRoot).not.toBeNull();
        });

        test("connectedCallback detects component connection", () => {
            expect(element.testIsTagType(window.JSAppLib.app, "js-app")).toBe(true);
            
            element.remove();
            element.id = "conn-test";
            document.body.appendChild(element);
            
            expect(window.JSAppLib.app.fireEvent).toHaveBeenCalledWith("addComponent", "conn-test");
        });

        test("disconnectedCallback detects component disconnection", () => {
            element.id = "test-id";
            window.JSAppLib.app.components["test-id"] = element;
            
            document.body.removeChild(element);
            
            expect(window.JSAppLib.app.fireEvent).toHaveBeenCalledWith("removeComponent", "test-id");
        });

        test("attributeChangedCallback fires event", () => {
            const spy = jest.spyOn(element, "fireEvent");
            element.attributeChangedCallback("data-test", "old", "new");
            expect(spy).toHaveBeenCalledWith("data-testChanged", { oldValue: "old", newValue: "new" });
        });

        test("fireEvent dispatches CustomEvent", () => {
            const listener = jest.fn();
            element.addEventListener("my-event", listener);
            element.fireEvent("my-event", { foo: "bar" });
            expect(listener).toHaveBeenCalled();
            expect(listener.mock.calls[0][0].detail).toEqual({ foo: "bar" });
        });

        test("fireEventAsync dispatches event asynchronously", (done) => {
            const listener = jest.fn();
            element.addEventListener("async-event", listener);
            element.fireEventAsync("async-event", { foo: "bar" });
            
            expect(listener).not.toHaveBeenCalled();
            setTimeout(() => {
                expect(listener).toHaveBeenCalled();
                done();
            }, 10);
        });

        test("elementTagName returns lowercase node name", () => {
            expect(element.elementTagName).toBe("js-testelement");
        });

        test("isRendered returns correct state", () => {
            expect(element.isRendered).toBe(false);
            element.doRenderContent("<div>Hi</div>");
            expect(element.isRendered).toBe(true);
        });
    });

    describe("Protected Utilities (via TestElement wrappers)", () => {
        test("make creates elements with attributes and properties", () => {
            const el = element.testMake("div", { id: "my-div" }, { innerHTML: "Hello" });
            expect(el.tagName).toBe("DIV");
            expect(el.id).toBe("my-div");
            expect(el.innerHTML).toBe("Hello");
        });

        test("isTagType validates types", () => {
            expect(element.testIsTagType(element, "js-testelement")).toBe(true);
            expect(element.testIsTagType(element, TestElement.testTagType("TestElement"))).toBe(true);
            
            const div = document.createElement("div");
            expect(element.testIsTagType(div, "div")).toBe(true);
            expect(element.testIsTagType(div, "span")).toBe(false);
        });

        test("validateParent checks parent type", () => {
            const child = document.createElement("js-testelement");
            const parent = document.createElement("div");
            document.body.appendChild(parent);
            parent.appendChild(child);
            
            element.testValidateParent("body");
            expect(() => element.testValidateParent("div", "Wrong parent")).toThrow("Wrong parent");
        });

        test("validateChildren checks children types", () => {
            const child = document.createElement("div");
            element.appendChild(child);
            
            element.testValidateChildren("div"); 
            expect(() => element.testValidateChildren("span", "Wrong child")).toThrow("Wrong child");
        });

        test("validateAncestry checks ancestors", () => {
            const grandParent = document.createElement("div");
            const parent = document.createElement("span");
            grandParent.appendChild(parent);
            parent.appendChild(element);
            
            element.testValidateAncestry("div", false, "No ancestor");
            expect(() => element.testValidateAncestry("section", false, "Missing ancestor")).toThrow("Missing ancestor");
            
            expect(() => element.testValidateAncestry("div", true, "Should not have div ancestor")).toThrow("Should not have div ancestor");
        });

        test("getShadowParent finds the slot or host", () => {
            expect(element.testGetShadowParent(null)).toBe(element);
        });

        test("registerEvents registers listeners", () => {
            const handler = jest.fn();
            element.testRegisterEvents(element.getPvt(), { "custom-event": handler });
            element.fireEvent("custom-event");
            expect(handler).toHaveBeenCalled();
        });
        
        test("tagError displays error in shadow root", () => {
            element.testTagError();
            const h3 = element.shadowRoot.querySelector("h3");
            expect(h3).not.toBeNull();
            expect(h3.innerHTML).toBe("ERROR!");
        });
    });

    describe("Rendering Logic", () => {
        test("renderContent populates shadow root", () => {
            element.doRenderContent("<p>Test</p>");
            const p = element.shadowRoot.querySelector("p");
            expect(p).not.toBeNull();
            expect(p.innerHTML).toBe("Test");
        });

        test("renderContent handles Nodes", () => {
            const node = document.createElement("span");
            node.textContent = "Node content";
            element.doRenderContent([node]);
            const span = element.shadowRoot.querySelector("span");
            expect(span.textContent).toBe("Node content");
        });

        test("renderContent waits if themeManager not ready", () => {
            window.JSAppLib.app.themeManager.ready = false;
            window.JSAppLib.app.fireEvent.mockClear();
            
            element.doRenderContent("<div>Delayed</div>");
            
            expect(window.JSAppLib.app.fireEvent).toHaveBeenCalledWith("wait", expect.objectContaining({
                tag: element,
                method: expect.any(Function)
            }));
            
            window.JSAppLib.app.themeManager.ready = true;
        });

        test("onWait adds to WaitBox", () => {
            const wb = element.getWaitBox();
            const spy = jest.spyOn(wb, "add");
            
            element.testOnWait({ detail: { tag: element, method: () => {}, params: [] } });
            expect(spy).toHaveBeenCalled();
        });
    });
});