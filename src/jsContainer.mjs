import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import ControlBase from "./jsControlBase.mjs";

const Container = abstract(class Container extends ControlBase {
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
        return ControlBase.observedAttributes.concat(["fixed", "horizontal"]);
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
                        this.fireEvent("onChildListChanged", mutation);
                        break;
                    case "characterData":
                        this.fireEvent("onTextChanged", mutation);
                    default:
                        break;
                }
            });
        },
        observeChildren(target) {
            const pvt = this.$.#pvt;

            pvt.contentObserver.observe(target);
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            fixedChanged: pvt.onFixedChanged,
            horizontalChanged: pvt.onHorizontalChanged
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
            pvt.onMutation(mutations);
        }
        observer.disconnect();

        super.disconnectedCallback();
    }
});

export default Container;
