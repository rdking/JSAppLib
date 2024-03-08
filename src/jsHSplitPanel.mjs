import { share, accessor } from "../../cfprotected/index.mjs";
import SplitPanel from "./jsSplitPanel.mjs";

export default class HSplitPanel extends SplitPanel {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return SplitPanel.observedAttributes;
    }

    static {
        this.#spvt.register(this);
    }

    #pvt = share(this, HSplitPanel, {
        widthProp: accessor({
            get: () => "Width"
        }),
    });
}
