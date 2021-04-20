let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
let [Class, TagBase] = await require(_rGid);
Class.UseStrings = true;

let MenuItem = Class(TagBase, {
    className: "MenuItem",

    static: {
        private: {
            tagName: "js-menuitem"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {                
                return TagBase.observedAttributes.concat([ "caption", "icon",
                    "hotkey", "onaction" ]); 
            }
        }
    },
    private: {
        htmlCaption: null,

        hasPopup() {
            let count = this.childElementCount;
            if ((count > 1) || ((count == 1) &&
                (this.firstElementChild.nodeName.toLowerCase() !== "js-popupmenu"))) {
                throw SyntaxError("Menu items are allowed only a single, optional popup menu.");
            }

            return !!count;
        }
    },
    protected: {
        render() {
            let parentType = this.parentElement.nodeName.toLowerCase();
            let icon = this.icon || "";
            let hotkey = this.hotkey || "";

            if (!["js-menu", "js-menuitem", "js-popupmenu"].includes(parentType)) {
                throw new SyntaxError("Menu items cannot exist outside of a menu or popup menu.");
            }

            this.$renderContent(`
                <style>
                    div {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.5em;
                        padding-top: 0.25em;
                        padding-bottom: 0.25em;
                    }
                    .caption {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: no-wrap;
                        justify-content: flex-start;
                        align-items: center;
                    }
                    .icon {
                        min-width: 1em;
                        min-height: 1em;
                        padding-right: 4px;
                    }
                    .hotkey {
                        text-align: right;
                    }
                </style>
                <div>
                    <span class="caption">
                        ${(parentType == "js-popupmenu") 
                            ?  `<span class="icon">
                                    <img class="icon" src="${icon}"/>
                                </span>`
                            : ""}
                        <js-label>
                            <span style="whitespace:pre-wrap;${(parentType == "js-popupmenu") ? `padding-right:3em;` : "" }">${this.$htmlCaption}</span>
                        </js-label>
                    </span>
                    ${(parentType == "js-popupmenu")
                        ?  `<span class="hotkey">
                                ${(this.$hasPopup() ? "►" : hotkey)}
                            </span>`
                        : ""}
                </div>
                <slot></slot>
            `);
        },
        onCaptionChanged(e) {
            let match = e.detail.newVal.match(/_(\w)/);
            if (match && (match.length > 0)) {
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
        onIconChanged(e) {

        },
        onHotkeyChanged(e) {

        },
        onClicked(e) {
            if (e.target === e.currentTarget) {
                if (this.$hasPopup()) {
                    let popup = this.firstElementChild;
                    if (popup.isShowing) {
                        popup.hide();
                        this.classList.remove("selected");
                        this.parentElement.fireEvent("popupClosed", { menuItem: this });
                    }
                    else {
                        popup.show();
                        this.classList.add("selected");
                        this.parentElement.fireEvent("popupOpened", { menuItem: this });
                    }
                }
                else {
                    if (e === false) {
                        this.classList.add("selected");
                        this.parentElement.fireEvent("popupOpened", { menuItem: this });
                    }
                    else {
                        this.classList.remove("selected");
                        this.parentElement.fireEvent("popupClosed", { menuItem: this });
                        if (app.menu && app.menu.currentMenuItem) {
                            app.menu.currentMenuItem.fireEvent("click");
                        }
                        this.fireEvent("action");
                    }
                }
            }
        },
        onMouseEntered(e) {
            let currentItem = this.parentElement.currentMenuItem;
            if (currentItem && (currentItem !== this)) {
                currentItem.$onClicked(false);
                this.$onClicked(false);
                currentItem.classList.remove("selected");
            }
        }
    },
    public: {
        constructor() {
            this.super();
            this.addEventListener("captionChanged", this.$onCaptionChanged);
            this.addEventListener("iconChanged", this.$onIconChanged);
            this.addEventListener("hotkeyChanged", this.$onHotkeyChanged);
            this.addEventListener("click", this.$onClicked);
            this.addEventListener("mouseenter", this.$onMouseEntered);
        },
        get caption() { return this.getAttribute("caption"); },
        set caption(v) { this.setAttribute("caption", v); },
        get icon() { return this.getAttribute("icon"); },
        set icon(v) { this.setAttribute("icon", v); },
        get hotkey() { return this.getAttribute("hotkey"); },
        set hotkey(v) { this.setAttribute("hotkey", v); },
        get isSelected() { return this.classList.has("selected"); }

    }
});

module.exports = MenuItem;
