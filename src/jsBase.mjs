import { share, saveSelf, accessor, abstract } from "../node_modules/cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import WaitBox from "./util/WaitBox.mjs";

const Base = abstract(class Base extends HTMLElement {
    static get #prefix() { return "js"; }

    /**
     * @summary Gets the component's registered HTML tag name.
     * @returns {string} The HTML tag name as a string (e.g., 'js-app').
     * @readonly
     */
    static get tagName() { return Base.$.#tagNames.get(this); }

    static #tagNames = new Map();
    static #tagClasses = new Map();
    static #tagsRegistered = new Set();

    static #spvt = share(this, {
        /**
         * AttributeDef is used to define attributes for Base::initAttributeProperties.
         * @typedef AttributeDef
         * @type object
         * @property {Enum} enumType Property generated must be of the given enum type.  
         * @property {bool} isBool Property generated will be similar to "is<attrName>" if true.
         * @property {bool} readonly No setter will be defined if true.
         * @property {bool} writeonly No getter will be defined if true
         * @property {bool} unbound Skip creating getters & setters.
         * @property {function} getter Custom "get" function for the new property
         * @property {function} setter Custom "set" function for the new property
         * @property {string} caption Overrides default property naming.
         * @property {*} default The value to return if the attribute is not there.
         */

        /**
         * Generates properties on the class prototype for each specified attribute. Must be
         * called before reegister() if used. This will ensure that appropriate properties
         * are set when the class instance is recognized during the custom elements definition
         * process.
         * @param {class} klass The constructor of the target class.
         * @param {object} attributes A dictionary of attribute name keys and {@link AttributeDef} values.
         */
        initAttributeProperties(klass, attributes) {
            let proto = klass.prototype;

            function getAccessors(attr, dflt) {
                function getter() { return this.getAttribute(attr) ?? dflt; }
                function setter(v) {
                    if (v == null) {
                        this.removeAttribute(attr);
                    } else {
                        this.setAttribute(attr, v);
                    }
                }
                return {getter, setter};
            }

            function getBAccessors(attr) {
                function getter() {
                    return this.hasAttribute(attr) &&
                        !["no", "false", "0", "null", ""].includes(this.getAttribute(attr).toLowerCase().trim());
                }
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

            function getEAccessors(attr, enum_t, dflt) {
                function getter() {
                    const value = this.getAttribute(attr) || dflt;
                    let retval = value ? enum_t(value) : void 0; 
                    return retval;
                }
                function setter(v) {
                    if (v == null) {
                        this.removeAttribute(attr);
                    } else {
                        this.setAttribute(attr, (v === "") ? v : enum_t(v).name);
                    }
                }
                return {getter, setter};
            }

            function getNAccessors(attr, range, step, dflt) {
                const [min, max] = range;
                function getter() {
                    return Number(this.getAttribute(attr) || dflt || 0);
                }
                function setter(v) {
                    const val = Number(v);
                    if (isNaN(val) || ((typeof min == "number") && (val < min)) || ((typeof max == "number") && (val > max))){
                        throw new AppLibError(`"${v}" is not a valid numeric value for attribute "${attr}`);
                    }
                    this.setAttribute(attr, val);
                }
                return {getter, setter};
            }

            function getDef(val, access) {
                let retval = { enumerable: true };
                if (!val.writeonly) {
                    retval.get = val.getter || access.getter;
                }
                if (!val.readonly) {
                    retval.set = val.setter || access.setter;
                }
                return retval;
            }

            if (attributes && (typeof(attributes) == "object")) {
                for (let attr in attributes) {
                    let val = attributes[attr];
                    if (!val.unbound) {
                        if (val.enumType) {
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getEAccessors(attr.toLocaleLowerCase(), val.enumType, val.default)));
                        }
                        else if (val.isBool) {
                            let name = val.caption || "is" + attr.substring(0,1 ).toUpperCase() + attr.substring(1);
                            Object.defineProperty(proto, name, getDef(val, getBAccessors(attr.toLocaleLowerCase())));
                        }
                        else if (val.number && typeof(val.number) == "object") {
                            const { range, step } = val.number;
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getNAccessors(attr.toLocaleLowerCase(), range, step, val.default)));
                        }
                        else {
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getAccessors(attr.toLocaleLowerCase(), val.default)));
                        }
                    }
                }
            }
        },
        /**
         * Creates and registeres a new HTML tag based on the class name, the prefix in this
         * base class, and the class itself. Also signals to this library when the App class
         * has been loaded to trigger various things that can only happen after App has been
         * loaded.
         * @param {class} klass The new HTMLElement class being registered as a "Custom Element".
         */
        register(klass) {
            saveSelf(klass, "$");
            const className = klass.name;
            const tag = `${this.$.#prefix}-${className.toLowerCase()}`;
            Base.$.#tagNames.set(klass, tag);
            Base.$.#tagClasses.set(tag, klass);

            // This method now only collects the class and its tag name.
            // The actual registration is handled by registerElements().
        },
        /**
         * @summary Defines all queued custom elements.
         * @description Iterates through all component classes gathered by the `register` method
         * and officially defines them with the browser's `customElements.define()` API.
         * This ensures that all components are registered at a controlled time.
         * This method is intended to be called by `jsApp.ready()` after all library modules are loaded.
         * @protected
         */
        registerElements() {
            const iter = Base.$.#tagClasses[Symbol.iterator]();
            for (const [tag, klass] of iter) {
                if (!customElements.get(tag)) {
                    const className = klass.name;
                    console.log(`Registering "${className}" as "<${tag}>"`);
                    Base.$.#tagsRegistered.add(tag);
                    customElements.define(tag, klass);
                }
            }
        },
        /**
         * Calculates and returns the corresponding tag name for the given class name.
         * @param {String} name Name of the class to retrieve the corresponding tag name.
         * @returns {String} The corresponding tag name for the supplied name.
         */
        tagType(name) {
            return this.$.#spvt.tagTypes(name)[0];
        },
        /**
         * Calculates and returns the corresponding tag names for the given class names.
         * @param {[String]]} names Array of class names to retrieve the corresponding tag names.
         * @returns {[String]} Array of corresponding tag names for the given class names.
         */
        tagTypes(names) {
            let retval = [];
            
            if (!Array.isArray(names)) {
                names = [names];
            }

            for (let name of names) {
                name = name.toLowerCase();
                let tagName = `${Base.$.#prefix}-${name}`;
                retval.push(Base.$.#tagClasses.has(tagName) ? tagName : name);
            }

            return retval;
        }
    });

    static {
        saveSelf(this, "$");
        Base.$.#tagNames.set(this, "");
    }

    static get observedAttributes() { 
        return [ "action", "theme", "style", "class" ];
    }



    #rendering = false;
    #shadowRoot;
    #waitbox = new WaitBox();

    #doRenderContent(content, target) {
        if (!this.$.#rendering) try {
            this.$.#rendering = true;

            this.fireEvent("preRender");

            const app = JSAppLib.app;
            const tm = app ? app.themeManager : null;
            let shadow = target || this.$.#shadowRoot;
            let styles = (!tm || !("ready" in tm)) ? [] : tm.getTagStyle(this, shadow);

            if (!Array.isArray(content)) {
                content = [content];
            }

            shadow.innerHTML = "";
            shadow.adoptedStyleSheets = styles;
            for (let element of content) {
                if (typeof(element) == "string") {
                    let temp = document.createElement("template");
                    temp.innerHTML = element;
                    shadow.appendChild(temp.content);
                }
                else if (element instanceof Node) {
                    shadow.appendChild(element);
                }
            }

            this.fireEvent("postRender");
        } finally {
            this.$.#rendering = false;
        }
    }

    /**
     * Retrieves the class constructor for a given tag name, caching it for future use.
     * @param {string} type The full tag name (e.g., 'js-app', 'div').
     * @returns {Function|null} The constructor for the tag, or null if not found.
     * @private
     */
    #getClassForTag(type) {
        let klass = Base.$.#tagClasses.get(type);
        if (!klass) {
            // For built-in elements, check if it's a known element constructor.
            const potentialClass = window[`HTML${type.charAt(0).toUpperCase() + type.slice(1)}Element`];
            if (typeof potentialClass === 'function' && /\[native code\]/.test(potentialClass.toString())) {
                Base.$.#tagClasses.set(type, potentialClass);
                klass = potentialClass;
            }
        }

        return klass;
    }

    #pvt= share(this, Base, {
        shadowRoot: accessor({
            get() { return this.$.#shadowRoot; }
        }),
        waitbox: accessor({
            get() { return this.$.#waitbox; }
        }),
        render() {
            throw new TypeError(`The protected "render" method must be overridden`);
        },
        onPreRender() {
            /**
             * NOP Function
             * Override to handle the preRender event.
             */
        },
        onPostRender() {
            /**
             * NOP Function
             * Override to handle the postRender event.
             */
        },
        renderContent(content, target) {
            const app = JSAppLib.app;
            const tm = app ? app.themeManager : null;

            if (tm && (!("ready" in tm) || !tm.ready)) {
                app.fireEvent("wait", {tag: this, method: this.$.#doRenderContent, params:[content, target]});
            } else {
                this.$.#doRenderContent(content, target);
            }
        },
        getShadowChild(type, selector) { 
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "") ;
            return this.$.#pvt.shadowRoot.querySelector(s);
        },
        getShadowChildren(type, selector) { 
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "") ;
            return this.$.#pvt.shadowRoot.querySelectorAll(s);
        },
        /**
         * Calculates and returns the corresponding tag name for the given class name.
         * @param {String} name Name of the class to retrieve the corresponding tag name.
         * @returns {String} The corresponding tag name for the supplied name.
         */
        tagType(name) {
            return Base.#spvt.tagTypes([name])[0];
        },
        /**
         * Calculates and returns the corresponding tag names for the given class names.
         * @param {[String]]} names Array of class names to retrieve the corresponding tag names.
         * @returns {[String]} Array of corresponding tag names for the given class names.
         */
        tagTypes(names) {
            return Base.#spvt.tagTypes(names);
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
                                else if (typeof(child) === "string")
                                    retval.appendChild(document.createTextNode(child));
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
        /**
         * Checks to see if the given tag is or inherits from the type specified by its name.
         * Unlike many of the other type managing functions, this one DOES NOT automatically
         * assume that the tag type passed in is a member of this library. As such, it can
         * be used to check the type of any element passed in. However, you must remember to
         * specify the full tag name (preferably using "tagType('name')) when querying for a
         * tag from this library.
         * @param {HTMLElement} target The tag to check.
         * @param {String} The complete name of tag type expected.
         * @returns true if the tag is or inherits from the given type name. Otherwise false.
         */
        isTagType(target, type) {
            let retval = false;
            if ((target instanceof HTMLElement) && (typeof type === 'string')) {
                if (target.tagName.toLowerCase() === type.toLowerCase()) {
                    retval = true;
                }
                else if (type.startsWith(`${Base.#prefix}-`)) {
                    const klass = this.$.#getClassForTag(type);
                    retval = klass ? (target instanceof klass) : false;
                }
            }
            return retval;
        
        },
        validateParent(type, message) {
            const pvt = this.$.#pvt;

            if (!Array.isArray(type)) {
                type = [type];
            }

            let parent = this.parentElement;
            let found = false;
            for (let t of type) {
                if (typeof(t) == "string") {
                    found = pvt.isTagType(parent, pvt.tagType(t));
                }
                else if (typeof(t) == "function") {
                    found = (parent instanceof t);
                }
                if (found) break;
            }

            if (!found) {
                pvt.tagError();
                throw new TypeError(message);
            }
        },
        validateChildren(type, message) {
            const pvt = this.$.#pvt;
            if (!Array.isArray(type)) {
                type = [type];
            }

            for (let child of this.children) {
                let found = false;
                for (let t of type) {
                    if (typeof(t) == "string") {
                        if (pvt.isTagType(child, pvt.tagType(t))) {
                            found = true;
                            break;
                        }
                    }
                    else if (typeof(t) == "function") {
                        if (child instanceof t) {
                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    pvt.tagError();
                    throw new TypeError(message);
                }
            }
        },
        /**
         * Finds the HTMLSlotElement in the shadowRoot of a given tag that 
         * actually contains this element in the display.
         * @param {Base} parent The HTMLElement with a shadowRoot to probe for
         * the slot that contains the current object,
         * @returns parent | HTMLSlotElement
         */
        getShadowParent(parent) {
            let retval = parent;

            if (!retval) {
                retval = this.$.#pvt.shadowRoot.host;
            }
            else {
                const shadow = (retval instanceof Base) ? retval.$.#shadowRoot : null;

                if (shadow) {
                    let slotName = this.getAttribute("slot") || "";
                    let slot = slotName ? `[name=${slotName}]` : ":not([name])";
                    retval = shadow.querySelector(`slot${slot}`);
                }
            }

            return retval;
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
            const pvt = this.$.#pvt;

            if (typeof not === "string") {
                noerr = message;
                message = not;
                not = false;
            }

            if (!Array.isArray(type)) {
                type = [type];
            }

            let parent = this.parentElement;
            let found = false;

            while (parent && (parent != document.body)) {
                for (let t of type) {
                    if (typeof(t) == "string") {
                        if (pvt.isTagType(parent, pvt.tagType(t))) {
                            found = true;
                            break;
                        }
                    }
                    else if (typeof(t) == "function") {
                        if (parent instanceof t) {
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
                parent = parent.parentElement;
            }

            if ((not && found) || (!not && !found)) {
                if (!noerr) pvt.tagError();
                throw new TypeError(message);
            }
        },
        tagError() {
            this.$.#shadowRoot.innerHTML = "";
            this.$.#shadowRoot.appendChild(this.$.#pvt.make("h3", 
                { style:"background-color: red; color: yellow; font-weight: bold;" },
                { innerHTML: "ERROR!" }));
        },
        /**
         * Registers handler functions for each event key in the map.
         * @param {Object} pvt The protected container of the calling class.
         * @param {Object} map Key:value pairs where the key is the event name, and the value is either a function or name of a protected member function.
         */
        registerEvents(pvt, map) {
            if (!map) {
                throw new AppLibError("Must provide a map of event handlers.");
            }
            if (!pvt) {
                throw new AppLibError("Must provide the class instance's protected container.");
            }

            for (let event in map) {
                let fn = map[event];

                if ((typeof fn !== "function") && !pvt[fn]) {
                    throw new AppLibError(`Cannot register non-existent event handler for "${event}" on ${this.tagName}`);
                }
                if (typeof fn === "function") {
                    this.addEventListener(event, fn);
                }
                else if (typeof fn === "string") {
                    this.addEventListener(event, pvt[fn]);
                }
                else {
                    throw new AppLibError(`Attempted to register ${fn.toString} as an event handler for "${event}" on ${this.tagName}.`);
                }
            }
        },
        onWait(e) {
            let {tag, method, params} = e.detail;
            this.$.#waitbox.add(tag, method, params);
        }
    });

    constructor() {
        super();
        saveSelf(this, "$");

        const pvt = this.#pvt;

        //Set up the shadow DOM
        if (document.body.hasAttribute("data-debug")) {
            this.#shadowRoot = this.attachShadow({mode: "open"});
        }
        else {
            this.#shadowRoot = this.attachShadow({mode: "closed"});
        }
        pvt.registerEvents(pvt, {
            render: () => pvt.render(),
            preRender: () => pvt.onPreRender(),
            postRender: () => pvt.onPostRender(),
            wait: "onWait"
        });
    }

    attributeChangedCallback(attr, oldV, newV) {
        this.fireEvent(`${attr}Changed`, { oldValue: oldV, newValue: newV });
    }

    connectedCallback() {
        const pvt = this.$.#pvt;
        const app = JSAppLib.app;

        if (app && pvt.isTagType(app, pvt.tagType("app"))) {
            const container = app.components || app;
            if (this.id && !(this.id in container)) {
                app.fireEvent("addComponent", this.id);
            }
        }
        this.fireEvent("render");
    }

    disconnectedCallback() {
        const pvt = this.$.#pvt;
        const app = JSAppLib.app;

        if (app && pvt.isTagType(app, pvt.tagType("app"))) {
            const container = app.components || app;
            if (this.id in container) {
                app.fireEvent("removeComponent", this.id);
            }
        }
    }

    fireEvent(name, obj) {
        let event = new CustomEvent(name, { detail: obj });

        this.dispatchEvent(event);
    }

    fireEventAsync(name, obj) {
        setTimeout(() => {
            this.fireEvent(name, obj);
        }, 1);
    }

    get elementTagName() {
        return this.nodeName.toLowerCase();
    }

    get isRendered() {
        return this.$.#pvt.shadowRoot.innerHTML.length > 0;
    }
});

export default Base;
