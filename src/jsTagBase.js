let Class = await require("classicjs");
Class.UseStrings = true;

let TagBase = Class(HTMLElement, {
    className: "TagBase",
    inheritMode: "abstract",
    static: {
        private: {
            tagName: void 0,
        },
        protected: {
            watchedAttributes: Class.init(() => []),

            registerTag(tagName) {
                console.log(`registerTag: defining element '${tagName}' using class '${this.name}'`);
                this.$tagName = tagName;
                customElements.define(tagName, this);
            }
        },
        public: {
            get tagName() { return this.$tagName; },
            get observedAttributes() { return [ "theme" ]; }
        }
    },
    private: {
        onEnableThemes() {
            let shadow = this.$shadow;
            let theme = shadow.querySelector("theme");
            if (!theme) {
                theme = window.ApplicationCache.getThemeTag(this.$class$.$tagName);
                shadow.removeChild(theme);
            }
        },
        onDisableThemes() {
            let shadow = this.$shadow;
            let theme = shadow.querySelector("theme");
            if (theme) {
                shadow.removeChild(theme);
            }
        }
    },
    protected: {
        shadow: null,

        encodeHTML(str) {
            return String(str).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;');
        },
        genericEvent(evtName) {
            let event = new Event(evtName);
            this.dispatchEvent(event);            
        }
    },
    public: {
        constructor() {
            console.log("Constructing a TagBase instance...");
            this.super();
            this.$shadow = this.attachShadow({mode: "open"});
        },
        attributeChangedCallback(name, oldVal, newVal) {
            switch(name) {
                case "theme": 
                    this.$genericEvent("themeChanged");
                    break;
            }
        },
        connectedCallback() {
            this.$genericEvent("render");
        },

        get theme() { return this.getAttribute("theme"); },
        set theme(val) {
            this.setAttribute(theme, val);
        }
    }
});

module.exports = TagBase;
