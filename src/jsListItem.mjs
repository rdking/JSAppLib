import { share } from "../node_modules/cfprotected/index.mjs";
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

    #clone(array) {
        return Object.assign([], array);
    }

    #populate(template) {
        let retval = template;

        //What comes in may not be from this class. Descendants can pass
        //  anything you can put into HTML as the template. We need to make
        //  sure we're only processing a string.
        if (retval.nodeName == "#text") {
            retval = retval.textContent;
        }
        else if (retval instanceof HTMLElement) {
            retval = retval.outerHTML;
        }

        //Replace every token with the corresponding value.
        return retval.replace(/\$\{(\w+)\}/g, (match, key) => {
            return this?.value[key] || "";
        }).trim();
    }

    #pvt = share(this, ListItem, {
        getTemplate() {
            return this.parentElement?.querySelector("template")?.innerHTML || "";
        },
        getParentType() {
            return this.$.#pvt.tagType("listview");
        },
        getParentMessage() {
            return "ListItems can only be placed in a ListView";
        },
        render() {
            let pvt = this.$.#pvt;
            let templateString = pvt.getTemplate();
            let populatedHtml = this.$.#populate(templateString);
            
            pvt.renderContent(pvt.make("div", {
                class: "listitem",
                tabindex: ""
            }, {
                innerHTML: populatedHtml
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

            const translator = JSAppLib.app.dataFormatManager;
            if (translator && !translator.isRegistered(newValue)) {
                this.setAttribute("type", oldValue);
            }
        },
        onParentReady(e) {
            this.$.#pvt.waitbox.trigger();
        }
    });

    constructor() {
        super();
        this.type = this.type || "json";

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            click: "onClick",
            // selectedChanged: "onSelectedChanged",
            typeChanged: "onTypeChanged",
            childListChanged: "render" // Re-render when innerHTML is changed externally
        });
    }

    connectedCallback() {
        const parent = this.parentElement;
        const box = this.$.#pvt.waitbox;

        // Always add the 'itemAdded' task to the WaitBox to ensure it fires after parent is ready.
        box.add(this, () => {
            this.parentElement.fireEvent("itemAdded", this);
        }, []);

        parent.addEventListener("ready", this.$.#pvt.onParentReady);
        super.connectedCallback();
    }

    disconnectedCallback() {
        this.parentElement.fireEvent("itemRemoved", this);
    }

    get value() { 
        const translator = JSAppLib.app.dataFormatManager;
        let retval = this.innerHTML;

        if (translator) {
            retval = translator.translate(this.type, "js", retval);
        }

        return retval;
    }
    set value(v) {
        const translator = JSAppLib.app.dataFormatManager;
        if (translator) {
            this.innerHTML = translator.translate("js", this.type, v);
        }
        else {
            this.innerHTML = v;
        }
    }
}
