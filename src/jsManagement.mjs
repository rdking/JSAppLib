import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import App from "/node_modules/jsapplib/src/jsAppLib.mjs";

export default class Management extends TagBase {
    static #tagName = "js-management";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this, true); }
    static get tagName() { return this.pvt.#tagName; }
    static get isManagement() {return true};

    #waitingflags = 0;
    #prot = share(this, Management, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onPreRender() {
            this.pvt.#prot.validateAncestry("js-app", true,
                `The <js-management> cannot be placed inside a <js-app>`);
            this.pvt.#prot.validateChildren(c => c.cla$$.isManagement,
                `Only management classes can be placed in <js-management>`);
        },
        onManagerReady(id) {
            this.pvt.#waitingflags -= id;
            console.debug(`Ready state: ${this.pvt.#waitingflags}`);

            if (!this.pvt.#waitingflags) {
                if (this.autoinit) {
                    //Defer this call so the registrations complete first.
                    App.init();
                }
                this.fireEvent("ready");
            }

        }
    });

    constructor() {
        super();

        let child = this.firstElementChild;
        let id = 1;
        while (child) {
            child.addEventListener("ready", this.pvt.#prot.onManagerReady.bind(this, id));
            this.pvt.#waitingflags |= id;
            id <<= 1;
            child = child.nextElementSibling;
        }
        console.debug(`Initial ready state: ${this.pvt.#waitingflags}`);
    }
    

    get autoinit() { return this.hasAttribute("autoinit"); }
    set autoinit(v) { this.pvt.#prot.setBoolAttribute("autoinit"); }
}
