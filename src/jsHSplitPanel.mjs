import { share, accessor } from "../node_modules/cfprotected/index.mjs";
import SplitPanel from "./jsSplitPanel.mjs";
import CSS from "./util/Selectors.mjs";

export default class HSplitPanel extends SplitPanel {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return SplitPanel.observedAttributes;
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        const [structure, skin] = super.getDefaultStyleSheet();
        return [
            [
                ...structure,
                [[CSS.HOST], {
                    flexDirection: "row"
                }],
                [[CSS.CLASS("container")], {
                    flexDirection: "row"
                }],
                [[CSS.TAG("slot")], {
                    flexDirection: "row"
                }],
                [[CSS.TAG("div").ATTR("draggable")], {
                    cursor: "col-resize",
                    maxWidth: "0px"
                }],
                [[CSS.CLASS("splitter")], {
                    cursor: "col-resize !important"
                }]
            ],
            skin
        ];
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
