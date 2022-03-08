import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class Menu extends TagBase {
    static #tagName = "js-menu";
    static #sprot = share(Menu, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat([ "caption" ]); 
    }

    #htmlCaption = null;
    #currentMenuItem = null;

    #prot = share(this, Menu, {
        render() {
            let content = window.document.createElement("div");
            content.classList.add("menu");
            content.appendChild(window.document.createElement("slot"));
            this.pvt.#prot.renderContent(content);
        },
        onCaptionChanged(e) {
            let match = e.detail.newVal.match(/_(\w)/);
            if (match.length > 0) {
                let key = match[1];
                this.pvt.#htmlCaption = e.detail.newVal.replace(`_${key}`, `<u>${key}</u>`);
            }
            else {
                this.pvt.#htmlCaption = e.detail.newVal;
            }
            let label = this.shadowRoot.querySelector("js-label");
            if (label) {
                label.caption = this.pvt.#htmlCaption;
            }
        },
        onPopupOpened(e) {
            this.pvt.#currentMenuItem = e.detail.menuItem;
        },
        onPopupClosed(e) {
            this.pvt.#currentMenuItem = null;
        },
        onPreRender() {
            this.pvt.#prot.validateChildren("js-menuitem", "Only MenuItems can be placed in a Menu.");
        },

    });

    constructor() {
        super();
        if (this.cla$$.tagName === "js-menu") {
            this.slot = "header";
        }
    }

    connectedCallback() {
        this.addEventListener("captionChanged", this.pvt.#prot.onCaptionChanged);
        this.addEventListener("popupOpened", this.pvt.#prot.onPopupOpened);
        this.addEventListener("popupClosed", this.pvt.#prot.onPopupClosed);
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }

    get currentMenuItem() { return this.pvt.#currentMenuItem; }
}
