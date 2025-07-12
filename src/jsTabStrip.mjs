import { share, saveSelf, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class TabStrip extends Container {
    static #spvt= share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat(["flip", "reverse"]);
    }

    static {
        saveSelf(this, "$");
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            flip: { isBool: true, caption: "flip" }, 
            reverse: { isBool: true, caption: "reverse" }
        });
        spvt.register(this);
    }

    #pvt= share(this, TabStrip, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent([
                pvt.make("div", {
                    class: "tabstrip",
                    style: this.reverse ? "flex-direction: row-reverse;" : ""
                }, {
                    children: [
                        pvt.make("slot"),
                        pvt.make("div", {
                            class: "notab"
                        })
                    ]
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

            pvt.validateChildren("tab", "TabStrip can only contain tabs!")

            for (let child of this.children) {
                child.addEventListener("click", pvt.onTabClicked);

                if (this.flip) {
                    child.flip = true;
                }

                if (!this.$.#activeTab) {
                    this.$.#activeTab = child;
                    child.isSelected = true;
                }
            }
        }
    });

    #activeTab = null;

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