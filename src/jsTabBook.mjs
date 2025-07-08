import { share, accessor, abstract, final, saveSelf } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";
import Enum from "./util/Enum.mjs";

export default class TabBook extends Container {
    static #spvt= share(this, {});
    static #TabSide = new Enum("TabSide", [ "left", "top", "right", "bottom"])
    static get TabSide() { return this.$.#TabSide; }

    static get observedAttributes() {
        return Container.observedAttributes.concat([ "tabside" ]);
    }

    static {
        const spvt = this.#spvt;
        saveSelf(this, '$');
        spvt.initAttributeProperties(this, {
            tabside: { enumType: TabBook.#TabSide }
        });
        spvt.register(this);
    }

    #currentPage = null;


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

    #pvt= share(this, TabBook, {
        render() {
            const pvt = this.$.#pvt;
            const left = TabBook.#TabSide.left == this.tabside;
            const bottom = TabBook.#TabSide.bottom == this.tabside;
            const lr = [ TabBook.#TabSide.left, TabBook.#TabSide.right ].includes(this.tabside);
            const lt = [ TabBook.#TabSide.left, TabBook.#TabSide.top ].includes(this.tabside);

            pvt.renderContent([
                pvt.make(pvt.tagType("scspanel"), 
                lr ? {
                    id: "panel",
                    nolast: "",
                    horizontal: ""
                }: {
                    id: "panel",
                    nofirst: ""
                }, {
                    children: [
                        pvt.make(pvt.tagType("tabstrip"), 
                        bottom ? {
                            id: "tabs",
                            slot: lt ? "first" : "last",
                            flip: ""
                        } : {
                            id: "tabs",
                            slot: lt ? "first" : "last"
                        }),
                        pvt.make("slot")
                    ]
                })
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
        },
        onTabSideChanged() {
            if (this.isRendered) {
                if ((this.tabside == TabBook.$.#TabSide.left) ||
                    (this.tabside == TabBook.$.#TabSide.right)) {
                    this.horizontal = true;
                }
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            tabsideChanged: pvt.onTabSideChanged
        });

    }
}
