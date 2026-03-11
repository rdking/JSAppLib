import { share, accessor } from "../node_modules/cfprotected/index.mjs";
import SplitPanel from "./jsSplitPanel.mjs";
import CSS from "./util/Selectors.mjs";

export default class VSplitPanel extends SplitPanel {
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
                    flexDirection: "column"
                }],
                [[CSS.CLASS("container")], {
                    flexDirection: "column"
                }],
                [[CSS.TAG("slot")], {
                    flexDirection: "column",
                    flex: "1 1 auto"
                }],
                [[CSS.TAG("div").ATTR("draggable")], {
                    cursor: "row-resize !important",
                    maxHeight: "0px"
                }],
                [[CSS.CLASS("splitter")], {
                    cursor: "row-resize !important"
                }]
            ],
            skin
        ];
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
