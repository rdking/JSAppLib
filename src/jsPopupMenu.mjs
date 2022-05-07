import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import Menu from "/node_modules/jsapplib/src/jsMenu.mjs";
import MenuItem from "/node_modules/jsapplib/src/jsMenuItem.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class PopupMenu extends Menu {
    static #tagName = "js-popupmenu";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {                
        return TagBase.observedAttributes.concat([ "caption" ]); 
    }

    #htmlCaption = null;
    #showing = false;

    #prot = share(this, PopupMenu, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                id: "menubody",
                class: "hidden background"
            }, {
                children: [
                    prot.newTag("slot")
                ]
            }));
        },
        onCaptionChange(e) {
            let match = e.detail.newVal.match(/_(\w)/);
            if (match.length > 0) {
                let key = match[1];
                this.pvt.#prot.htmlCaption = e.detail.newVal.replace(`_${key}`, `<u>${key}</u>`);
            }
            else {
                this.pvt.#prot.htmlCaption = e.detail.newVal;
            }
            let label = this.shadowRoot.querySelector("js-label");
            if (label) {
                label.caption = this.pvt.#prot.htmlCaption;
            }
        },
        onPreRender() {
            this.pvt.#prot.validateChildren(["js-menuitem", "js-menuseparator"], "Only MenuItems can be placed in a Menu.");
        },
        onMouseDown(e) {
            if (e.target instanceof MenuItem) {
                if (this.pvt.#showing) {
                    this.parentElement.fireEvent("click");
                }
            }
            else {
                this.hide();
            }
        }
    });
    
    connectedCallback() {
        //this.addEventListener("mousedown", this.pvt.#prot.onMouseDown);
        this.addEventListener("captionChange", this.pvt.#prot.onCaptionChange);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }

    get isShowing() { return this.pvt.#showing; }

    show(left, top) {
        if (!this.pvt.#showing) {
            let div = this.shadowRoot.querySelector("#menubody.hidden");
            div.classList.replace("hidden", "showing");
            div.style.top = top;
            div.style.left = left;
            this.pvt.#showing = true;
        }
    }

    hide() {
        if (this.pvt.#showing) {
            let div = this.shadowRoot.querySelector("#menubody.showing");
            if (this.currentMenuItem) {
                this.currentMenuItem.fireEvent("click");
            }
            div.classList.replace("showing", "hidden");
            this.pvt.#showing = false;
        }
    }
}
