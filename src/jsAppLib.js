let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
require("jsapplib/theming/themeManager.js", _rGid);
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
        public: {
            constructor() {
                this.$registerTag("js-app");
            },

            get observedAttributes() {
                return this.super.observedAttributes.concat(["use_themes", "theme_base", "default_theme", "data_bind_base", "main", "debug"]);
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
            let shadow = this.$shadow;
            let appArea = document.createElement("div");
            let content = document.createElement("slot");
            appArea.appendChild(content);
            appArea.classList.add("js_app");
            shadow.appendChild(appArea);
            // shadow.mode = "closed";
        }
    },
    public: {
        constructor() {
            if (window.App) { //The Highlander rule
                alert("Error: A window can only have 1 <js-app> tag.");
                throw new ReferenceError("An application container already exists in this window.");
            }
            this.super();
            window.App = this;
            this.addEventListener("themeChanged", this.$onThemeChanged.bind(this));
            this.addEventListener("render", this.$render.bind(this));
            this.$themeManager = new ThemeManager(this);
        },
        attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
                case "use_themes":
                    this.$genericEvent(`${(newVal) ? "en" : "dis"}ableThemes`);
                    break;
                case "theme_base":
                    this.$genericEvent("themeChanged");
                    break;
                case "data_bind_base":
                    this.$genericEvent("dataBindChanged");
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
                    this.$genericEvent("enableThemes");
                }
                else {
                    this.removeAttribute("use_themes");
                    this.$genericEvent("disableThemes");
                }
            }
        },

        get themeBase() { return this.getAttribute("theme_base"); },
        set themeBase(val) {
            this.setAttribute("theme_base", val);
            this.$genericEvent("themeChanged");
        },

        get dataBindBase() { return this.getAttribute("data_bind_base"); },
        set dataBindBase(val) {
            this.$loadDataBindings(val);
        },

        get main() { return this.$main; },
        set main(val) {
            this.$main = val;
            this.$launch();
        }
    }
});

console.log("Class 'App' Created...");
