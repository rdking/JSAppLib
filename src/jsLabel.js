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
        public: {
            constructor() {
                this.$registerTag("js-label");
            },
            get observedAttributes() {
                return ["text"]; 
            }
        }
    },
    private: {
        render() {
            let shadow = this.$shadow;
            let content = window.document.createElement("div");
            content.style = "display: inline-block;";
            content.innerText = this.$encodeHTML(this.getAttribute("text"));
            shadow.innerHTML = "";
            shadow.appendChild(content);
        },
        onTextChanged() {
            let content = this.$shadow.querySelector("div");
            content.innerText = this.$encodeHTML(this.getAttribute("text"));
        }
    },
    public: {
        constructor() {
            this.super();
            this.addEventListener("render", this.$render.bind(this));
            this.addEventListener("onTextChanged", this.$onTextChanged.bind(this));
            this.text = this.$encodeHTML(this.innerHTML);
            this.innerHTML = "";
        },
        attributeChanged(name, oldVal, newVal) {
            switch(name) {
                case "text":
                    this.$genericEvent("onTextChanged");
                    break;
                default:
                    this.super.attributeChangedCallback(name, oldVal, newVal);
            }
        },

        get text() { return this.getAttribute("text"); },
        set text(val) { this.setAttribute("text", val.toString()); }
    }
});

module.exports = Label;
