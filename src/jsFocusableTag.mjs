import { share, abstract } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

const FocusableTag = abstract(class FocusableTag extends ControlBase {
    #pvt = share(this, FocusableTag, {
        renderContent(content) {
            const pvt = this.$.#pvt;
            pvt.$uper.renderContent(pvt.make("div", {
                tabIndex: 0,
                class: "focusable"
            }, {
                children: Array.isArray(content) ? content : [ content ]
            }));
        }
    });

    constructor() {
        super({delegatesFocus: true})
    }
});

export default FocusableTag;