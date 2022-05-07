import { share, accessor } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class MenuItem extends TagBase {
    static #tagName = "js-menuitem";
    static #sprot = share(MenuItem, {
        actionFieldMap: accessor({
            get: () => ({
                caption: "caption",
                hotkey: "hotkey",
                icon: "icon",
                description: "description",
                disabled: "disabled",
                ontriggered: "onAction"
            })
        })
    });

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes
            .concat([ "caption", "disabled", "icon", "hotkey" ]); 
    }

    #htmlCaption = null;

    #hasPopup() {
        let count = this.childElementCount;
        if ((count > 1) || ((count === 1) &&
            (this.firstElementChild.nodeName.toLowerCase() !== "js-popupmenu"))) {
            throw SyntaxError("Menu items are allowed only a single, optional popup menu.");
        }

        return !!count;
    }

    #showPopup() {
        if (this.pvt.#hasPopup()) {
            let popup = this.firstElementChild;
            if (!popup.isShowing) {
                let bounds = this.getBounds();
                let gpType = this.parentElement.nodeName.toLowerCase();
                let left = "0px", top = "0px";

                if (gpType == "js-menu") {
                    left = ~~bounds.x + "px";
                    top = ~~bounds.height + "px";
                }
                else {
                    let grandParent = this.parentElement.shadowRoot.querySelector("#menubody");
                    left = `calc(${~~bounds.width + "px"} + ${~~bounds.x + "px"} + ${grandParent.style.left})`;
                    top = `calc(${~~bounds.y + "px"} - ${grandParent.style.top})`;
                }
                popup.show(left, top);
                this.classList.add("selected");
                this.parentElement.fireEvent("popupOpened", { menuItem: this });
            }
        }
    }

    #hidePopup() {
        if (this.pvt.#hasPopup()) {
            let popup = this.firstElementChild;
            if (popup.isShowing) {
                let menuItem = popup.currentMenuItem;
                this.parentElement.fireEvent("popupClosed", { menuItem: this });
                popup.hide();
                this.classList.remove("selected");

                if (menuItem) {
                    menuItem.pvt.#hidePopup();
                }
            }
        }
    }

    #prot = share(this, MenuItem, {
        render() {
            const prot = this.pvt.#prot;
            const parentType = this.parentElement.nodeName.toLowerCase();
            const isPopupMenu = parentType == "js-popupmenu";
            
            if (!["js-menu", "js-menuitem", "js-popupmenu"].includes(parentType)) {
                throw new SyntaxError("Menu items cannot exist outside of a menu or popup menu.");
            }
            
            prot.renderContent([
                prot.newTag("div", {
                    class: "itemgrid"
                }, {
                    children: [
                        prot.newTag("div", {
                            class: isPopupMenu ? "iconcol" : ""
                        }, {
                            children: [
                                !isPopupMenu ? null : prot.newTag("img", {
                                    id: "icon",
                                    class: this.icon ? "icon" : "",
                                    src: this.icon || ""
                                })
                            ]
                        }),
                        prot.newTag("div", {
                            class: isPopupMenu ? "captioncol" : ""
                        }, {
                            children: [
                                prot.newTag("js-label", {
                                    id: "caption",
                                    caption: this.pvt.#htmlCaption,
                                    class: isPopupMenu ? "caption" : ""
                                })        
                            ]
                        }),
                        prot.newTag("div", {
                            class: "hotkeycol"
                        }, {
                            children: [
                                !isPopupMenu ? null : prot.newTag("span", {
                                    id: "hotkey"
                                },{
                                    innerHTML: this.pvt.#hasPopup() ? "" : (this.hotkey || "")
                                })
                            ]
                        }),
                        prot.newTag("div", {
                            class: isPopupMenu ? "markcol" : "",
                        }, {
                            innerHTML: isPopupMenu && this.pvt.#hasPopup() ? "&rtrif;" : ""
                        })
                    ]
                }),
                prot.newTag("slot")
            ]);
        },
        onPreRender() {
            this.pvt.#prot.validateParent(["js-menu", "js-popupmenu"], "MenuItems can only be placed in a Menu.");
            this.pvt.#prot.validateChildren("js-popupmenu", "Only PopupMenus can be placed in a MenuItem.");
        },
        onCaptionChange(e) {
            let match = e.detail.newVal.match(/_(\w)/);
            if (match && (match.length > 0)) {
                let key = match[1];
                this.pvt.#htmlCaption = e.detail.newVal.replace(`_${key}`, `<u>${key}</u>`);
            }
            else {
                this.pvt.#htmlCaption = e.detail.newVal;
            }
            let label = this.shadowRoot.querySelector("#caption");
            if (label) {
                label.caption = this.pvt.#htmlCaption;
            }
        },
        onDisabledChange(e) {

        },
        onIconSrcChange(e) {
            let icon = this.shadowRoot.querySelector("#icon");
            if (icon) {
                const src = e.detail.newVal;
                icon.className = (typeof(src) == "string") && src.length
                    ? "icon" : "";
                icon.src = src;
            }
        },
        onHotKeyChange(e) {
            let hotkey = this.shadowRoot.querySelector("#hotkey");
            if (hotkey) {
                hotkey.innerHTML = this.hotkey;
            }
        },
        onClicked(e) {
            if (e.target === e.currentTarget) {
                if ((this.parentElement === app.menu) && this.pvt.#hasPopup()) {
                    let popup = this.firstElementChild;
                    if (popup.isShowing) {
                        this.pvt.#hidePopup();
                    }
                    else {
                        this.pvt.#showPopup();
                    }
                }
                else if (!this.disabled) {
                    if (app.menu && app.menu.currentMenuItem) {
                        app.menu.currentMenuItem.pvt.#hidePopup();
                    }
    
                    Function(this.onAction)();
                }
            }
        },
        onMouseEntered(e) {
            let statusbar = document.querySelector("js-statusbar");
            let currentItem = this.parentElement.currentMenuItem;
            if (currentItem || (app.menu && app.menu.currentMenuItem)) {
                if (currentItem && (currentItem !== this)) {
                    currentItem.pvt.#hidePopup();
                }
                this.pvt.#showPopup();
            }

            if (statusbar && this.description) {
                statusbar.status = this.description;
            }
        },
        onMouseLeft(e) {
            let statusbar = document.querySelector("js-statusbar");
            if (this.parentElement !== app.menu) {
                this.pvt.#hidePopup();
            }

            if (statusbar && (statusbar.status == this.description)) {
                statusbar.status = "";
            }
        }
    });

    connectedCallback() {
        this.addEventListener("captionChange", this.pvt.#prot.onCaptionChange);
        this.addEventListener("disabledChange", this.pvt.#prot.onDisabledChange);
        this.addEventListener("iconChange", this.pvt.#prot.onIconSrcChange);
        this.addEventListener("hotkeyChange", this.pvt.#prot.onHotKeyChange);
        this.addEventListener("mouseenter", this.pvt.#prot.onMouseEntered);
        this.addEventListener("mouseleave", this.pvt.#prot.onMouseLeft);
        this.addEventListener("click", this.pvt.#prot.onClicked);
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }

    get description() { return this.getAttribute("description"); }
    set description(v) { this.setAttribute("description", v); }

    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { this.pvt.#prot.setBoolAttribute("disabled", v); }
    
    get icon() { return this.getAttribute("icon"); }
    set icon(v) { this.setAttribute("icon", v); }
    
    get hotkey() { return this.getAttribute("hotkey"); }
    set hotkey(v) { this.setAttribute("hotkey", v); }

    get onAction() { return this.getAttribute("onaction"); }
    set onAction(v) { this.setAttribute("onaction", v); }
    
    get isSelected() { return this.classList.has("selected"); }
}
