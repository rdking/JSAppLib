import { share, accessor } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class Menu extends Container {
    static #spvt = share(Menu, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([ "showicons" ]); 
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
    #menuOpen = false;

    #pvt = share(this, Menu, {
        menuOpen: accessor({
            set(value) {
                this.$.#menuOpen = !!value;
            }
        }),
        currentMenuItem: accessor({
            set(value) {
                this.$.#currentMenuItem = value;
            }
        }),
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
        onItemClicked(e) {
            const item = e.detail.item;
            const wasOpen = this.$.#menuOpen;
            const currentItem = this.$.#currentMenuItem;

            // Always deselect the current item when a click occurs.
            if (currentItem) {
                currentItem.highlighted = false;
            }

            // If the menu was closed, or if a different item was clicked, open the new item.
            if (!wasOpen || item !== currentItem) {
                this.$.#menuOpen = true;
                this.$.#currentMenuItem = item;
                item.highlighted = true;
            } else {
                // Menu was open and the same item was clicked, so close the menu.
                this.$.#menuOpen = false;
                this.$.#currentMenuItem = null;
            }
        },
        onItemHovered(e) {
            const item = e.detail.item;
            const currentItem = this.$.#currentMenuItem;

            // Requirement 3: When the main menu is open, hovering switches the active item.
            if (this.$.#menuOpen && item !== currentItem) {
                if (currentItem) {
                    currentItem.highlighted = false;
                }
                this.$.#currentMenuItem = item;
                item.highlighted = true;
            }
            // Requirement 1 is met by doing nothing if the menu is not open.
        },
        onItemLeft(e) {
            const { item, relatedTarget } = e.detail;
            const pvt = this.$.#pvt;

            // Requirement 4: When the main menu is open, leaving the item has an effect only
            // if the mouse leaves the entire menu bar area.
            const isLeavingMenuBar = item === this.$.#currentMenuItem && !pvt.isTagType(relatedTarget, "menuitem");

            if (this.$.#menuOpen && isLeavingMenuBar) {
                // This case is handled by the popup's "click-away" logic, so we don't need to do anything here.
            }
            // Requirement 4: When the main menu isn't open, leaving has no effect. This is met by doing nothing.
        },
        onShowIconsChanged(e) {
            for (let child of this.children) {
                child.fireEvent("showiconsChanged");
            }
        },
        onCloseMenu(e) {
            if (this.menuOpen) {
                this.$.#menuOpen = false;
                this.$.#currentMenuItem = null;
            }
        }
    });

    constructor() {
        super();

        const pvt = this.#pvt;
        if ((this.localName === pvt.tagType("menu")) && !this.slot) {
            this.slot = "first";
        }
        pvt.registerEvents(pvt, {
            showiconsChanged: "onShowIconsChanged",
            itemClicked: "onItemClicked",
            itemHovered: "onItemHovered",
            itemLeft: "onItemLeft",
            closeMenu: "onCloseMenu"
        });
    }

    get currentMenuItem() { return this.$.#currentMenuItem; }

    get menuOpen() { return this.$.#menuOpen; }
}
