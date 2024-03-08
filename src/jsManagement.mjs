import { share } from "../../cfprotected/index.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import App from "./jsApp.mjs";

export default class Management extends ManagerBase {
    static #spvt= share(this, {});

    static {
        this.#spvt.initAttributeProperties(this, {
        });
        this.#spvt.register(this);
    }

    #waitingflags = 0;
    #pvt= share(this, Management, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            const prefix = ManagerBase.prefix;
            pvt.validateAncestry(`${prefix}-app`, true,
                `The <${prefix}-management> cannot be placed inside a <${prefix}-app>`);
            pvt.validateChildren(c => c.cla$$.isManagement,
                `Only management classes can be placed in <${prefix}-management>`);
        },
        onManagerReady(id) {
            this.$.#waitingflags -= id;
            console.debug(`Ready state: ${this.$.#waitingflags}`);

            if (!this.$.#waitingflags) {
                if (this.autoinit) {
                    //Defer this call so the registrations complete first.
                    App.init();
                }
                this.fireEvent("ready");
            }

        }
    });

    connectedCallback() {
        this.addEventListener("render", this.$.#pvt.render);
        super.connectedCallback();
    }
    
    get isManagement() { return this.cla$$.isManagement; }

    get autoinit() { return this.hasAttribute("autoinit"); }
    set autoinit(v) { this.$.#pvt.setBoolAttribute("autoinit"); }
}
