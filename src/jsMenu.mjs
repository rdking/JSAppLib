import { share, saveSelf } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class Menu extends Base {
    static #spvt = share(Menu, {});

    static {
        this.#spvt.initAttributeProperties(this, {
        });
        this.#spvt.register(this);
    }    
    
    #htmlCaption = null;
    #currentMenuItem = null;

    #pvt = share(this, Menu, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {
                class: "menu"
            }, {
                children: [
                    pvt.make("slot")
                ]
            }));
        },
        onPopupOpened(e) {
            this.$.#currentMenuItem = e.detail.menuItem;
        },
        onPopupClosed(e) {
            this.$.#currentMenuItem = null;
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(pvt.tagType("menuitem"), "Only MenuItems can be placed in a Menu.");
        },

    });

    constructor() {
        super();
        if (this.cla$$.tagName === this.$.#pvt.tagType("menu")) {
            this.slot = "top";
        }
    }

    connectedCallback() {
        this.addEventListener("popupOpened", this.$.#pvt.onPopupOpened);
        this.addEventListener("popupClosed", this.$.#pvt.onPopupClosed);
        this.addEventListener("preRender", this.$.#pvt.onPreRender);
        this.addEventListener("render", this.$.#pvt.render);
        super.connectedCallback();
    }

    get currentMenuItem() { return this.$.#currentMenuItem; }
}
