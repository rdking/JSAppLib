import { share, accessor } from "/node_modules/cfprotected/index.mjs";
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

    static get observedEvents() {
        return FocusableTag.observedAttributes.concat([
            "selectedChange"
        ]);
    }

    #section = new Semaphore();
    #lastItem = null;
    #shiftDown = false;
    #ctrlDown = false;

    #clone(array) {
        return Object.assign([], array);
    }

    #getOrderedItems(types) {
        let stack = [];
        let queue = [];
        let item = this.firstElementChild;

        while (item) {
            if (item.matches("template")) {
                item = item.nextElementSibling;
                continue;
            }

            if (item.matches(types)) {
                queue[(item.slot == "caption") ? "unshift" : "push"](item);
                item = item.nextElementSibling;
                while (!item && stack.length) {
                    let pqueue = stack.pop();
                    let parent = pqueue.pop();
                    pqueue = pqueue.concat(queue);
                    queue = pqueue;
                    item = parent.nextElementSibling;
                }
            }
            else {
                queue.push(item);
                stack.push(queue);
                queue = [];
                item = item.firstElementChild;
            }
        }

        return queue;
    }

    #prot = share(this, ListView, {
        lastItem: accessor({
            get: () => this.pvt.#lastItem
        }),
        validItemTypes: accessor({
            get: () => [ "js-listitem" ]
        }),
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
            this.#section.lock(() => {
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
                    else if (!this.pvt.#ctrlDown && (i !== cIndex)) {
                        items[i].selected = false;
                    }
                }
            });
        },
        onKeyDown(e) {
            let items = this.items;
            let index = items.indexOf(this.pvt.#lastItem);
            let page = Math.ceil(this.clientHeight / (items[0] 
                ? items[0] : this).clientHeight);
            const last = items.length - 1;

            if (page >= items.length) {
                page = last;
            }

            if (index >= 0) {
                switch(e.code) {
                    case "Home":
                        index = (index == 0) ? -1 : 0;
                        break;
                    case "End":
                        index = (index == last) ? -1 : last;
                        break;
                    case "PageUp":
                        if (index == 0) {
                            index = -1;
                        }
                        else {
                            index -= page;
                            if (index < 0) {
                                index = 0;
                            }
                        }
                        break;
                    case "PageDown":
                        if (index == last) {
                            index = -1
                        }
                        else {
                            index += page;
                            if (index >= items.length) {
                                index = last;
                            }
                        }
                        break;
                    case "ArrowUp":
                        if (index > 0) {
                            --index;
                        }
                        else {
                            index = -1
                        }
                        break;
                    case "ArrowDown":
                        if (index < last) {
                            ++index;
                        }
                        else {
                            index = -1;
                        }
                        break;
                    default:
                        index = -1;
                }

                if (index >= 0) {
                    items[index].fireEvent("click", {detail: 1}, MouseEvent);
                }
            }
        },
        onPreRender() {
            let validItems = [ "template" ].concat(this.pvt.#prot.validItemTypes);
            this.pvt.#prot.validateChildren(validItems,
                "Only ListViews can only contain ListItems and a single html template");

            let templates = this.querySelectorAll("template");
            if (templates.length !== 1) {
                throw new TypeError("ListView requires exactly 1 template definition.");
            }
        },
        onSelectedChange(e) {
            let { cause } = e.detail;
            let prevItem = this.pvt.#lastItem;
            let items = this.items;

            this.pvt.#prot.manageSelections(cause, prevItem, items);
            this.pvt.#lastItem = cause;
        },
        onSetModifiers(e) {
            this.pvt.#ctrlDown = this.multiSelect
                ? !!e.detail.ctrlDown
                : false;
            this.pvt.#shiftDown = this.multiSelect
                ? !!e.detail.shiftDown
                : false;
        }
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("preRender", prot.onPreRender);
        this.addEventListener("keydown", prot.onKeyDown);
        this.addEventListener("selectedChange", prot.onSelectedChange);
        this.addEventListener("setModifiers", prot.onSetModifiers);
        super.connectedCallback();
    }

    get items() { 
        let types = this.pvt.#prot.validItemTypes.join(",");
        return this.pvt.#getOrderedItems(types); 
    }

    get selectedItems() { return this.items.filter(v => v.selected); }

    get multiSelect() { return this.hasAttribute("multiselect"); }
    set multiSelect(v) { this.pvt.#prot.setBoolAttribute("multiselect", v); }
}
