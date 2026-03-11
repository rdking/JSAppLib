import { share, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";
import CSS from "./util/Selectors.mjs";

export default class TabPage extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([ "caption", "closeable", "selected", "tabname" ]);
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
                    display: "none",
                    flex: "1"
                }],
                [[CSS.HOST(CSS.ATTR("selected"))], {
                    display: "flex"
                }],
                [[CSS.TAG("slot")], {
                    display: "flex",
                    flex: "1 0 auto"
                }]
            ],
            skin
        ];
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            caption: {},
            closeable: { isBool: true },
            tabname: {},
            selected: { isBool: true }
        });
        spvt.register(this);
    }

    #pvt= share(this, TabPage, {
        render() {
            const pvt = this.$.#pvt; 
            pvt.renderContent(pvt.make("slot"))
        }
    });

}
