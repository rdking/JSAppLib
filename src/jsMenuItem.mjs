import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class MenuItem extends TagBase {
    static #tagName = "js-menuitem";
    static #sprot = share(MenuItem, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes
            .concat([ "caption", "icon", "hotkey", "onaction" ]); 
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
            let parentType = this.parentElement.nodeName.toLowerCase();
            let desc = document.createElement("span");
            let hotkey = document.createElement("span");
            let slot = document.createElement("slot");
            let label = document.createElement("js-label");
            let list = [];

            if (!["js-menu", "js-menuitem", "js-popupmenu"].includes(parentType)) {
                throw new SyntaxError("Menu items cannot exist outside of a menu or popup menu.");
            }

            desc.classList.add("description");
            list.push(desc);

            if (parentType == "js-popupmenu") {
                let icon = document.createElement("img");
                icon.id = "icon";
                icon.src = this.iconSrc || "";
                desc.appendChild(icon);

                label.classList.add("caption");

                hotkey.id = "hotkey";
                if (this.pvt.#hasPopup()) {
                    hotkey.innerText = "►";
                }
                else {
                    hotkey.innerText = this.hotkey || "";
                }
                list.push(hotkey);
            }

            label.id = "caption";
            label.caption = this.pvt.#htmlCaption;
            desc.appendChild(label);
            list.push(slot);
            
            this.pvt.#prot.renderContent(list);
        },
        onActionChanged(e) {
            this.removeEventListener("action", e.detail.oldVal);
            this.addEventListener("action", e.detail.newVal);
        },
        onPreRender() {
            this.pvt.#prot.validateParent(["js-menu", "js-popupmenu"], "MenuItems can only be placed in a Menu.");
            this.pvt.#prot.validateChildren("js-popupmenu", "Only PopupMenus can be placed in a MenuItem.");
        },
        onCaptionChanged(e) {
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
        onIconSrcChanged(e) {
            let icon = this.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = this.iconSrc;
            }
        },
        onHotkeyChanged(e) {
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
                else {
                    if (app.menu && app.menu.currentMenuItem) {
                        app.menu.currentMenuItem.pvt.#hidePopup();
                    }
    
                    this.fireEvent("action");
                }
            }
        },
        onMouseEntered(e) {
            let currentItem = this.parentElement.currentMenuItem;
            if (currentItem || (app.menu && app.menu.currentMenuItem)) {
                if (currentItem && (currentItem !== this)) {
                    currentItem.pvt.#hidePopup();
                }
                this.pvt.#showPopup();
            }
        },
        onMouseLeft(e) {
            if (this.parentElement !== app.menu) {
                this.pvt.#hidePopup();
            }
        }
    });

    connectedCallback() {
        this.addEventListener("actionChanged", this.pvt.#prot.onActionChanged);
        this.addEventListener("captionChanged", this.pvt.#prot.onCaptionChanged);
        this.addEventListener("iconChanged", this.pvt.#prot.onIconSrcChanged);
        this.addEventListener("hotkeyChanged", this.pvt.#prot.onHotkeyChanged);
        this.addEventListener("mouseenter", this.pvt.#prot.onMouseEntered);
        this.addEventListener("mouseleave", this.pvt.#prot.onMouseLeft);
        this.addEventListener("click", this.pvt.#prot.onClicked);
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }
    
    get icon() { return this.getAttribute("icon"); }
    set icon(v) { this.setAttribute("icon", v); }
    
    get hotkey() { return this.getAttribute("hotkey"); }
    set hotkey(v) { this.setAttribute("hotkey", v); }
    
    get isSelected() { return this.classList.has("selected"); }
}
