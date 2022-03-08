import { share, abstract, saveSelf, accessor } from "/node_modules/cfprotected/index.mjs";

const TagBase = abstract(class TagBase extends HTMLElement {
    static #themeManager = null;
    static #registered = [];
    static #ready = false;
    static #renderQueue = [];
    static #sprot = share(this, {
        registerTag: tag => {
            saveSelf(tag, "pvt");  //Convenience for the derived classes
            console.log(`registerTag: defining element '${tag.tagName}' using class '${tag.name}'`);
            this.pvt.#registered.push({name:tag.tagName, tag});
        },

        initTags(tm) {
            this.pvt.#themeManager = tm;
            for (let entry of this.pvt.#registered) {
                customElements.define(entry.name, entry.tag);
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
                this.pvt.#ready = true;
                for (let event of this.pvt.#renderQueue) {
                    let {obj, eventName, data} = event;
                    obj.fireEvent(eventName, data);
                }
            }
        }
    });

    static get observedAttributes() { return [ "theme", "style", "classList" ]; }

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
    
    #sizeChanged(szInfo) {
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
                            for (let child of children) {
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
                link = TagBase.pvt.#themeManager.getTagStyle(this.cla$$.tagName);
            }
            if (!Array.isArray(content)) {
                content = [content];
            }
            shadow.innerHTML = link || "";
            for (let element of content) {
                if (typeof(element) == "string") {
                    shadow.innerHTML += element;
                }
                else {
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
            if (typeof(type) == "string") {
                type = [type];
            }
            for (let child of this.children) {
                let found = false;
                for (let t of type) {
                    found |= TagBase.pvt.#sprot.isTagType(child, t);
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

            if (this.pvt.#sizeChanged(szInfo)) {
                this.pvt.#sizeInfo = szInfo;
                this.fireEvent("resized");
                this.pvt.#prot.childrenResized();
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
            this.fireEvent(`${this.pvt.#prot.toCamelCase(name)}Changed`, { oldVal, newVal });
        }
        else {
            this.pvt.#deferredEvents.push({name, oldVal, newVal});
        }
    }

    connectedCallback() {
        this.addEventListener("render", this.pvt.#prot.render); 
        this.addEventListener("parentResized", this.pvt.#prot.onParentResized); 
        this.pvt.#eventsReady();
        this.fireEvent("render");
    }

    fireEvent(evtName, data) {
        if (TagBase.pvt.#ready) {
            let event = new CustomEvent(evtName, { detail: data });
            this.dispatchEvent(event);
        }
        else  {
            TagBase.pvt.#renderQueue.push({obj:this, eventName:evtName, data});
        }
    }

    addEventListener(name, fn) {
        let mapping = this.pvt.#listenerMap.get(fn) || { count: 0, name, boundFn:fn };
        ++mapping.count;
        this.pvt.#listenerMap.set(fn, mapping);

        if (mapping.count === 1)
            super.addEventListener(name, mapping.boundFn);
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
});

export default TagBase;