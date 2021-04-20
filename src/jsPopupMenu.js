let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsMenu", _rGid);
let [Class, Menu] = await require(_rGid);
Class.UseStrings = true;

let PopupMenu = Class(Menu, {
    className: "PopupMenu",

    static: {
        private: {
            tagName: "js-popupmenu"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {                
                return Menu.observedAttributes.concat([ "caption" ]); 
            }
        }
    },
    private: {
        htmlCaption: null,
        showing: false
    },
    protected: {
        render() {
            this.$renderContent(`
                <style>
                    slot {
                        display: flex;
                        flex-direction: column;
                    }
                    div {
                        position: absolute;
                        background-color: inherit;
                        box-shadow: 4px 4px 4px 0px #777;
                        z-index: 1000;
                    }
                    div.hidden {
                        display: none;
                    }
                    div.showing {
                        display: block;
                    }
                </style>
                <div class="hidden">
                    <slot></slot>
                </div>
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
        },
        onMouseDown(e) {
            if (!(e.target instanceof MenuItem) && !(e.target instanceof Menu)) {
                if (this.$showing) {
                    this.parentElement.fireEvent("click");
                }
            }
        },
        onReady(e) {
            app.addEventListener("mousedown", this.$onMouseDown.bind(this));
        }
    },
    public: {
        constructor() {
            this.super();
            window.addEventListener("ready", this.$onReady.bind(this));
        },
        get caption() { return this.getAttribute("caption"); },
        set caption(v) { this.setAttribute("caption", v); }, 
        get isShowing() { return this.$showing; },
        show() {
            if (!this.$showing) {
                let div = this.shadowRoot.querySelector("div.hidden");
                let bounds = this.parentElement.getBounds();
                let gpBounds = this.parentElement.parentElement.getBounds();
                let grandParentType = this.parentElement.parentElement.nodeName.toLowerCase();
                let top = ((grandParentType == "js-menu") ? ~~bounds.height : bounds.y - gpBounds.y) + "px";
                let left = ((grandParentType == "js-menu") ? bounds.x : ~~bounds.width + bounds.x) + "px";
                div.classList.replace("hidden", "showing");
                div.style.top = top;
                div.style.left = left;
                this.$showing = true;
            }
        },
        hide() {
            if (this.$showing) {
                let div = this.shadowRoot.querySelector("div.showing");
                if (this.currentMenuItem) {
                    this.currentMenuItem.fireEvent("click");
                }
                div.classList.replace("showing", "hidden");
                this.$showing = false;
            }
        },
        connectedCallback() {
            this.super.connectedCallback();
            this.parentElement.fireEvent("render");
        },
    }
});

module.exports = PopupMenu;
