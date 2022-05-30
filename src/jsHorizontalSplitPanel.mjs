import { share, accessor } from "/node_modules/cfprotected/index.mjs";
import SplitPanel from "/node_modules/jsapplib/src/jsSplitPanel.mjs";

export default class HorizontalSplitPanel extends SplitPanel {
    static #tagName = "js-hsplitpanel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return SplitPanel.observedAttributes;
    }

    #prot = share(this, HorizontalSplitPanel, {
        widthProp: accessor({
            get: () => "Height"
        }),
    });
}
