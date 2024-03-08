import { share } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

export default class ListItem extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat(["items", "selected", "type"]); 
    }
    static { 
        this.#spvt.initAttributeProperties({
            selected: { isBool: true },
            type: { }
        });
        this.#spvt.register(this);
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
                    this.$.#populate(child);
                }
            } else {
                retval.textContent = this.$.#populate(retval.textContent);
            }
        }

        return retval;
    }

    #pvt = share(this, ListItem, {
        getTemplate() {
            return this.parentElement.querySelector("template").innerHTML;
        },
        render() {
            let pvt = this.$.#pvt;
            let template = pvt.getTemplate() || "";
            let pTemplate = this.$.#populate(template);
            let isString = typeof(template) == "string";
            let content = pvt.newTag("div", {
                class: "listitem"
            }, {
                innerHTML: isString ? pTemplate : ""
            });
            if (!isString) {
                content.appendChild(pTemplate);
            }
            pvt.renderContent(content);

        },
        onPreRender() {
            this.$.#pvt.validateParent("js-listview", "ListItems can only be placed in a ListView");
        },
        onClick(e) {
            e.cancelBubble = true;
            this.parentElement.fireEvent("setModifiers", {
                ctrlDown: e.ctrlKey,
                shiftDown: e.shiftKey
            });
            this.selected = !this.selected;
        },
        onSelectedChange(e) {
            let state = e.detail.newVal !== null;
            let sDiv = this.shadowRoot.querySelector("div.listitem");
            this.parentElement.fireEvent("selectedChange", { cause: this, state });

            if (state) {
                sDiv.classList.add("selected");
            }
            else {
                sDiv.classList.remove("selected");
            }
        },
        onTypeChanged(e) {
            let {newValue, oldValue} = e.detail;

            const translator = document.querySelector("js-datatranslator");
            if (translator && !translator.isRegistered(newValue)) {
                this.setAttribute("type", oldValue);
            }
        }
    });

    constructor() {
        super();
        this.type = this.type || "json";
        this.$.#observer = new MutationObserver(this.$.#pvt.render);
        this.$.#observer.observe(this, { attributes: false, childList: true, subtree: true});
    }

    connectedCallback() {
        const pvt = this.$.#pvt;
        this.addEventListener("preRender", pvt.onPreRender);
        this.addEventListener("click", pvt.onClick);
        this.addEventListener("selectedChanged", pvt.onSelectedChange);
        this.addEventListener("typeChanged", pvt.onTypeChanged);
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
}
