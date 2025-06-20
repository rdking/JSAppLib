import { share, saveSelf } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

export default class Menu extends ControlBase {
    static #spvt = share(Menu, {});

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([ "showicons" ]); 
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            showicons: {
                isBool: true,
                caption: "showIcons",
                getter: function showIconsGetter() {
                    const parent = this.parentElement.parentElement;
                    let retval = this.showIcons;

                    if (parent instanceof Menu) {
                        retval |= parent.showIcons;
                    }

                    return !!retval;
                }
            }
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
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(pvt.tagType("menuitem"), "Only MenuItems can be placed in a Menu.");
        },
        onPopupOpened(e) {
            this.$.#currentMenuItem = e.detail.menuItem;
        },
        onPopupClosed(e) {
            this.$.#currentMenuItem = null;
        },
        onShowIconsChanged(e) {
            for (let child of this.children) {
                child.fireEvent("showiconsChanged");
            }
        }
    });

    constructor() {
        super();

        const pvt = this.#pvt;
        if ((this.cla$$.tagName === pvt.tagType("menu")) && !this.slot) {
            this.slot = "first";
        }
        pvt.registerEvents({
            showiconsChanged: pvt.onShowIconsChanged,
            popupOpened: pvt.onPopupOpened,
            popupClosed: pvt.onPopupClosed
        });
    }

    get currentMenuItem() { return this.$.#currentMenuItem; }
}
