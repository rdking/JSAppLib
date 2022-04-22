import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";

export default class TreeLeaf extends ListItem {
    static #tagName = "js-treeleaf";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return ListItem.observedAttributes; 
    }

    #value = "";

    #getMarker() {
        return (this.slot == "caption") && this.parentElement.collapsible
        ? this.parentElement.collapsed
            ? "&#x229e;"
            : "&#x229f;"
        : "&#x2501;"
    }

    #prot = share(this, TreeLeaf, {
        getTemplate() {
            const prot = this.pvt.#prot;
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
                        innerHTML: this.pvt.#getMarker()
                    })
                ].concat(children)
            });

            content.querySelector("span.marker").addEventListener("click", this.pvt.#prot.onMarkerClicked);
            
            return content;
        },
        onPreRender() {
            this.pvt.#prot.validateParent(["js-treebranch", "js-treeview"],
            "TreeLeaf elements can only be placed in a TreeView or TreeBanch");
        },
        onMarkerClicked(e) {
            if (this.parentElement.nodeName.toLowerCase() == "js-treebranch") {
                this.parentElement.collapsed = !this.parentElement.collapsed;
                e.cancelBubble = true;
            }
            this.pvt.#prot.onUpdateMarker();
        },
        onUpdateMarker(e) {
            if (this.parentElement.nodeName.toLowerCase() == "js-treebranch") {
                this.shadowRoot.querySelector("span.marker").innerHTML = this.pvt.#getMarker()
            }
        },
        onClick(e) {
            if (typeof(e.detail) == "object") {
                e.detail.allowBubble = true;
            }
            else {
                e.cancelBubble = false;
            }

            this.pvt.#prot.$uper.onClick(e);
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
        this.addEventListener("updateMarker", this.pvt.#prot.onUpdateMarker);
        super.connectedCallback();
    }
}
