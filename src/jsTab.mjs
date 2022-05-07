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
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                class: this.selected ? "" : "hidden",
                id: "page",
            }, {
                children: [
                    prot.newTag("slot")
                ]
            }));
        }, 
        onPreRender() {
            this.pvt.#prot.validateParent("js-tabset", "Tabs can only be added to TabSets.");
        },
        onIconSrcChange(e) {
            let icon = this.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = e.detail.newVal;
            }
        },
        onCaptionChange(e) {
            let label = this.shadowRoot.querySelector("#label");
            if (label) {
                label.setAttribute("caption", e.detail.newVal);
            }
        },
        onSelectedChange(e) {
            if (this.shadowRoot.innerHTML.length) {
                let page = this.shadowRoot.querySelector("#page");
                if (e.detail.newVal !== null) {
                    this.parentElement.fireEvent("tabChange", {newVal: this});
                    page.classList.remove("hidden");
                }
                else {
                    page.classList.add("hidden");
                }
            }
        }
    });

    connectedCallback() {
        this.addEventListener("iconsrcChange", this.pvt.#prot.onIconSrcChange);
        this.addEventListener("captionChange", this.pvt.#prot.onCaptionChange);
        this.addEventListener("selectedChange", this.pvt.#prot.onSelectedChange);
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
