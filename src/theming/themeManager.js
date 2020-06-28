let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/theming/theme.js", _rGid);
let [Class, Theme] = await require(_rGid);
Class.UseStrings = true;

let ThemeManager = Class({
    className: "ThemeManager",
    private: {
        owner: null,
        themeBase: "/themes",
        theme: "default",
        
        sendChangeNotice() {
            let evnt = new Event("themeChanged");
            this.fireEvent(evnt);
        },
        onThemesEnabled() {

        },
        onThemesDisabled() {

        }
    },
    public: {
        constructor(owner) {
            this.$owner = owner;
            owner.addEventListener("enableThemes", this.$onThemesEnabled);
            owner.addEventListener("disableThemes", this.$onThemesDisabled);
        },

        get themeBase() { return this.$themeBase; },
        set themeBase(val) {
            this.$themeBase = val;
            this.$sendChangeNotice();
        },

        get theme() { return this.$theme; },
        set theme(val) {
            this.$theme = val;
            this.$sendChangeNotice();
        },

        getThemeControl(tagName) {
            let retval = new Theme(this, tagName);
            retval.name = this.$theme;
            return retval;
        }
    }
});

module.exports = ThemeManager;
