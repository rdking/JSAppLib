import { share } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";
import CSS from "./util/Selectors.mjs";

export default class CollapsePanel extends Container {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([
            "collapsed", "manual"
        ]); 
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        const [structure, skin] = super.getDefaultStyleSheet();
        return [
            [
                ...structure,
                [[CSS.TAG("div").CLASS("body")], {
                    display: "block"
                }],
                [[CSS.TAG("div").CLASS("body").CLASS("collapsed")], {
                    display: "none"
                }]
            ],
            [
                ...skin,
                [[CSS.TAG("div").CLASS("collapseheader")], {
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 0 auto"
                }],
                [[CSS.TAG("slot").CLASS("collapseheader")], {
                    display: "flex",
                    flex: "1 0 auto"
                }]
            ]
        ];
    }
    
    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            collapsed: { isBool: true, caption: "collapsed" },
            manual: { isBool: true, caption: "manual" }
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
                        class: "collapseheader"
                    }, {
                        children: [
                            pvt.make("slot", {
                                name: "header",
                                class: "collapseheader"
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
            if (!this.manual) {
                let detail = {canToggleCollapse: true, clickEvent: e};
                this.fireEvent("headerClicked", detail);
                if (detail.canToggleCollapse) {
                    this.collapsed = !this.collapsed;
                }
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
        },
    });

    constructor() {
        super();
        
        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            collapsedChanged: "onCollapsedChanged"
        });
    }
};
