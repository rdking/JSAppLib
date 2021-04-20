let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
let [Class, TagBase] = await require(_rGid);
Class.UseStrings = true;

let Theme = Class(TagBase, {
    className: "Theme",
    static: {
        private: {
            tagName: "js-theme"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return TagBase.observedAttributes.concat(["name"]);
            }
        }
    },
    private: {
        themeManager: void 0,
        theme: "default",
        component: void 0,

        onThemeChanged(e) {
            let uri = `${tm.themeBase}/${tm.theme}/${component}.css`;
            let theme = this.querySelector("style");

            if (!theme) {
                theme = this.createElement("style");
                theme.setAttribute("type", "text/css");
                this.appendChild(theme);
            }

            fetch(uri).then(response => {
                response.text.then(css => {
                    theme.textContent = css;
                });
            });
        }
    },
    public: {
        constructor(manager, component) {
            this.super();
            this.$themeManager = manager;
            this.$component = component;
            manager.addEventListener("themeChanged", this.$onThemeChanged.bind(this));
            this.addEventListener("render", this.$render.bind(this));
        },
        attributeChangedCallback(name, oldVal, newVal) {
            this[name] = newVal;
        },

        get name() { return this.getAttribute("name"); },
        set name(val) { this.setAttribute("name", val); }
    }
});

module.exports = Theme;
