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
let StatusBar = Class(TagBase, {
    className: "StatusBar",
    static: {
        private: {
            tagName: "js-statusbar",
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return TagBase.observedAttributes.concat(["status"]);
            }
        }
    },
    private: {
        onStatusChanged(e) {
            let status = this.shadowRoot.querySelector("span.status");
            if (status) {
                status.innerHTML = e.detail.newVal;
            }
        }
    },
    protected: {
        render() {
            this.$renderContent(`
                <style>
                    .status {
                        display: flex;
                        justify-content: flex-start;
                        flex: 100 0 auto;
                    }
                    div {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-end;
                        align-items: center;
                        min-height: 16px;
                        padding: 0.25em;    
                    }
                    slot {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-end;
                        align-content: space-between;
                    }
                </style>
                <div>
                    <span class="status">
                        ${this.status}
                    </span>
                    <slot></slot>
                </div>
            `)
        }
    },
    public: {
        constructor() {
            this.super();
            if (this.cla$$.prototype === Object.getPrototypeOf(this)) {
                this.slot = "footer";
            }
            this.addEventListener("statusChanged", this.$onStatusChanged);
        },
        get status() { return this.getAttribute("status"); },
        set status(v) {
            this.$onStatusChanged(v);
            this.setAttribute("status", v);
        }
    }
});

module.exports = StatusBar;
