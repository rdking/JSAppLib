let _rGid = Symbol();
require("classicjs", _rGid);
require("jsapplib/jsMenuItem", _rGid);
let [Class, MenuItem] = await require(_rGid);
Class.UseStrings = true;

let MenuSeparator = Class(MenuItem, {
    static: {
        private: {
            tagName: "js-menuseparator"
        },
        public: {
            constructor() {
                this.$registerTag(this.$tagName);
            },
            get tagName() {
                return this.$tagName;
            },
            get observedAttributes() {
                return [ "theme", "style", "classList" ];
            }
        }
    },
    private: {
    },
    protected: {
        render() {
            this.$renderContent(`<hr/>`);
        },
        onClicked(e) {
            e.cancelBubble = true;
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    }
});

module.exports = MenuSeparator;
