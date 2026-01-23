import { share, abstract } from "../node_modules/cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

const FocusableTag = abstract(class FocusableTag extends ControlBase {
    #pvt = share(this, FocusableTag, {
        renderContent(content) {
            const pvt = this.$.#pvt;
            pvt.$uper.renderContent(pvt.make("div", {
                tabIndex: 0,
                style: "display: flex; flex: 1 0 auto;",
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