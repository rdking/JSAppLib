import { share, abstract } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import FocusableTag from "./jsFocusableTag.mjs";

const Container = abstract(class Container extends FocusableTag {
    static #spvt = share(this, {});

    static {
        const spvt = this.#spvt;

        spvt.initAttributeProperties(this, {
            fixed: { isBool: true, caption: "fixed" },
            horizontal: { isBool: true, caption: "horizontal" }
        });
        spvt.register(this);
    }

    static get observedAttributes() {
        return FocusableTag.observedAttributes.concat(["fixed", "horizontal"]);
    }

    #contentObserver;

    #pvt = share(this, Container, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent(pvt.make("slot"));
        },
        getChild(type, selector) {
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "") ;
            return this.querySelector(s);
        },
        getChildren(type, selector) {
            const s = (type ? this.$.#pvt.tagType(type) : "") + (selector || "") ;
            return this.querySelectorAll(s);
        },
        onFixedChanged(e) {
            let { newValue } = e.detail;
            if (newValue && this.horizontal) {
                throw new AppLibError(`Cannot use "fixed" and "horizontal" together.`);
            }
        },
        onHorizontalChanged(e) {
            let { newValue } = e.detail;
            if (newValue && this.fixed) {
                throw new AppLibError(`Cannot use "fixed" and "horizontal" together.`);
            }
        },
        onMutation(e) {
            e.forEach(mutation => {
                switch(mutation.type) {
                    case "childList":
                        this.fireEvent("childListChanged", mutation);
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) this.fireEvent("itemAdded", node);
                        });
                        mutation.removedNodes.forEach(node => {
                            if (node.nodeType === 1) this.fireEvent("itemRemoved", node);
                        });
                        break;
                    case "characterData":
                        this.fireEvent("textChanged", mutation);
                        break;
                    default:
                        break;
                }
            });
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            fixedChanged: "onFixedChanged",
            horizontalChanged: "onHorizontalChanged"
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.#contentObserver = new MutationObserver(this.$.#pvt.onMutation);
        this.$.#contentObserver.observe(this, {
            subtree: true,
            childList: true,
            characterData: true,
            characterDataOldValue: true
        });
    }

    disconnectedCallback() {
        let observer = this.$.#contentObserver;
        let mutations = observer.takeRecords();

        if (mutations.length > 0) {
            this.$.#pvt.onMutation(mutations);
        }
        observer.disconnect();

        super.disconnectedCallback();
    }
});

export default Container;
