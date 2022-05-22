import { share, abstract, saveSelf, accessor } from "/node_modules/cfprotected/index.mjs";

const TagBase = abstract(class TagBase extends HTMLElement {
    static #themeManager = null;
    static #registered = [];
    static #ready = false;
    static #renderQueue = [];
    static #sprot = share(this, {
        /**
         * Performs deferred registration of tags, giving the library a chance
         * to collect configuration information before registering,
         * constructing, and rendering the tags.
         * @param {Function} tag Constructor of the class defining the tag to
         * be registered.
         */
        registerTag: (tag) => {
            saveSelf(tag, "pvt");  //Convenience for the derived classes
            this.pvt.#registerEvents(tag);
            console.debug(`registerTag: defining element '${tag.tagName}' using class '${tag.name}'`);
            if (!!tag.isManagement) {
                customElements.define(tag.tagName, tag);
            }
            else {
                this.pvt.#registered.push({name:tag.tagName, tag});
            }
        },

        initTags() {
            const tm = document.querySelector("js-thememanager");
            if (!tm || tm.ready) {
                this.pvt.#themeManager = tm;
                for (let entry of this.pvt.#registered) {
                    customElements.define(entry.name, entry.tag);
                }
            }
        },

        isTagType(target, type) {
            let klass = target.cla$$
                ? [target.cla$$]
                : [HTMLElement, target.nodeName.toLowerCase()];

            while (klass[0] !== HTMLElement) {
                let k = klass[0];
                klass[0] = k.tagName;
                klass.unshift(Object.getPrototypeOf(k));
            }
            klass.shift();

            return klass.includes(type);
        },

        runReadyEvents() {
            if (!this.pvt.#ready) {
                let renderEvents = this.pvt.#renderQueue.filter(e => e.eventName == "render");
                let otherEvents = this.pvt.#renderQueue.filter(e => e.eventName != "render");
                let events = renderEvents.concat(otherEvents);
                this.pvt.#ready = true;
                for (let event of events) {
                    let {obj, eventName, data} = event;
                    obj.fireEvent(eventName, data);
                }
            }
        },

        actionFieldMap: accessor({ get: ()=> {} })
    });

    static #eventGetter(name) {
        return function getter() { return this.getAttribute(name); }
    }
    
    static #eventSetter(name) {
        return function setter(v) { return this.setAttribute(name, v); }
    }

    /**
     * Generates "on<event name>" boilerplate properties for the tag.
     * @param {Function} tag Constructor of the class defining the tag
     * owning the events
     * @param {Array[string]} events Array of event names to be registered.
     */
    static #registerEvents(tag) {
        const events = tag.observedEvents;
        for (let name of events) {
            let handler = `on${name.toLowerCase()}`;
            Object.defineProperty(tag.prototype, handler, {
                enumerable: true,
                configurable: true,
                get: this.pvt.#eventGetter(handler),
                set: this.pvt.#eventSetter(handler)
            });
        }
    }
    
    static setActionMappedField(client, field, val) {
        const map = TagBase.pvt.#sprot.actionFieldMap;
        const clientField = map[field];
        if (clientField && clientField.length && 
            ((typeof(val) != "string") || val.trim().length)) {
            client[clientField] = val;
        }
    }

    static get observedAttributes() { return [
        "action", "theme", "style", "classList"
    ]; }
    static get observedEvents() { return [
        "preRender", "render", "postRender", "resized", "parentResized"
    ]; }

    static { saveSelf(this, "pvt"); }

    #listenerMap = new WeakMap();
    #sizeInfo = null;
    #areEventsReady = false;
    #deferredEvents = [];

    #tagError() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(this.pvt.#prot.newTag("h3", 
            {style:"background-color: red; color: yellow; font-weight: bold;"},
            {innerHTML: "ERROR!"}));
    }
    
    #sizeChange(szInfo) {
        let sInfo = this.pvt.#sizeInfo;
        return !(sInfo && szInfo &&
            (szInfo.clientWidth === sInfo.clientWidth) &&
            (szInfo.clientHeight === sInfo.clientHeight) &&
            (szInfo.innerWidth === sInfo.innerWidth) &&
            (szInfo.innerHeight === sInfo.innerHeight) &&
            (szInfo.outerWidth === sInfo.outerWidth) &&
            (szInfo.outerHeight === sInfo.outerHeight) &&
            (szInfo.offsetWidth === sInfo.offsetWidth) &&
            (szInfo.offsetHeight === sInfo.offsetHeight));
    }

    #eventsReady() {
        this.pvt.#areEventsReady = true;
        for (let e of this.pvt.#deferredEvents) {
            this.attributeChangedCallback(e.name, e.oldVal, e.newVal);
        }
    }

    #prot = share(this, TagBase, {
        shadow: null,

        newTag(tag, attributes, properties) {
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
        toCamelCase(str) {
            return String(str).replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
        },
        encodeHTML(str) {
            return String(str).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;');
        },
        renderContent(content, target) {
            this.fireEvent("preRender");
            let link, shadow = target || this.shadowRoot;
            if (target !== shadow) {
                const tm = TagBase.pvt.#themeManager;
                if (tm) {
                    link = tm.getTagStyle(this.cla$$.tagName);
                }
            }
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
                this.pvt.#prot.childrenResized();
            }
        },
        setBoolAttribute(attr, val) {
            if (!!val) {
                this.setAttribute(attr, "");
            }
            else {
                this.removeAttribute(attr);
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
                        found |= TagBase.pvt.#sprot.isTagType(child, t);
                    }
                    else {
                        found |= t(child);
                    }
                }

                if (!found) {
                    this.pvt.#tagError();
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
                found |= TagBase.pvt.#sprot.isTagType(parent, t);
            }

            if (!found) {
                this.pvt.#tagError();
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
         */
        validateAncestry(type, not, message) {
            if (arguments.length < 2) {
                message = not;
                not = false;
            }

            if (typeof(type) == "string") {
                type = [type];
            }

            let parent = this.parentElement;
            let found = false;

            while (parent && (parent != body)) {
                for (let t of type) {
                    found |= TagBase.pvt.#sprot.isTagType(parent, t);
                }

                if (!found) {
                    this.pvt.#tagError();
                    throw new TypeError(message);
                }
            }
        },
        childrenResized() {
            for (let child of this.children) {
                if ("fireEvent" in child)
                    child.fireEvent("parentResized");
            }
        },
        onParentResized() {
            let szInfo = {
                clientWidth: this.clientWidth,
                clientHeight: this.clientHeight,
                innerWidth: this.innerWidth,
                innerHeight: this.innerHeight,
                outerWidth: this.outerWidth,
                outerHeight: this.outerHeight,
                offsetWidth: this.offsetWidth,
                offsetHeight: this.offsetHeight
            }

            if (this.pvt.#sizeChange(szInfo)) {
                this.pvt.#sizeInfo = szInfo;
                this.fireEvent("resized");
                this.pvt.#prot.childrenResized();
            }
        },
        onActionChange(e) {
            const am = document.querySelector("js-actionmanager");
            const {oldVal, newVal} = e.detail;
            if ((typeof(oldVal) == "string") && oldVal.trim().length) {
                am.unregisterActionClient(this, oldVal);
            }
            if ((typeof(newVal) == "string") && newVal.trim().length) {
                am.registerActionClient(this, newVal);
            }
        },
        importRule(slotClass) {
            let rule = Array
                .from(document.styleSheets)
                .reduce((prevSheet, sheet) => prevSheet 
                    ? prevSheet
                    : Array
                        .from(sheet.cssRules)
                        .find(rule => rule.selectorText == `.${slotClass}`)
                , null);
            if (rule) {
                let shadow = this.shadowRoot;
                let style = shadow.querySelector("style");
                if (!style) {
                    style = this.pvt.#prot.newTag("style");
                    shadow.appendChild(style);
                }
                style.innerHTML += rule.cssText;
            }
        },
        render() {
            throw new TypeError(`The protected "render" method must be overridden`);
        }
    });

    constructor(options = {}) {
        super();
        saveSelf(this, "pvt", new.target);
        if (!("mode" in options)) {
            options.mode = "open";
        }
        this.attachShadow(options);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.pvt.#areEventsReady) {
            this.fireEvent(`${this.pvt.#prot.toCamelCase(name)}Change`, { oldVal, newVal });
        }
        else {
            this.pvt.#deferredEvents.push({name, oldVal, newVal});
        }
    }

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("render", prot.render); 
        this.addEventListener("parentResized", prot.onParentResized); 
        this.addEventListener("actionChange", prot.onActionChange);
        this.fireEvent("render");
        this.pvt.#eventsReady();
    }

    /**
     * Dispatches the specified event with the data attached to the custom event
     * on its detail key.
     * @param {string} evtName Name of the event to be dispatched.
     * @param {*?} data Optional information about the event. Defaults to null.
     * @param {function?} eventType Optional constructor of the event type to use.
     * Defaults to CustomEvent. 2nd parameter (data) becomes required.
     */
    fireEvent(evtName, data = null, eventType = CustomEvent) {
        if (this.cla$$.isManagement || TagBase.pvt.#ready) {
            let event = new eventType(evtName, { detail: data });
            this.dispatchEvent(event);

            //Check for an "observed" event...
            if (this.cla$$.observedEvents.includes(evtName)) {
                let handler = `on${evtName.toLocaleLowerCase()}`;
                if ((handler in this) && (typeof(handler) == "string")) {
                    (new Function("event", this[handler])).call(this, event);
                }
            }
        }
        else  {
            TagBase.pvt.#renderQueue.push({obj:this, eventName:evtName, data});
        }
    }

    /**
     * Registers an event handler function to the object.
     * @param {string} name Name of the event that will cause the handler
     * function to be called.
     * @param {function} fn The handler function that will be called when
     * the element receives the specified event.
     */
    addEventListener(name, fn) {
        let mapping = this.pvt.#listenerMap.get(fn) || { count: 0, name, boundFn:fn };
        ++mapping.count;
        this.pvt.#listenerMap.set(fn, mapping);

        if (mapping.count === 1)
            super.addEventListener(name, mapping.boundFn);
    }

    /**
     * Registers an event handler function to the object. The event handler
     * will be immediately unregistered after the handling the first event
     * that occurs after registration. There is no other way to unregister
     * this handler.
     * @param {string} name Name of the event that will cause the handler
     * function to be called.
     * @param {function} fn The handler function that will be called when
     * the element receives the specified event.
     */
    addEventListenerOnce(name, fn) {
        let handler = (...args) => {
            let retval;
            try {
                retval = fn(...args);
            }
            finally {
                this.removeEventListener(name, fn);
            }
            return retval;
        }
        this.addEventListener(name, handler);
    }

    removeEventListener(name, fn) {
        let mapping = this.pvt.#listenerMap.get(fn);
        if (mapping && (mapping.name == name)) {
            --mapping.count;
            
            if (!mapping.count) {
                super.removeEventListener(name, mapping.boundFn);
                this.pvt.#listenerMap.delete(fn);
            }
        }
    }

    getBounds(relative, childBounds) {
        let retval = this.getBoundingClientRect();
        if (relative) {
            if (childBounds && (this !== app)) {
                retval.x += childBounds.x;
                retval.y += childBounds.y;
                retval.left += childBounds.left;
                retval.top += childBounds.top;
                retval.width = childBounds.width;
                retval.height = childBounds.height;
            }
            if (this === app) {
                retval = childBounds;
                retval.right = retval.left + retval.width;
                retval.bottom = retval.top + retval.height;
            }
            else {
                retval = this.parentElement.getBounds(retval);
            }
        }
        return retval;
    }

    get theme() { return this.getAttribute("theme"); }
    set theme(val) { this.setAttribute("theme", val); }

    get action() { return this.getAttribute("action"); }
    set action(val) { this.setAttribute("action", val); }
});

export default TagBase;