import { share, abstract } from "../node_modules/cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";
import CSS from "./util/Selectors.mjs";

const FocusableTag = abstract(class FocusableTag extends ControlBase {
    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        const [structure, skin] = super.getDefaultStyleSheet();
        return [
            [
                ...structure,
                [[CSS.CLASS("focusable")], {
                    display: "flex",
                    flex: "1 0 auto"
                }]
            ],
            skin
        ];
    }

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