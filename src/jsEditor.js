let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsTagBase", _rGid);
let [Class, TagBase] = await require(_rGid);
Class.UseStrings = true;

let Editor = Class(TagBase, {
    className: "Editor",

    static: {
        private: {
            tagName: "js-editor"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return TagBase.observedAttributes.concat(["text"]); 
            }
        }
    },
    private: {
        value: ""
    },
    protected: {
        render() {
            let shadow = this.shadowRoot;
            let content = window.document.createElement("input");
            content.name = this.getAttribute("name");
            content.value = this.$value;
            shadow.innerHTML = "";
            shadow.appendChild(content);
        }
    },
    public: {
        constructor() {
            this.super();
        }
    }
});

module.exports = Editor;
