let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
require("jsapplib/theming/themeManager", _rGid);
let [Class, TagBase, ThemeManager] = await require(_rGid);
Class.UseStrings = true;

/**
 * @class App
 * Declares the container for jsAppLib controls, providing core support for
 * theming and data binding.
 */
let App = Class(TagBase, {
    className: "App",
    static: {
        private: {
            tagName: "js-app",

            defer(fn) {
                setTimeout(fn, 1);
            }
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return TagBase.observedAttributes.concat([
                    "use_themes", "theme_base", "default_theme", 
                    "data_bind_base", "main", "debug", "style", 
                    "classList"
                ]);
            }
        }
    },
    private: {
        //Private members
        started: false,
        themeManager: null,
        debug: false,
        main: void 0,

        //Private methods
        loadThemes(newThemeBase, newTheme) {
            this.setAttribute("themeBase", newThemeBase);
            this.setAttribute("theme", newTheme);

            if (this.$themeManager) {
                this.$themeManager.themeBase = newThemeBase;
                this.$themeManager.theme = newTheme;
            }
        },
        loadDataBindings(newDataBindBase) {
            let event = new Event('dataBindChanged');
            this.setAttribute(dataBindBase, newDataBindBase);
            this.dispatchEvent(event);
        },
        launch() {
            window.addEventListener("load", () => {
                this.$main();
            });
        },

        onThemeChanged() {

        }
    },
    protected: {
        render() {
            this.$renderContent(` 
                <style>
                    .app {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        position: absolute;
                        top: 0px;
                        left: 0px;
                        bottom: 0px;
                        right: 0px;
                        cursor: default;
                        user-select: none;
                    }
                    .content {
                        display: flex;
                        flex-direction: row;
                        align-items: stretch;
                        flex: 1 0 auto;
                    }
                </style>
                <div class="app">
                    <slot name="header"></slot>
                    <slot class="content"></slot>
                    <slot name="footer"></slot>
                </div>
            `);
        }
    },
    public: {
        constructor() {
            if (window.app) { //The Highlander rule
                alert("Error: A window can only have 1 <js-app> tag.");
                throw new ReferenceError("An application container already exists in this window.");
            }
            this.super();
            window.app = this;
            this.addEventListener("themeChanged", this.$onThemeChanged);
            this.$themeManager = new ThemeManager(this);
            let event = new CustomEvent("ready", { detail: {} });
            window.dispatchEvent(event);            
        },
        attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
                case "use_themes":
                    this.fireEvent(`${(newVal) ? "en" : "dis"}ableThemes`);
                    break;
                case "theme_base":
                    this.fireEvent("themeChanged");
                    break;
                case "data_bind_base":
                    this.fireEvent("dataBindChanged");
                    break;
                default:
                    this.super.attributeChangedCallback(name, oldVal, newVal);
            }
        },

        getThemeTag(controlName) {
            return this.$themeManager.getComponentTheme(controlName);
        },

        /**
         * @property {boolean} useThemes - If true, the ThemeManager system
         * will be used to manage the styles for all UI controls. If false,
         * UI controls will be styled according to the `class` and `style`
         * attributes of the control, as well as additional style attributes.
         * @memberof App
         */
        get useThemes() { return this.hasAttribute("use_themes"); },
        set useThemes(val) {
            val = !!val;
            
            if (val !== this.useThemes) {
                if (val) {
                    this.setAttribute("use_themes", "");
                    this.fireEvent("enableThemes");
                }
                else {
                    this.removeAttribute("use_themes");
                    this.fireEvent("disableThemes");
                }
            }
        },

        get themeBase() { return this.getAttribute("theme_base"); },
        set themeBase(val) {
            this.setAttribute("theme_base", val);
            this.fireEvent("themeChanged");
        },

        get dataBindBase() { return this.getAttribute("data_bind_base"); },
        set dataBindBase(val) {
            this.$loadDataBindings(val);
        },

        get main() { return this.$main; },
        set main(val) {
            this.$main = val;
            this.$launch();
        },

        get menu() {
            return this.querySelector("js-menu");
        }
    }
});

module.exports = App;
