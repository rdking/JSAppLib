import { share } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

export default class CollapsePanel extends Container {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([
            "collapsed"
        ]); 
    }
    
    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            collapsed: { isBool: true, caption: "collapsed" }
        });
        spvt.register(this);
    }

    #pvt = share(this, CollapsePanel, {
        render() {
            const pvt = this.$.#pvt;
            let header;

            pvt.renderContent(pvt.make("div", {}, {
                children: [
                    header = pvt.make("div", {
                        class: "header"
                    }, {
                        children: [
                            pvt.make("slot", {
                                name: "header" 
                            })
                        ]
                    }),
                    pvt.make("div", {
                        class: "body"
                    }, {
                        children: [
                            pvt.make("slot")
                        ]
                    })
                ]
            }));

            header.addEventListener("click", pvt.onHeaderClick);
        },
        onHeaderClick(e) {
            let detail = {canToggleCollapse: true, clickEvent: e};
            this.fireEvent("headerClicked", detail);
            if (detail.canToggleCollapse) {
                this.collapsed = !this.collapsed;
            }
        },
        onCollapsedChanged() {
            let div = this.$.#pvt.shadowRoot.querySelector("div.body");
            if (div) {
                if (this.collapsed) {
                    div.classList.add("collapsed");
                } else {
                    div.classList.remove("collapsed");
                }
            }
        }
    });

    constructor() {
        super();
        
        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            collapsedChanged: "onCollapsedChanged"
        });
    }
};
