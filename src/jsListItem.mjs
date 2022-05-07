import { share } from "/node_modules/cfprotected/index.mjs";
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
        let retval = template;
        
        if (typeof(template) == "string") {
            let params = template.match(/\$\{(\w+)}/g);
            retval = retval.trim();

            if (params) {
                for (let param of params) {
                    let key = param.substring(2, param.length - 1);
                    retval = retval.replaceAll(param, this.value[key] || "");
                }
            }
        }
        else {
            if (retval.hasChildNodes()) {
                for (let child of retval.childNodes) {
                    this.pvt.#populate(child);
                }
            } else {
                retval.textContent = this.pvt.#populate(retval.textContent);
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
            let pTemplate = this.pvt.#populate(template);
            let isString = typeof(template) == "string";
            let content = prot.newTag("div", {
                class: "listitem"
            }, {
                innerHTML: isString ? pTemplate : ""
            });
            if (!isString) {
                content.appendChild(pTemplate);
            }
            prot.renderContent(content);

        },
        onPreRender() {
            this.pvt.#prot.validateParent("js-listview", "ListItems can only be placed in a ListView");
        },
        onClick(e) {
            e.cancelBubble = !e.detail.allowBubble;
            this.selected = !this.selected;
        },
        onSelectedChange(e) {
            let state = e.detail.newVal === "";
            let sDiv = this.shadowRoot.querySelector("div.listitem");
            this.parentElement.fireEvent("selectedChange", { cause: this, state });

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
        this.addEventListener("selectedChange", this.pvt.#prot.onSelectedChange);
        super.connectedCallback();
    }

    get value() { 
        const translator = document.querySelector("js-datatranslator");
        let retval = this.innerHTML;

        if (translator) {
            retval = translator.translate(this.type, "js", retval);
        }

        return retval;
    }
    set value(v) {
        const translator = document.querySelector("js-datatranslator");
        if (translator) {
            this.innerHTML = translator.translate("js", this.type, v);
        }
        else {
            this.innerHTML = v;
        }
    }
    
    get type() { return this.getAttribute("type"); }
    set type(v) {
        const translator = document.querySelector("js-datatranslator");
        if (translator && !translator.isRegistered(v)) {
            throw new TypeError(`Unknown data format "${v}"`);
        }
        this.setAttribute("type", v);
    }

    get selected() { return this.hasAttribute("selected"); }
    set selected(v) { this.pvt.#prot.setBoolAttribute("selected", v); }
}
