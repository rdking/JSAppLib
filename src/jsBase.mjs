import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import WaitBox from "./util/WaitBox.mjs";

export default class Base extends HTMLElement {
    static get #prefix() { return "js"; }

    static get tagName() { return Base.$.#tagNames.get(this); }

    static #tagNames = new Map();
    static #tagsRegistered = new Set();
    static #appLoaded = false;

    static #spvt = share(this, {
        /**
         * AttributeDef is used to define attributes for Base::initAttributeProperties
         * @typedef AttributeDef
         * @type object
         * @property {Enum} enum_t  
         * @property {bool} isBool Property generated will be similar to "is<AttrName>" if true.
         * @property {bool} readonly No setter will be defined if true.
         * @property {bool} writeonly No getter will be defined if true
         * @property {bool} unbound Skip creating getters & setters.
         * @property {string} caption Overrides default property naming.
         */

        /**
         * Generates properties on the class prototype for each specified attribute.
         * @param {class} klass The constructor of the target class.
         * @param {object} attributes A dictionary of attribute name keys and {@link AttributeDef} values.
         */
        initAttributeProperties(klass, attributes) {
            let proto = klass.prototype;

            function getAccessors(attr) {
                function getter() { return this.getAttribute(attr); }
                function setter(v) { this.setAttribute(attr, v); }
                return {getter, setter};
            }

            function getBAccessors(attr) {
                function getter() { return this.hasAttribute(attr); }
                function setter(v) {
                    if (v) {
                        this.setAttribute(attr, "");
                    }
                    else {
                        this.removeAttribute(attr);
                    }
                }
                return {getter, setter};
            }

            function getEAccessors(attr, enum_t) {
                function getter() {
                    let retval = this.getAttribute(attr); 
                    return retval ? enum_t(retval) : retval;
                }
                function setter(v) {
                    this.setAttribute(attr, ["",void 0].includes(v) ? v : enum_t(v).name);
                }
                return {getter, setter};
            }

            function getDef(val, access) {
                let retval = { enumerable: true };
                if (!val.writeonly) {
                    retval.get = access.getter;
                }
                if (!val.readonly) {
                    retval.set = access.setter;
                }
                return retval;
            }

            if (attributes && (typeof(attributes) == "object")) {
                for (let attr in attributes) {
                    let val = attributes[attr];
                    if (!val.unbound) {
                        if (val.enum_t) {
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getEAccessors(attr.toLocaleLowerCase(), val.enum_t)));
                        }
                        else if (val.isBool) {
                            let name = val.caption || "is" + attr.substring(0,1 ).toUpperCase() + attr.substring(1);
                            Object.defineProperty(proto, name, getDef(val, getBAccessors(attr.toLocaleLowerCase())));
                        }
                        else {
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getAccessors(attr.toLocaleLowerCase())));
                        }
                    }
                }
            }
        },
        register(klass) {
            saveSelf(klass, "$");
            const className = klass.name;
            const tag = `${this.$.#prefix}-${className.toLowerCase()}`;
            Base.$.#tagNames.set(klass, tag);
            console.log(`Registering "${className}" as "<${tag}>"`);
            if (!Base.$.#appLoaded && (className == "App")) {
                Base.$.#appLoaded = true;
            }
            Base.$.#tagsRegistered.add(tag);
            customElements.define(tag, klass);
        }
    });

    static {
        saveSelf(this, "$");
        Base.$.#tagNames.set(this, "");
    }

    static get observedAttributes() { return [
        "action", "theme", "style", "classList"
    ]; }

    static get observedEvents() { return [
        "preRender", "render", "postRender", "resized", "parentResized"
    ]; }

    #rendering = false;

    #pvt= share(this, Base, {
        getBounds(other, withMargins) {
            let e = other || this;
            let b = e.getBoundingClientRect();
            let c = window.getComputedStyle(e);
            let {height, width} = b;
            let top = e.offsetTop, left = e.offsetLeft;
            let margins = {
                top: parseFloat(c.marginTop),
                left: parseFloat(c.marginLeft),
                right: parseFloat(c.marginRight),
                bottom: parseFloat(c.marginBottom)
            };
            
            while (e.offsetParent) {
                e = e.offsetParent;
                top += e.offsetTop + (e.scrollX || e.scrollLeft || 0);
                left += e.offsetLeft + (e.scrollY || e.scrollTop || 0);         
            }

            if (withMargins) {
                top -= margins.top;
                left -= margins.left;
                width += margins.left + margins.right;
                height += margins.top + margins.bottom;
            }
    
            return { top: ~~top, left: ~~left, width: ~~width, height: ~~height };
        },
        tagType(name) {
            return this.$.#pvt.tagTypes(name)[0];
        },
        tagTypes(names) {
            let retval = [];
            
            if (!Array.isArray(names)) {
                names = [names];
            }

            for (let name of names) {
                retval.push(`${Base.$.#prefix}-${name}`)
            }

            return retval;
        },
        make(tag, attributes, properties) {
            let retval = document.createElement(tag);
            if (attributes && (typeof(attributes) == "object")) {
                for (let key in attributes) {
                    retval.setAttribute(key, attributes[key]);
                }
            }
            if (properties && (typeof(properties) == "object")) {
                for (let key in properties) {
                    switch (key) {
                        case "children":
                            for (let child of properties.children) {
                                if (child instanceof Node)
                                    retval.appendChild(child);
                            }
                            break;
                        case "parent":
                            properties[key].appendChild(retval);
                            break;
                        default:
                            retval[key] = properties[key];
                    }
                }
            }
            return retval;
        },
        childrenResized() {
            for (let child of this.children) {
                if ("fireEvent" in child)
                    child.fireEvent("parentResized");
            }
        },
        isTagType(target, type) {
            let k = target.cla$$ || target.constructor;
            let nodeName = target.nodeName.toLowerCase()
            let klasses = [k ? (k.tagName || nodeName || k.name) : nodeName];

            while (k !== HTMLElement) {
                k = Object.getPrototypeOf(k);
                klasses.push(k.tagName || k.name);
            }

            return klasses.includes(type);
        },
        renderContent(content, target) {
            const tm = app.themeManager;

            if (tm && ("ready" in tm) && !tm.ready) {
                this.fireEvent.call(tm, "wait", {tag: this, method: this.$.#doRenderContent, params:[content, target]});
            } else {
                this.$.#doRenderContent(content, target);
            }
        },
        validateChildren(type, message) {
            if (["function", "string"].includes(typeof(type))) {
                type = [type];
            }
            for (let child of this.children) {
                let found = false;
                for (let t of type) {
                    if (typeof(t) == "string") {
                        found |= this.$.#pvt.isTagType(child, t);
                    }
                    else {
                        found |= t(child);
                    }
                }

                if (!found) {
                    this.$.#tagError();
                    throw new TypeError(message);
                }
            }
        },
        validateParent(type, message) {
            if (typeof(type) == "string") {
                type = [type];
            }

            let parent = this.parentElement;
            let found = false;
            for (let t of type) {
                found |= this.$.#pvt.isTagType(parent, t);
            }

            if (!found) {
                this.$.#tagError();
                throw new TypeError(message);
            }
        },
        /**
         * Throws a TypeError if the specified tag is not an ancestor of the
         * current tag. Setting "not" to true causes the exception to be thrown
         * if the specified tag is an ancestor.
         * @param {string|Array} type Name or list of names of the tag(s) to look for.
         * @param {boolean} not Negates the search result.
         * @param {string} message The error message thrown on failure.
         * @param {boolean} noerr If true, tagError will not be called
         */
        validateAncestry(type, not, message, noerr) {
            if (arguments.length < 2) {
                message = not;
                not = false;
            }

            if (typeof(type) == "string") {
                type = [type];
            }

            let parent = this.parentElement;
            let found = false;

            while (parent && (parent != document.body)) {
                for (let t of type) {
                    found |= this.$.#pvt.isTagType(parent, t);
                }

                if (!found) {
                    if (!noerr) this.$.#tagError();
                    throw new TypeError(message);
                }
            }
        },
        render() {
            throw new TypeError(`The protected "render" method must be overridden`);
        }
    });

    #doRenderContent(content, target) {
        if (!this.$.#rendering) try {
            this.$.#rendering = true;

            this.fireEvent("preRender");

            const tm = app.themeManager;
            let shadow = target || this.shadowRoot;
            let link = (!tm || !("ready" in tm)) ? null : tm.getTagStyle(this.tagName.toLowerCase());

            if (!Array.isArray(content)) {
                content = [content];
            }
            shadow.innerHTML = link || "";
            for (let element of content) {
                if (typeof(element) == "string") {
                    shadow.innerHTML += element;
                }
                else if (element instanceof Node) {
                    shadow.appendChild(element);
                }
            }

            this.fireEvent("postRender");

            if (target !== shadow) {
                this.$.#pvt.childrenResized();
            }
        } finally {
            this.$.#rendering = false;
        }
    }

    #tagError() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(this.$.#pvt.make("h3", 
            { style:"background-color: red; color: yellow; font-weight: bold;" },
            { innerHTML: "ERROR!" }));
    }

    constructor() {
        super();
        saveSelf(this, "$");

        //Set up the shadow DOM
        this.attachShadow({mode: "open"});
    }

    attributeChangedCallback(attr, oldV, newV) {
        let attrName = attr + "Changed";
        this.fireEvent(attrName, { oldValue: oldV, newValue: newV });
    }

    connectedCallback() {
        const pvt = this.$.#pvt;
        if (globalThis.app && pvt.isTagType(app, pvt.tagTypes("app"))) {
            if (this.id && !(this.id in app)) {
                app.fireEvent("addComponent", this.id);
            }
        }
        this.fireEvent("render");
    }

    disconnectedCallback() {
        const pvt = this.$.#pvt;
        if (globalThis.app && pvt.isTagType(app, pvt.tagTypes("app"))) {
            if (this.id in app) {
                app.fireEvent("removeComponent", this.id);
            }
        }
    }

    fireEvent(name, obj) {
        let event = new CustomEvent(name, { detail: obj });

        this.dispatchEvent(event);
    }
}
