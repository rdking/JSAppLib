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

    #action = null;

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
                                class: "iconcol"
                            }, {
                                children: [
                                    pvt.make("img", {
                                        id: "icon",
                                        draggable: false,
                                        class: this.icon ? "icon" : "hidden",
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
            let caption = this.shadowRoot.querySelector("#caption");
            if (caption)
                caption.innerHTML = this.$.#makeHtmlCaption();
        },
        onIconChanged() {
            let icon = this.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = this.icon;
                if (this.icon) {
                    icon.classList.replace("hidden", "icon");
                } else {
                    icon.classList.replace("icon", "hidden");
                }
            }
        },
        onHotkeyChanged() {
            let hotkey = this.shadowRoot.querySelector("#hotkey");
            if (hotkey)
                hotkey.innerHTML = this.hotkey;
        },
        onSelectedChanged() {
            let check = this.shadowRoot.querySelector("#check");
            if (check && this.toggle)
                check.classList[this.selected?"remove":"add"]("hidden");
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
        this.addEventListener("captionChanged", pvt.onCaptionChanged);
        this.addEventListener("iconChanged", pvt.onIconChanged);
        this.addEventListener("hotkeyChanged", pvt.onHotkeyChanged);
        this.addEventListener("separatorChanged", pvt.onSeparatorChanged);
        this.addEventListener("selectedChanged", pvt.onSelectedChanged);
        this.addEventListener("mouseenter", pvt.onMouseEntered);
        this.addEventListener("mouseleave", pvt.onMouseLeft);
        this.addEventListener("click", pvt.onClicked);
        this.addEventListener("preRender", pvt.onPreRender);
        this.addEventListener("render", pvt.render);
    }

    deselect() {
        this.$.#hidePopup();
        this.selected = false;
    }
}
