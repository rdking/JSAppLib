import { share, accessor, abstract, final, saveSelf } from "../node_modules/cfprotected/index.mjs";
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
            const tabside = this.tabside || TabBook.#TabSide.top;
            const left = TabBook.#TabSide.left == tabside;
            const bottom = TabBook.#TabSide.bottom == tabside;
            const lr = [ TabBook.#TabSide.left, TabBook.#TabSide.right ].includes(tabside);
            const lt = [ TabBook.#TabSide.left, TabBook.#TabSide.top ].includes(tabside);

            pvt.renderContent([
                pvt.make(pvt.tagType("scspanel"), 
                left && lr ? {
                    id: "panel",
                    nolast: "",
                    horizontal: ""
                }: !left && lr ? {
                    id: "panel",
                    nofirst: "",
                    horizontal: ""
                }: !bottom && !lr ? {
                    id: "panel",
                    nolast: ""
                }: {
                    id: "panel",
                    nofirst: ""
                }, {
                    children: [
                        pvt.make(pvt.tagType("tabstrip"), 
                        bottom ? {
                            id: "tabs",
                            slot: "last",
                            flip: ""
                        }: left ? {
                            id: "tabs",
                            slot: "first",
                            reverse: ""
                        }: {
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
        pvt.registerEvents(pvt, {
            tabsideChanged: "onTabSideChanged"
        });

    }
}
