import { share, abstract, accessor } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs"

export default class DataFormat extends ControlBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([
            "fixed", "format", "type"
        ]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            fixed: { readonly: true, isBool: true, caption: "fixed" },
            format: { readonly: true },
            type: { readonly: true }
        });
        this.#spvt.register(this);
    }

    #getHandler(htype) {
        const pvt = this.$.#pvt;
        let hTag = this.querySelector(pvt.tagType(htype));

        return hTag ? hTag.handler: void 0;
    }

    #pvt = share(this, DataFormat, {
        render() {},
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren([pvt.tagType("from"), pvt.tagType("to")], 
                "Invalid child of DataFormatManager. Children must be DataFormat tags only.");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            from: pvt.onOnFromChanged,
            to: pvt.onOnToChanged
        });
    }

    from(data) {
        let retval;
        let fromfn = this.$.#getHandler("from");
        if (fromfn && (typeof(fromfn) == "function")) {
            retval = fromfn(data);
        }

        return retval;
    }

    to(data) {
        let retval;
        let tofn = this.$.#getHandler("to");
        if (tofn && (typeof(tofn) == "function")) {
            retval = tofn(data);
        }

        return retval;
    }
}
