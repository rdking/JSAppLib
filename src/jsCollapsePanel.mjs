import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class CollapsePanel extends TagBase {
    static #tagName = "js-collapsepanel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["collapsed"]); 
    }

    #prot = share(this, CollapsePanel, {
        render() {
            const prot = this.pvt.#prot;

            let content = prot.newTag("div");
            let header = prot.newTag("div", { class: "header" }, {
                innerHTML: prot.newTag("slot", { name: "header" }).outerHTML
            });
            let body = prot.newTag("div", { class: "body" }, {
                innerHTML: prot.newTag("slot").outerHTML
            });
            content.appendChild(header);
            content.appendChild(body);
            header.addEventListener("click", this.pvt.#prot.onHeaderClick);

            prot.renderContent(content);
        },
        onHeaderClick(e) {
            let detail = {canToggleCollapse: true, clickEvent: e};
            this.fireEvent("headerClicked", detail);
            if (detail.canToggleCollapse) {
                this.collapsed = !this.collapsed;
            }
        },
        onCollapsedChanged() {
            let div = this.shadowRoot.querySelector("div.body");
            if (div) {
                if (this.collapsed) {
                    div.classList.add("collapsed");
                } else {
                    div.classList.remove("collapsed");
                }
            }
        }
    });

    connectedCallback() {
        this.addEventListener("collapsedChanged", this.pvt.#prot.onCollapsedChanged);
        super.connectedCallback();
    }

    get collapsed() { return this.hasAttribute("collapsed"); }
    set collapsed(v) { this.pvt.#prot.setBoolAttribute("collapsed", v); }
};
