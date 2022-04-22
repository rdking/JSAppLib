import { share } from "/node_modules/cfprotected/index.mjs";
import FocusableTag from "/node_modules/jsapplib/src/jsFocusableTag.mjs";
import Semaphore from "/node_modules/jsapplib/src/util/Semaphore.mjs";

export default class ListView extends FocusableTag {
    static #tagName = "js-listview";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return FocusableTag.observedAttributes.concat(["items"]); 
    }

    #section = new WeakMap();
    #lastItem = null;
    #currentItem = null;
    #shiftDown = false;
    #ctrlDown = false;

    #clone(array) {
        return Object.assign([], array);
    }

    #prot = share(this, ListView, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                class: "listview"
            }, {
                children: [
                    prot.newTag("slot")
                ]
            }));
        },
        manageSelections(cause, prevItem, items) {
            if (!this.#section.has(cause)) {
                this.#section.set(cause, new Semaphore());
            }
            
            this.#section.get(cause).lock(() => {
                let pIndex = items.indexOf(prevItem);
                let cIndex = items.indexOf(cause);
                let lIndex = pIndex <= cIndex ? pIndex : cIndex;
                let hIndex = pIndex >= cIndex ? pIndex : cIndex;

                for (let i=0; i<items.length; ++i) {
                    if (this.pvt.#shiftDown) {
                        if ((i > lIndex) && (i < hIndex)) {
                            items[i].selected = !items[i].selected;
                        }
                        else if (![pIndex, cIndex].includes(i)) {
                            if (!this.pvt.#ctrlDown) {
                                items[i].selected = false;
                            }
                        }
                    }
                    else if ((!this.pvt.#ctrlDown) && (i !== cIndex)) {
                        items[i].selected = false;
                    }
                }
            });
        },
        onKeyDown(e) {
            if (this.multiSelect) {
                switch (e.code) {
                    case "ShiftLeft":
                    case "ShiftRight":
                        this.pvt.#shiftDown = true;
                        break;
                    case "ControlLeft":
                    case "ControlRight":
                        this.pvt.#ctrlDown = true;
                        break;
                    default:
                        break;
                }
            }
        },
        onKeyUp(e) {
            switch (e.code) {
                case "ShiftLeft":
                case "ShiftRight":
                    this.pvt.#shiftDown = false;
                    break;
                case "ControlLeft":
                case "ControlRight":
                    this.pvt.#ctrlDown = false;
                    break;
                default:
                    break;
            }
        },
        onKeyPress(e) {
            switch(e.code) {
                case "Home":
                case "End":
                case "PageUp":
                case "PageDown":
                case "ArrowLeft":
                case "ArrowRight":
                case "ArrowUp":
                case "ArrowDown":
            }
        },
        onPreRender() {
            this.pvt.#prot.validateChildren(["template", "js-listitem"],
                "Only ListViews can only contain ListItems and a single html template");

            let templates = this.querySelectorAll("template");
            if (templates.length !== 1) {
                throw new TypeError("ListView requires exactly 1 template definition.");
            }
        },
        onSelectedChanged(e) {
            let {cause, state} = e.detail;
            let prevItem = this.pvt.#lastItem;
            let items = this.items;

            this.pvt.#prot.manageSelections(this, prevItem, items);
            this.pvt.#lastItem = cause;
        }
    });

    connectedCallback() {
        this.addEventListener("preRender", this.pvt.#prot.onPreRender);
        this.addEventListener("keydown", this.pvt.#prot.onKeyDown);
        this.addEventListener("keyup", this.pvt.#prot.onKeyUp);
        this.addEventListener("selectedChanged", this.pvt.#prot.onSelectedChanged);
        super.connectedCallback();
    }

    get items() { return [...this.querySelectorAll("js-listitem")]; }

    get selectedItems() { return this.items.filter(v => v.selected); }

    get multiSelect() { return this.hasAttribute("multi-select"); }
    set multiSelect(v) { this.pvt.#prot.setBoolAttribute("multi-select", v); }
}
