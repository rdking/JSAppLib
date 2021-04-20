let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
let [Class, TagBase] = await require(_rGid);
Class.UseStrings = true;

/**
 * @class Label
 * Declares a finite-length strip of text with options for truncation and
 * word wrapping.
 */
let Label = Class(TagBase, {
    className: "Label",

    static: {
        private: {
            tagName: "js-label"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return TagBase.observedAttributes.concat(["caption", "align-end"]); 
            }
        }
    },
    private: {
        render() {
            let content = window.document.createElement("div");
            content.style = `
                height: 1.5em;
                display: flex;
                align-items: center;
                ${this.alignEnd ? "justify-content: flex-end;": ""}`;
            let slot = window.document.createElement("slot");
            content.appendChild(slot);
            this.$renderContent(content);
        },
        onCaptionChanged(vals) {
            this.setAttribute(vals.name, vals.newVal);
            this.innerHTML = this.getAttribute("caption");
        },
        onAlignEndChanged(vals) {
            this.fireEvent("render");
        }
    },
    public: {
        constructor(...args) {
            this.super(...args);
            this.addEventListener("captionChanged", this.$onCaptionChanged);
            this.addEventListener("alignEndChanged", this.$onAlignEndChanged);
        },
        get caption() { return this.getAttribute("caption"); },
        set caption(val) { this.setAttribute("caption", val); },

        get alignEnd() { return this.hasAttribute("align-end"); },
        set alignEnd(val) {
            if (val) {
                this.setAttribute("align-end", "");
            }
            else {
                this.removeAttribute("align-end");
            }
        }
    }
});

module.exports = Label;
