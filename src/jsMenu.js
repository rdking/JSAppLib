let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
let [Class, TagBase] = await require(_rGid);
Class.UseStrings = true;

let Menu = Class(TagBase, {
    className: "Menu",

    static: {
        private: {
            tagName: "js-menu"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {                
                return TagBase.observedAttributes.concat([ "caption" ]); 
            }
        }
    },
    private: {
        htmlCaption: null,
        currentMenuItem: null,

        onPopupOpened(e) {
            this.$currentMenuItem = e.detail.menuItem;
        },
        onPopupClosed(e) {
            this.$currentMenuItem = null;
        }
    },
    protected: {
        render() {
            this.$renderContent(`
                <style>
                    div {
                        display: flex;
                        align-items: center;
                    }
                </style>
                <div><slot/></div>
            `);
        },
        onCaptionChanged(e) {
            let match = e.detail.newVal.match(/_(\w)/);
            if (match.length > 0) {
                let key = match[1];
                this.$htmlCaption = e.detail.newVal.replace(`_${key}`, `<u>${key}</u>`);
            }
            else {
                this.$htmlCaption = e.detail.newVal;
            }
            let label = this.shadowRoot.querySelector("js-label");
            if (label) {
                label.caption = this.$htmlCaption;
            }
        }
    },
    public: {
        constructor() {
            this.super();
            if (this.cla$$.prototype === Object.getPrototypeOf(this)) {
                this.slot = "header";
            }
            this.addEventListener("captionChanged", this.$onCaptionChanged);
            this.addEventListener("popupOpened", this.$onPopupOpened);
            this.addEventListener("popupClosed", this.$onPopupClosed);
        },
        get currentMenuItem() { return this.$currentMenuItem; },
        get caption() { return this.getAttribute("caption"); },
        set caption(v) { this.setAttribute("caption", v); }
    }
});

module.exports = Menu;
