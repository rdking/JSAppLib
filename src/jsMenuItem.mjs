import { share, saveSelf, accessor } from "../../cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Action from "./jsAction.mjs";

export default class MenuItem extends ActionControlBase {
    static #spvt = share(this, {});

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            separator: { isBool: true, readonly: true, caption: "separator" }
        });
        spvt.register(this);
    }
    static get observedAttributes() {
        return ActionControlBase.observedAttributes
            .concat([ "separator" ]); 
    }

    #hasPopup() {
        let count = this.childElementCount;
        if ((count > 1) || ((count === 1) &&
            (this.firstElementChild.nodeName.toLowerCase() !== this.$.#pvt.tagType("popupmenu")))) {
            throw SyntaxError("Menu items are allowed only a single, optional popup menu.");
        }

        return !!count;
    }

    #showPopup() {
        if (this.$.#hasPopup()) {
            let popup = this.firstElementChild;
            if (!popup.isShowing) {
                const pvt = this.$.#pvt;
                let bounds = pvt.getBounds();
                let gpType = this.parentElement.nodeName.toLowerCase();
                let left = "0px", top = "0px";

                if (gpType == pvt.tagType("menu")) {
                    left = bounds.left + "px";
                    top = bounds.top + bounds.height + "px";
                }
                else {
                    let grandParent = this.parentElement.shadowRoot.querySelector("#menubody");
                    left = `calc(${bounds.width + "px"} + ${bounds.left + "px"} + ${grandParent.style.left})`;
                    top = `calc(${bounds.top + "px"} - ${grandParent.style.top})`;
                }
                popup.show(left, top);
                this.selected = true;
                this.parentElement.fireEvent("popupOpened", { menuItem: this });
            }
        }
    }

    #hidePopup() {
        if (this.$.#hasPopup()) {
            let popup = this.firstElementChild;
            if (popup.isShowing) {
                let menuItem = popup.currentMenuItem;
                this.parentElement.fireEvent("popupClosed", { menuItem: this });
                popup.hide();
                this.selected = false;

                if (menuItem) {
                    menuItem.$.#hidePopup();
                }
            }
        }
    }

    #makeHtmlCaption() {
        let retval = "";
        let match = this.caption ? this.caption.match(/_(\w)/) : null;
        if (match && (match.length > 0)) {
            let key = match[1];
            retval = this.caption.replace(`_${key}`, `<u>${key}</u>`);
        }
        else {
            retval = this.caption;
        }

        return retval;
    }

    #pvt = share(this, MenuItem, {
        render() {
            const pvt = this.$.#pvt;
            const parentType = this.parentElement.nodeName.toLowerCase();
            const isPopupMenu = parentType == pvt.tagType("popupmenu");
            
            if (!this.$.#pvt.tagTypes(["menu","menuitem","popupmenu"]).includes(parentType)) {
                throw new SyntaxError("Menu items cannot exist outside of a menu or popup menu.");
            }
            
            pvt.renderContent(this.separator
                ? [ pvt.make("hr") ]
                : [ pvt.make("div", {
                        class: "itemgrid"
                    }, {
                        children: [
                            !isPopupMenu ? null : pvt.make("div", {
                                id: "check",
                                class: (this.toggle && this.selected) ? "" : "hidden"
                            }, {
                                innerHTML: "&check;"
                            }),
                            !isPopupMenu ? null : pvt.make("div", {
                                class: "iconcol" + (this.parentElement.hasAttribute("showIcons") ? "" : " hidden")
                            }, {
                                children: [
                                    pvt.make("img", {
                                        id: "icon",
                                        draggable: false,
                                        class: "icon" + (this.icon ? "" : " hidden"),
                                        src: this.icon || ""
                                    })
                                ]
                            }),
                            pvt.make("div", {
                                class: isPopupMenu ? "captioncol" : ""
                            }, {
                                children: [
                                    pvt.make("label", {
                                        id: "caption",
                                        class: isPopupMenu ? "caption" : ""
                                    }, {
                                        innerHTML: this.$.#makeHtmlCaption(),
                                    })        
                                ]
                            }),
                            pvt.make("div", {
                                class: "endblock"
                            }, {
                                children: [
                                    pvt.make("div", {
                                        class: "hotkeycol"
                                    }, {
                                        children: [
                                            !isPopupMenu ? null : pvt.make("span", {
                                                id: "hotkey"
                                            },{
                                                innerHTML: this.$.#hasPopup() ? "" : (Action.validateHotKey(this.hotkey) || "")
                                            })
                                        ]
                                    }),
                                    pvt.make("div", {
                                        class: isPopupMenu ? "markcol" : "",
                                    }, {
                                        innerHTML: isPopupMenu && this.$.#hasPopup() ? "&rtrif;" : ""
                                    })
                                ]
                            })
                        ]
                    }),
                    pvt.make("slot")
                ]
            );
        },
        onPreRender() {
            this.$.#pvt.validateParent(this.$.#pvt.tagTypes(["menu","popupmenu"]), "MenuItems can only be placed in a Menu.");
            this.$.#pvt.validateChildren(this.$.#pvt.tagType("popupmenu"), "Only PopupMenus can be placed in a MenuItem.");
        },
        onCaptionChanged() {
            let caption = this.$.#pvt.shadowRoot.querySelector("#caption");
            if (caption)
                caption.innerHTML = this.$.#makeHtmlCaption();
        },
        onIconChanged() {
            let icon = this.$.#pvt.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = this.icon;
                icon.classList[this.icon ? "remove": "add"]("hidden");
            }
        },
        onHotkeyChanged() {
            let hotkey = this.$.#pvt.shadowRoot.querySelector("#hotkey");
            if (hotkey)
                hotkey.innerHTML = this.hotkey;
        },
        onSelectedChanged() {
            let check = this.$.#pvt.shadowRoot.querySelector("#check");
            if (check && this.toggle)
                check.classList[this.selected?"remove":"add"]("hidden");
        },
        onShowIconsChanged(e) {
            let iconbox = this.$.#pvt.shadowRoot.querySelector(".iconcol");
            if (iconbox) {
                iconbox.classList[this.parentElement.showIcons ? "remove": "add"]("hidden");
            }
            if (this.childElementCount > 0) {
                this.firstElementChild.fireEvent("showiconsChanged");
            }
        },
        onClicked(e) {
            if (e.target === e.currentTarget) {
                if (this.separator) {
                    e.cancelBubble = true;
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
                else if ((this.parentElement === app.menu) && this.$.#hasPopup()) {
                    let popup = this.firstElementChild;
                    if (popup.isShowing) {
                        this.$.#hidePopup();
                    }
                    else {
                        this.$.#showPopup();
                    }
                }
                else if (!this.disabled) {
                    if (app.menu && app.menu.currentMenuItem) {
                        app.menu.currentMenuItem.$.#hidePopup();
                    }
                    this.fireEvent("action");
                }
            }
        },
        onMouseEntered(e) {
            let currentItem = this.parentElement.currentMenuItem;
            if (currentItem || (app.menu && app.menu.currentMenuItem)) {
                if (currentItem && (currentItem !== this)) {
                    currentItem.$.#hidePopup();
                }
                this.$.#showPopup();
            }
        },
        onMouseLeft(e) {
            if (this.parentElement !== app.menu) {
                this.$.#hidePopup();
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            captionChanged: pvt.onCaptionChanged,
            iconChanged: pvt.onIconChanged,
            hotkeyChanged: pvt.onHotkeyChanged,
            separatorChanged: pvt.onSeparatorChanged,
            selectedChanged: pvt.onSelectedChanged,
            showiconsChanged: pvt.onShowIconsChanged,
            mouseenter: pvt.onMouseEntered,
            mouseleave: pvt.onMouseLeft,
            click: pvt.onClicked
        });
    }

    deselect() {
        this.$.#hidePopup();
        this.selected = false;
    }
}
