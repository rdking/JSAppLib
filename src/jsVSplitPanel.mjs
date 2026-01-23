import { share, accessor } from "../node_modules/cfprotected/index.mjs";
import SplitPanel from "./jsSplitPanel.mjs";

export default class VSplitPanel extends SplitPanel {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return SplitPanel.observedAttributes;
    }

    static {
        this.#spvt.register(this); 
    }

    #pvt = share(this, VSplitPanel, {
        widthProp: accessor({
            get: () => "Height"
        }),
    });
}
