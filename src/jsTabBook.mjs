import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class TabBook extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([]);
    }

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {});
        spvt.register(this);
    }

    #currentPage = null;

    #pvt= share(this, TabBook, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent([
                pvt.make(pvt.tagType("tabstrip"), {
                    id: "tabs"
                }),
                pvt.make("slot")
            ]);
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            let tabStrip = this.$.#pvt.shadowRoot.querySelector("#tabs");

            for (let child of this.children) {
                if (child.tagName.toLowerCase() == pvt.tagType("tabpage")) {
                    let tab = pvt.make(pvt.tagType("tab"), {
                        id: child.getAttribute("tabname") || null,
                        caption: child.getAttribute("caption")
                    });

                    this.$.#setListeners(tab, child);
                    tabStrip.appendChild(tab);
                    
                    if (!this.$.#currentPage) {
                        this.$.#currentPage = child;
                        this.$.#currentPage.setAttribute("selected", "");
                    }
                }
            }
        }
    });

    #setListeners(tab, page) {
        tab.addEventListener("click", () => {
            if (this.$.#currentPage) {
                this.$.#currentPage.removeAttribute("selected");
            }
            this.$.#currentPage = page;
            page.setAttribute("selected", "");
        });

        page.addEventListener("selectedChanged", (event) => {
            let {newValue: newV} = event.detail;
            if (newV != null) {
                let tabs = this.$.#pvt.shadowRoot.getElementById("tabs");
                tabs.activeTab = tab;
            }
        });
    }
}
