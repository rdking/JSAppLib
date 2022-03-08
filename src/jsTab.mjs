import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class Tab extends TagBase {
    static #tagName = "js-tab";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["icon", "caption", "selected"]);
    }

    #page = null;
    #prot = share(this, Tab, {
        render() {
            let div = this.pvt.#prot.newTag("div", {id: "page"});
            this.pvt.#prot.newTag("slot", null, {parent: div});
            if (!this.selected) {
                div.classList.add("hidden");
            }
            this.pvt.#prot.renderContent(div);
        }, 
        onPreRender() {
            this.pvt.#prot.validateParent("js-tabset", "Tabs can only be added to TabSets.");
        },
        onIconSrcChanged(e) {
            let icon = this.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = e.detail.newVal;
            }
        },
        onCaptionChanged(e) {
            let label = this.shadowRoot.querySelector("#label");
            if (label) {
                label.setAttribute("caption", e.detail.newVal);
            }
        },
        onSelectedChanged(e) {
            if (this.shadowRoot.innerHTML.length) {
                let page = this.shadowRoot.querySelector("#page");
                if (e.detail.newVal !== null) {
                    this.parentElement.fireEvent("tabChanged", {newVal: this});
                    page.classList.remove("hidden");
                }
                else {
                    page.classList.add("hidden");
                }
            }
        }
    });

    connectedCallback() {
        this.addEventListener("iconsrcChanged", this.pvt.#prot.onIconSrcChanged);
        this.addEventListener("captionChanged", this.pvt.#prot.onCaptionChanged);
        this.addEventListener("selectedChanged", this.pvt.#prot.onSelectedChanged);
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        super.connectedCallback();
    }

    close() {
        let e = { cancelClose: false };
        this.fireEvent("tabclosing", e);
        if (!e.cancelClose) {
            if (this.selected) {
                let other = this.nextElementSibling;
                if (other) {
                    other.selected = true;
                }
                else {
                    other = this.previousElementSibling;
                    if (other) {
                        other.selected = true;
                    }
                }
            }
            this.parentElement.removeChild(this);
        }
        return !e.cancelClose;
    }

    get iconSrc() { return this.getAttribute("icon"); }
    set iconSrc(v) { this.setAttribute("icon", v); }
    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }
    get selected() { return this.hasAttribute("selected"); }
    set selected(v) { this.pvt.#prot.setBoolAttribute("selected", v); }
}
