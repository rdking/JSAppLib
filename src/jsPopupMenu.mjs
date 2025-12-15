import { share, saveSelf } from "../../cfprotected/index.mjs";
import Menu from "./jsMenu.mjs";
import MenuItem from "./jsMenuItem.mjs";

export default class PopupMenu extends Menu {
    static #spvt= share(this, {});
    static get observedAttributes() {
        return Menu.observedAttributes; 
    }

    static #openPopups = [];

    static #windowClicked(e) {
        const openPopups = this.$.#openPopups;

        if (openPopups.length > 0) {
            const menu = JSAppLib?.app?.menu;
            let miss = true;

            const path = e.composedPath();
            for (const el of path) {
                if (openPopups.includes(el) || el === menu) {
                    miss = false;
                    break; // Exit loop as soon as a "hit" is found
                }
            }

            if (miss) {
                openPopups[0].hide(); // This will cascade and close all others

                if (menu.menuOpen) {
                    menu.fireEvent("closeMenu");
                }
            }
        }
    }

    static {
        saveSelf(this, "$");
        let spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            caption: {}
        });
        spvt.register(this);
        window.addEventListener("click", (...args) => this.$.#windowClicked(...args), { once: false, capture: true });
    }

    #htmlCaption = null;

    #pvt = share(this, PopupMenu, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {
                id: "menubody",
                class: "hidden background"
            }, {
                children: [
                    pvt.make("slot")
                ]
            }));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(
                pvt.tagTypes("menuitem", "menuseparator"),
                "Only MenuItems can be placed in a Menu."
            );
        },
        onMouseDown(e) {
            if (e.target instanceof MenuItem) {
                if (this.isShowing) {
                    this.parentElement.fireEvent("click");
                }
            }
            else {
                this.hide();
            }
        },
        // Requirement 5 & 6: Handle clicks on items within the popup.
        onItemClicked(e) {
            const item = e.detail.item;
            // If the clicked item does not have its own popup, it's a terminal action.
            if (!item.hasPopup) {
                item.triggerAction();
                // Close the entire menu stack by telling the main menu to close.
                const appMenu = JSAppLib.app.menu;
                if (appMenu && appMenu.currentMenuItem) {
                    appMenu.currentMenuItem.highlighted = false;
                }
            }
            // If the item has a popup, the click is ignored per requirement 5.
        },
        // Requirement 2: Handle hovering over items to open their sub-popups.
        onItemHovered(e) {
            const item = e.detail.item;
            const currentItem = this.currentMenuItem;

            if (item !== currentItem) {
                if (currentItem) {
                    currentItem.highlighted = false; // This will hide the old popup.
                }
                this.$.#pvt.currentMenuItem = item;
                item.highlighted = true; // This will show the new popup.
            }
        },
        // Requirement 3 & 4: Handle mouse leaving an item.
        onItemLeft(e) {
            // This handler is intentionally left blank.
            // Per requirement 3, if the mouse leaves an item for a non-sibling, the popup stays open.
            // Per requirement 4, switching to a sibling is handled by onItemHovered, which deselects the old item.
        }
    });
    
    constructor() {
        super();

        const pvt = this.$.#pvt;

        pvt.registerEvents(pvt, {
            // itemClicked: "onItemClicked",
            // itemHovered: "onItemHovered",
            // itemLeft: "onItemLeft",
        });
    }

    get isShowing() { return this.menuOpen; }

    show(left, top) {
        if (!this.isShowing) {
            let div = this.$.#pvt.shadowRoot.querySelector("#menubody.hidden");
            div.classList.replace("hidden", "showing");
            this.style.top = top + "px";
            this.style.left = left + "px";
            this.$.#pvt.menuOpen = true;
            this.cla$$.#openPopups.push(this);
            this.fireEvent("popupOpened", { menuItem: this.parentElement });
        }
    }

    hide() {
        if (this.isShowing) {
            let div = this.$.#pvt.shadowRoot.querySelector("#menubody.showing");
            // Requirement 7: If a popup is closed, any open popups belonging to its items are also closed.
            if (this.currentMenuItem) {
                this.currentMenuItem.highlighted = false; // This will trigger hide on the child popup.
            }
            div.classList.replace("showing", "hidden");
            this.fireEvent("popupClosed", { menuItem: this.parentElement });
            this.cla$$.#openPopups.splice(this.cla$$.#openPopups.indexOf(this), 1);
            this.$.#pvt.menuOpen = false;
        }
    }
}
