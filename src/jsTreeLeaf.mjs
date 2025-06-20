import { share, define, accessor } from "../../cfprotected/index.mjs";
import ListItem from "./jsListItem.mjs"

export default class TreeLeaf extends ListItem {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ListItem.observedAttributes.concat([
            "openchar", "closechar", "selected"
        ]); 
    }

    static {
        define(this, {
            TreeView: {
                get() {
                    let retval = this.parentElement;
                    while (retval && (retval.nodeName.toLowerCase() != this.$.#pvt.tagType("treeview"))) {
                        retval = retval.parentElement;
                    }
                    return retval;
                }
            }
        });
        this.#spvt.initAttributeProperties(this, {
            openchar: { caption: "openChar" },
            closechar: { caption: "closeChar" },
            selected: { isBool: true, caption: "selected" },
            iscaption: { isBool: true, caption: "isCaption" }
        });
        this.#spvt.register(this);
    }

    #value = "";

    #pvt = share(this, TreeLeaf, {
        getTemplate() {
            const pvt = this.$.#pvt;
            let template = this.TreeView.querySelector("template");

            let content =  pvt.make("span", {
                class: "leaf"
            }, {
                children: [
                    pvt.make("div", {
                        class: "marker"
                    }, {
                        //Using a 0-width space to preserve other spaces
                        innerHTML: this.$.getMarker()
                    }),
                    pvt.make("span", {}, {
                        innerHTML: template?template.innerHTML:this.innerHTML
                    })
                ]
            });

            content.querySelector(".marker").addEventListener("click", pvt.onMarkerClicked);
            
            return content;
        },
        getParentType() {
            return this.$.#pvt.tagTypes([ "treebranch", "treeview" ]) ;
        },
        getParentMessage() {
            return "TreeLeaf elements can only be placed in a TreeView or TreeBanch";
        },
        onMarkerClicked(e) {
            const pvt = this.$.#pvt;
            if (this.isCaption && pvt.isTagType(this.parentElement, "treebranch")) {
                this.parentElement.collapsed = !this.parentElement.collapsed;
                e.cancelBubble = true;
            }
        },
        onUpdateMarker(e) {
            const pvt = this.$.#pvt;
            if (pvt.isTagType(this.parentElement, "treebranch")) {
                const marker = pvt.getShadowChild("", ".marker");
                if (marker) {
                    marker.innerHTML = this.$.getMarker();
                }
            }
        },
        onRefresh(e) {
            const pvt = this.$.#pvt;
            const marker = pvt.getShadowChild("", ".marker");

            this.fireEvent(marker? "updateMarker":"render");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            "updateMarker": pvt.onUpdateMarker,
            "refresh": pvt.onRefresh,
            "opencharChanged": pvt.onRefresh,
            "closecharChanged": pvt.onRefresh
        });
    }

    connectedCallback() {
        super.connectedCallback();
    }

    get isFirst() {
        let siblings = Array.from(this.parentElement.children)
            .filter(e => !e.hasAttribute("iscaption"));
        return siblings[0] === this;
    }

    get isLast() {
        let siblings = Array.from(this.parentElement.children)
            .filter(e => !e.hasAttribute("iscaption"));
        return siblings[siblings.length -1] === this;
    }

    get nestLevel() {
        return this.parentElement.nestLevel + 1;
    }

    getMarker(src) {
        const blank = "&#x2002;";
        const pass = "&#x2502;";
        const dash = "&#x2500;"
        const dashMiddle = "&#x251C;"
        const dashEnd = "&#x2514;"
        const dashOpen = this.TreeView.getAttribute("openchar") || "&#x229f;";
        const dashClosed = this.TreeView.getAttribute("closechar") || "&#x229e;";
        const isLeaf = this.nodeName.toLowerCase() == this.$.#pvt.tagType("treeleaf");
        let self = this.isCaption ? this.parentElement: this;
        let parent = self.parentElement;
        let retval = "";

        if (isLeaf || !!self.$) {            
            src = (!src  || this.isCaption) ? self: src;

            if (src !== self) {
                retval += (self.isLast)? blank: pass;
            }
            else {
                if (src.isLast) {
                    if (src.isFirst && (this.nestLevel == 1)) {
                        retval += dash;
                    }
                    else {
                        retval += dashEnd;
                    }
                }
                else {
                    retval += dashMiddle;
                }
                
                if (this.isCaption || (self.nodeName.toLowerCase() == this.$.#pvt.tagType("treebranch"))) {
                    retval += (self.collapsed ? dashClosed: dashOpen);
                }
            }

            retval = ("getMarker" in parent)? parent.getMarker(src) + retval : retval;
        }

        return retval;
    }
}
