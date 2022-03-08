import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class ListItem extends TagBase {
    static #tagName = "js-listitem";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["items", "selected", "type"]); 
    }

    #observer = null;

    #clone(array) {
        return Object.assign([], array);
    }

    #populate(template) {
        let templateText = (typeof(template) == "string")
            ? template
            : template.outerHTML;
        let params = template.match(/\$\{(\w+)}/g);

        if (params) {
            for (let param of params) {
                let key = param.substring(2, param.length - 1);
                retval = retval.replaceAll(param, this.value[key] || "");
            }
        }

        return retval;
    }

    #prot = share(this, ListItem, {
        getTemplate() {
            return this.parentElement.querySelector("template").innerHTML;
        },
        render() {
            let prot = this.pvt.#prot;
            let template = prot.getTemplate() || "";
            prot.renderContent(prot.newTag("div", {
                class: "listitem"
            }, {
                innerHTML: this.pvt.#populate(template)
            }));
        },
        onPreRender() {
            this.pvt.#prot.validateParent("js-listview", "ListItems can only be placed in a ListView");
        },
        onClick(e) {
            e.cancelBubble = true;
            this.selected = !this.selected;
        },
        onSelectedChanged(e) {
            let state = e.detail.newVal === "";
            let sDiv = this.shadowRoot.querySelector("div.listitem");
            this.parentElement.fireEvent("selectedChanged", { cause: this, state });

            if (state) {
                sDiv.classList.add("selected");
            }
            else {
                sDiv.classList.remove("selected");
            }
        }
    });

    constructor() {
        super();
        this.type = this.type || "json";
        this.pvt.#observer = new MutationObserver(this.pvt.#prot.render);
        this.pvt.#observer.observe(this, { attributes: false, childList: true, subtree: true});
    }

    connectedCallback() {
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        this.addEventListener("click", this.pvt.#prot.onClick);
        this.addEventListener("selectedChanged", this.pvt.#prot.onSelectedChanged);
        super.connectedCallback();
    }

    get value() { return window.translator.translate(this.type, "js", this.innerHTML); }
    set value(v) { this.innerHTML = window.translator.translate("js", this.type, v); }
    
    get type() { return this.getAttribute("type"); }
    set type(v) {
        if (!window.translator.isRegistered(v)) {
            throw new TypeError(`Unknown data format "${v}"`);
        }
        this.setAttribute("type", v);
    }

    get selected() { return this.hasAttribute("selected"); }
    set selected(v) { this.pvt.#prot.setBoolAttribute("selected", v); }
}
