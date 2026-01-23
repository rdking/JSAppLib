import { share, accessor, abstract, final } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class TabPage extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([ "caption", "closeable", "selected", "tabname" ]);
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
