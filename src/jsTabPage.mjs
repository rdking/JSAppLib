import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class TabPage extends Base {
    static observedAttributes = ["caption", "closeable", "selected", "tabname"];

    //Pulls in shared private functions
    static #spvt= share(this, {});

    static {
        this.#spvt.initAttributeProperties(this, {
            caption: {},
            closeable: { isBool: true },
            tabname: {},
            selected: { isBool: true }
        });
        this.#spvt.register(this);
    }

    #pvt= share(this, TabPage, {
        render() {
            const pvt = this.$.#pvt; 
            pvt.renderContent(pvt.make("slot"))
        }
    });

    constructor() {
        super();

        this.addEventListener("render", this.$.#pvt.render());
    }
}
