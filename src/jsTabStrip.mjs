import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class TabStrip extends Base {
    static #spvt= share(this, {});

    static {
        this.#spvt.initAttributeProperties(this, {
        });
        this.#spvt.register(this);
    }

    #pvt= share(this, TabStrip, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent([
                pvt.make("slot"),
                pvt.make("div", {
                    class: "notab"
                })
            ]);
        },
        onTabClicked(event) {
            if (this.$.#activeTab) {
                this.$.#activeTab.isSelected = false;
            }
            this.$.#activeTab = event.target;
            event.target.isSelected = true;
        },
        onPostRender() {
            const pvt = this.$.#pvt;

            for (let child of this.children) {
                if (child.tagName.toLowerCase() == pvt.tagType("tab")) {
                    child.addEventListener("click", pvt.onTabClicked);
    
                    if (!this.$.#activeTab) {
                        this.$.#activeTab = child;
                        child.isSelected = true;
                    }
                }
            }
        }
    });
    #activeTab = null;

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.addEventListener("render", pvt.render);
        this.addEventListener("postRender", pvt.onPostRender);
    }

    get activeTab() { return this.$.#activeTab; }
    set activeTab(v) {
        if (!(v instanceof HTMLElement) || 
            (v.tagName.toLowerCase() != this.$.#pvt.tagType("tab"))) {
            throw new TypeError("Invalid new value for TabStrip.activeTab.")
        }
        
        let oldVal = this.$.#activeTab;
        this.$.#activeTab = v;
        if (oldVal) {
            oldVal.isSelected = false;
        }
        v.isSelected = true;
        this.fireEvent("activeTabChanged", { oldVal, newVal: v })
    }

}