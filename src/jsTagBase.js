let Class = await require("classicjs");
let {init: INIT} = Class;
Class.UseStrings = true;

let TagBase = Class(HTMLElement, {
    className: "TagBase",
    inheritMode: "abstract",
    static: {
        protected: {
            watchedAttributes: Class.init(() => []),

            registerTag(tagName) {
                console.log(`registerTag: defining element '${tagName}' using class '${this.name}'`);
                try {
                    customElements.define(tagName, this);
                }
                catch(e) {
                    console.error(e);
                }
            }
        },
        public: {
            get observedAttributes() { return [ "theme", "style", "classList" ]; }
        }
    },
    private: {
        listenerMap: INIT(() => new WeakMap()),
        onEnableThemes() {
            let shadow = this.shadowRoot;
            let theme = shadow.querySelector("theme");
            if (!theme) {
                theme = window.ApplicationCache.getThemeTag(this.$class$.$tagName);
                shadow.removeChild(theme);
            }
        },
        onDisableThemes() {
            let shadow = this.shadowRoot;
            let theme = shadow.querySelector("theme");
            if (theme) {
                shadow.removeChild(theme);
            }
        }
    },
    protected: {
        shadow: null,

        getRules() {
            for (let i=0; i<this.classList.length; ++i) {
                let className = this.classList.item(i);

                if (className) {
                    for (let j=0; j<document.styleSheets.length; ++j) {
                        let sheet = document.styleSheets[j];
                        let rules = sheet.rules || sheet.cssRules;
                    }
                }
            }
        },
        toCamelCase(str) {
            return String(str).replace(/-(w)/g, (match, letter) => letter.toUpperCase());
        },
        encodeHTML(str) {
            return String(str).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;');
        },
        renderContent(content) {
            let shadow = this.shadowRoot;
            shadow.innerHTML = "";
            if (content) {
                if (typeof(content) == "string") {
                    shadow.innerHTML = content;
                }
                else {
                    shadow.appendChild(content);
                }
            }
        }
    },
    public: {
        constructor() {
            this.super();
            this.attachShadow({mode: "open"});
            this.addEventListener("render", this.$render);
        },
        attributeChangedCallback(name, oldVal, newVal) {
            this.fireEvent(`${this.$toCamelCase(name)}Changed`, { oldVal, newVal });
        },
        connectedCallback() {
            this.fireEvent("render");
        },
        fireEvent(evtName, data) {
            let event = new CustomEvent(evtName, { detail: data });
            this.dispatchEvent(event);            
        },
        addEventListener(name, fn) {
            let mapping = this.$listenerMap.get(fn) || { count: 0, boundFn:fn.bind(this) };
            ++mapping.count;
            this.$listenerMap.set(fn, mapping);
            this.super.addEventListener(name, mapping.boundFn);
        },
        removeEventListener(name, fn) {
            let mapping = this.$listenerMap.get(fn);
            if (mapping && this.removeEventListener(name, mapping.boundFn)) {
                --mapping.count;

                if (!mapping.count) {
                    this.$listenerMap.delete(fn);
                }
            }
        },
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
        },

        get theme() { return this.getAttribute("theme"); },
        set theme(val) { this.setAttribute("theme", val); }
    }
});

module.exports = TagBase;
