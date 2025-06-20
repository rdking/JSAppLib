import { share } from "../../cfprotected/index.mjs";
import WaitBox from "./util/WaitBox.mjs";
import Container from "./jsContainer.mjs";

export default class ListItem extends Container {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([
            "items", "selected", "type"
        ]); 
    }

    static { 
        this.#spvt.initAttributeProperties(this, {
            selected: { isBool: true, caption: "selected" },
            type: { }
        });
        this.#spvt.register(this);
    }

    #observer = null;
    #parentWait = new WaitBox();

    #clone(array) {
        return Object.assign([], array);
    }

    #populate(template) {
        let retval = template;

        if (retval.nodeName == "#text") {
            retval = retval.textContent;
        }
        
        if (typeof(retval) == "string") {
            let params = retval.match(/\$\{(\w+)}/g);
            retval = retval.trim();

            if (params) {
                for (let param of params) {
                    let key = param.substring(2, param.length - 1);
                    retval = retval.replaceAll(param, this.value[key] || "");
                }
            }
        }
        else {
            if (retval.children.length) {
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
            return this.parentElement.querySelector("template").innerHTML || "";
        },
        getParentType() {
            return this.$.#pvt.tagType("listview");
        },
        getParentMessage() {
            return "ListItems can only be placed in a ListView";
        },
        render() {
            let pvt = this.$.#pvt;
            let template = pvt.getTemplate();
            let pTemplate = this.$.#populate(template);
            let isString = typeof(template) == "string";
            
            pvt.renderContent(pvt.make("div", {
                class: "listitem",
                tabindex: ""
            }, {
                innerHTML: isString ? pTemplate : "",
                children: [
                    isString ? null: pTemplate
                ]
            }));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.validateParent(pvt.getParentType(), pvt.getParentMessage());
        },
        onClick(e) {
            e.cancelBubble = true;
            this.parentElement.fireEvent("setModifiers", {
                ctrlDown: e.ctrlKey,
                shiftDown: e.shiftKey
            });
            this.selected = !this.selected;
        },
        onTypeChanged(e) {
            let {newValue, oldValue} = e.detail;

            const translator = app.dataFormatManager;
            if (translator && !translator.isRegistered(newValue)) {
                this.setAttribute("type", oldValue);
            }
        },
        onParentReady(e) {
            this.$.#parentWait.trigger();
        }
    });

    constructor() {
        super();
        this.type = this.type || "json";
        this.$.#observer = new MutationObserver(this.$.#pvt.render);
        this.$.#observer.observe(this, { attributes: false, childList: true, subtree: true});

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            "render": pvt.render,
            "preRender": pvt.onPreRender,
            "click": pvt.onClick,
            "selectedChanged": pvt.onSelectedChanged,
            "typeChanged": pvt.onTypeChanged
        });
    }

    connectedCallback() {
        let p = this.parentElement;
        if (!("fireEvent" in p)) {
            p.addEventListener("ready", this.$.#pvt.onParentReady);
            this.$.#parentWait.add(this,() => {
                this.parentElement.fireEvent("itemAdded", this);
            }, []);
        }
        else {
            this.parentElement.fireEvent("itemAdded", this);
        }
        super.connectedCallback();
    }

    disconnectedCallback() {
        this.parentElement.fireEvent("itemRemoved", this);
    }

    get value() { 
        const translator = app.dataFormatManager;
        let retval = this.innerHTML;

        if (translator) {
            retval = translator.translate(this.type, "js", retval);
        }

        return retval;
    }
    set value(v) {
        const translator = app.dataFormatManager;
        if (translator) {
            this.innerHTML = translator.translate("js", this.type, v);
        }
        else {
            this.innerHTML = v;
        }
    }
}
