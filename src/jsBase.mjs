import { share, saveSelf, accessor, abstract } from "../node_modules/cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import WaitBox from "./util/WaitBox.mjs";
import ThemeCache from "./util/ThemeCache.mjs";
import CSS from "./util/Selectors.mjs";

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
    static #themeCache = new ThemeCache(Base.#prefix);

    static #spvt = share(this, {
        /**
         * @returns {ThemeCache} The shared ThemeCache instance.
         */
        get themeCache() { return Base.#themeCache; },

        /**
         * Generates properties on the class prototype for each specified attribute.
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
                return { getter, setter };
            }

            function getBAccessors(attr) {
                function getter() {
                    return this.hasAttribute(attr) &&
                        !["no", "false", "0", "null"].includes(this.getAttribute(attr).toLowerCase().trim());
                }
                function setter(v) {
                    if (v) {
                        this.setAttribute(attr, "");
                    }
                    else {
                        this.removeAttribute(attr);
                    }
                }
                return { getter, setter };
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
                return { getter, setter };
            }

            function getNAccessors(attr, range, step, dflt) {
                const [min, max] = range;
                function getter() {
                    return Number(this.getAttribute(attr) || dflt || 0);
                }
                function setter(v) {
                    const val = Number(v);
                    if (isNaN(val) || ((typeof min == "number") && (val < min)) || ((typeof max == "number") && (val > max))) {
                        throw new AppLibError(`"${v}" is not a valid numeric value for attribute "${attr}`);
                    }
                    this.setAttribute(attr, val);
                }
                return { getter, setter };
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

            if (attributes && (typeof (attributes) == "object")) {
                for (let attr in attributes) {
                    let val = attributes[attr];
                    if (!val.unbound) {
                        if (val.enumType) {
                            Object.defineProperty(proto, val.caption || attr, getDef(val, getEAccessors(attr.toLocaleLowerCase(), val.enumType, val.default)));
                        }
                        else if (val.isBool) {
                            let name = val.caption || "is" + attr.substring(0, 1).toUpperCase() + attr.substring(1);
                            Object.defineProperty(proto, name, getDef(val, getBAccessors(attr.toLocaleLowerCase())));
                        }
                        else if (val.number && typeof (val.number) == "object") {
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
         * Creates and registeres a new HTML tag based on the class name.
         * @param {class} klass The new HTMLElement class being registered.
         */
        register(klass) {
            saveSelf(klass, "$");
            const className = klass.name;
            const tag = `${this.$.#prefix}-${className.toLowerCase()}`;
            Base.$.#tagNames.set(klass, tag);
            Base.$.#tagClasses.set(tag, klass);
        },
        /**
         * @summary Defines all queued custom elements.
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
         */
        tagType(name) {
            return this.$.#spvt.tagTypes(name)[0];
        },
        /**
         * Calculates and returns the corresponding tag names for the given class names.
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
        CSS.tagTransformer = (name) => Base.#spvt.tagType(name);
    }

    /**
     * Returns the default style configuration for this component.
     * Override this in subclasses to provide specific structural and skin styles.
     * @returns {Array<Array>} A tuple [[structure], [skin]] containing DSL rule arrays.
     * @protected
     */
    static getDefaultStyleSheet() {
        return [[], []];
    }

    static get observedAttributes() {
        return ["action", "theme", "style", "class"];
    }

    #rendering = false;
    #shadowRoot;
    #waitbox = new WaitBox();
    #styleHandler = null;

    #doRenderContent(content, target) {
        if (!this.$.#rendering) try {
            this.$.#rendering = true;

            this.fireEvent("preRender");

            let shadow = target || this.$.#shadowRoot;

            // Apply styles from ThemeCache
            const tagName = this.tagName.toLowerCase();
            const styles = [
                ...Base.#themeCache.getGlobalStyles(),
                ...Base.#themeCache.getStyles(tagName)
            ];
            shadow.adoptedStyleSheets = styles;

            if (!Array.isArray(content)) {
                content = [content];
            }

            shadow.innerHTML = "";
            for (let element of content) {
                if (typeof (element) == "string") {
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
     * Retrieves the class constructor for a given tag name.
     */
    #getClassForTag(type) {
        let klass = Base.$.#tagClasses.get(type);
        if (!klass) {
            const potentialClass = window[`HTML${type.charAt(0).toUpperCase() + type.slice(1)}Element`];
            if (typeof potentialClass === 'function' && /\[native code\]/.test(potentialClass.toString())) {
                Base.$.#tagClasses.set(type, potentialClass);
                klass = potentialClass;
            }
        }
        return klass;
    }

    #pvt = share(this, Base, {
        themeCache: accessor({
            get() { return Base.#themeCache; }
        }),
        shadowRoot: accessor({
            get() { return this.$.#shadowRoot; }
        }),
        waitbox: accessor({
            get() { return this.$.#waitbox; }
        }),
        render() {
            throw new TypeError(`The protected "render" method must be overridden`);
        },
        onPreRender() { },
        onPostRender() { },

        renderContent(content, target) {
            this.$.#doRenderContent(content, target);
        },

        updateStyles(e) {
            const affectedTags = e.detail;
            if (!affectedTags || affectedTags.includes(this.tagName.toLowerCase())) {
                const shadow = this.$.#shadowRoot;
                const styles = [
                    ...Base.#themeCache.getGlobalStyles(),
                    ...Base.#themeCache.getStyles(this.tagName.toLowerCase())
                ];
                shadow.adoptedStyleSheets = styles;
            }
        },

        getShadowChild(type, selector) {
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "");
            return this.$.#pvt.shadowRoot.querySelector(s);
        },
        getShadowChildren(type, selector) {
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "");
            return this.$.#pvt.shadowRoot.querySelectorAll(s);
        },
        tagType(name) {
            return Base.#spvt.tagTypes([name])[0];
        },
        tagTypes(names) {
            return Base.#spvt.tagTypes(names);
        },
        make(tag, attributes, properties) {
            let retval = document.createElement(tag);
            if (attributes && (typeof (attributes) == "object")) {
                for (let key in attributes) {
                    retval.setAttribute(key, attributes[key]);
                }
            }
            if (properties && (typeof (properties) == "object")) {
                for (let key in properties) {
                    switch (key) {
                        case "children":
                            for (let child of properties.children) {
                                if (child instanceof Node)
                                    retval.appendChild(child);
                                else if (typeof (child) === "string")
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
        isTagType(target, type) {
            let retval = false;

            if ((target instanceof HTMLElement) && (typeof type === 'string')) {
                type = this.$.#pvt.tagType(type);
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
            if (!Array.isArray(type)) type = [type];

            let parent = this.parentElement;
            let found = false;
            for (let t of type) {
                if (typeof (t) == "string") {
                    found = pvt.isTagType(parent, pvt.tagType(t));
                } else if (typeof (t) == "function") {
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
            if (!Array.isArray(type)) type = [type];

            for (let child of this.children) {
                let found = false;
                for (let t of type) {
                    if (typeof (t) == "string") {
                        if (pvt.isTagType(child, pvt.tagType(t))) {
                            found = true;
                            break;
                        }
                    } else if (typeof (t) == "function") {
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
        getShadowParent(parent) {
            let retval = parent;
            if (!retval) {
                retval = this.$.#pvt.shadowRoot.host;
            } else {
                const shadow = (retval instanceof Base) ? retval.$.#shadowRoot : null;
                if (shadow) {
                    let slotName = this.getAttribute("slot") || "";
                    let slot = slotName ? `[name=${slotName}]` : ":not([name])";
                    retval = shadow.querySelector(`slot${slot}`);
                }
            }
            return retval;
        },
        validateAncestry(type, not, message, noerr) {
            const pvt = this.$.#pvt;
            if (typeof not === "string") {
                noerr = message;
                message = not;
                not = false;
            }
            if (!Array.isArray(type)) type = [type];

            let parent = this.parentElement;
            let found = false;

            while (parent && (parent != document.body)) {
                for (let t of type) {
                    if (typeof (t) == "string") {
                        if (pvt.isTagType(parent, pvt.tagType(t))) {
                            found = true;
                            break;
                        }
                    } else if (typeof (t) == "function") {
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
                { style: "background-color: red; color: yellow; font-weight: bold;" },
                { innerHTML: "ERROR!" }));
        },
        registerEvents(pvt, map) {
            if (!map) throw new AppLibError("Must provide a map of event handlers.");
            if (!pvt) throw new AppLibError("Must provide the class instance's protected container.");

            for (let event in map) {
                let fn = map[event];
                if ((typeof fn !== "function") && !pvt[fn]) {
                    throw new AppLibError(`Cannot register non-existent event handler for "${event}" on ${this.tagName}`);
                }
                if (typeof fn === "function") {
                    this.addEventListener(event, fn);
                } else if (typeof fn === "string") {
                    this.addEventListener(event, pvt[fn]);
                } else {
                    throw new AppLibError(`Attempted to register ${fn.toString} as an event handler for "${event}" on ${this.tagName}.`);
                }
            }
        },
        onWait(e) {
            let { tag, method, params } = e.detail;
            this.$.#waitbox.add(tag, method, params);
        }
    });

    constructor() {
        super();
        saveSelf(this, "$");

        const pvt = this.#pvt;

        if (document.body.hasAttribute("data-debug")) {
            this.#shadowRoot = this.attachShadow({ mode: "open" });
        } else {
            this.#shadowRoot = this.attachShadow({ mode: "closed" });
        }

        // Lazy style registration
        const tag = this.tagName.toLowerCase();
        if (!Base.#themeCache.has(tag)) {
            const [structure, skin] = this.constructor.getDefaultStyleSheet();
            Base.#themeCache.registerComponent(tag, structure, skin);
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

        //pvt.updateStyles({details: [ this.tagName.toLowerCase()]});
        Base.#themeCache.addEventListener("styleUpdate", pvt.updateStyles);

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

        Base.#themeCache.removeEventListener("styleUpdate", pvt.updateStyles);
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

    /**
     * Returns all shadow DOM slots of this element.
     * @returns {string[]}
     */
    get slots() {
        return Array.from(this.$.#pvt.shadowRoot.querySelectorAll("slot")).map(s => s.getAttribute("name"));
    }
});

export default Base;
