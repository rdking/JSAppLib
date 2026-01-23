import { share } from "../node_modules/cfprotected/index.mjs";
import ManageableBase from "./jsManageableBase.mjs";

export default class DataFormat extends ManageableBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManageableBase.observedAttributes.concat([
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
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.tagType("dataformatmanager"), 
                "DataFormat elements can only be contained by a DataFormatManager element.");
            pvt.validateChildren([pvt.tagType("from"), pvt.tagType("to")], 
                "DataFormat elements can only contain From or To elements.");
        }
    });

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
