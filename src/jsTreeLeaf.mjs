import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";

export default class TreeLeaf extends ListItem {
    static #tagName = "js-treeleaf";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.$.#tagName; }
    static get observedAttributes() {
        return ListItem.observedAttributes.concat([
            "iscaption"
        ]); 
    }

    #value = "";

    #getMarker() {
        return this.isCaption && this.parentElement.collapsible
        ? this.parentElement.collapsed
            ? "&#x229e;"
            : "&#x229f;"
        : "&#x2501;"
    }

    #prot = share(this, TreeLeaf, {
        getTemplate() {
            const prot = this.$.#prot;
            let template = this.TreeView.querySelector("template").cloneNode(true);
            let children = Array.from(template.content.children);
            template.innerHTML = "";

            let content =  prot.newTag("span", {
                class: "leaf"
            }, {
                children: [
                    prot.newTag("span", {
                        class: "marker"
                    }, {
                        innerHTML: this.$.#getMarker()
                    })
                ].concat(children)
            });

            content.querySelector("span.marker").addEventListener("click", this.$.#prot.onMarkerClicked);
            
            return content;
        },
        onPreRender() {
            this.$.#prot.validateParent(["js-treebranch", "js-treeview"],
            "TreeLeaf elements can only be placed in a TreeView or TreeBanch");
        },
        onMarkerClicked(e) {
            if (this.parentElement.nodeName.toLowerCase() == "js-treebranch") {
                this.parentElement.collapsed = !this.parentElement.collapsed;
                e.cancelBubble = true;
            }
            this.$.#prot.onUpdateMarker();
        },
        onClick(e) {
            e.cancelBubble = true;
            this.TreeView.fireEvent("setModifiers", {
                ctrlDown: e.ctrlKey,
                shiftDown: e.shiftKey
            });
            this.selected = !this.selected;
        },
        onIsCaptionChange(e) {
            this.setAttribute("slot", (this.isCaption) ? "caption" : "");
        },
        onUpdateMarker(e) {
            if (this.parentElement.nodeName.toLowerCase() == "js-treebranch") {
                this.shadowRoot.querySelector("span.marker").innerHTML = this.$.#getMarker()
            }
        }
    });

    get TreeView() {
        let retval = this.parentElement;
        if (retval.nodeName.toLowerCase() != "js-treeview") {
            retval = retval.TreeView;
        }
        return retval;
    }

    connectedCallback() {
        const prot = this.$.#prot;
        this.addEventListener("iscaptionChange", prot.onIsCaptionChange);
        this.addEventListener("updateMarker", prot.onUpdateMarker);
        super.connectedCallback();
    }

    get isCaption() { return this.hasAttribute("iscaption"); }
    set isCaption(v) { this.$.#prot.setBoolAttribute("iscaption", !!v); }
}
