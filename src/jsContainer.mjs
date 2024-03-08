import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";

const Container = abstract(class Container extends Base {
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
        return Base.observedAttributes.concat(["fixed", "horizontal"]);
    }

    #pvt = share(this, Container, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent(pvt.make("slot"));
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
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("fixedChanged", pvt.onFixedChanged);
        this.addEventListener("horizontalChanged", pvt.onHorizontalChanged);
    }

});

export default Container;
