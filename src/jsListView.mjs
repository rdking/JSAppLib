import { share, accessor } from "../node_modules/cfprotected/index.mjs";
import FocusableTag from "./jsFocusableTag.mjs";
import jsContainer from "./jsContainer.mjs";
import Semaphore from "./util/Semaphore.mjs";

export default class ListView extends jsContainer {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return FocusableTag.observedAttributes.concat(["multiselect"]);
    }
    
    static { 
        this.#spvt.initAttributeProperties(this, {
            multiselect: { isBool: true, caption: "multiSelect" }
        });
        this.#spvt.register(this);
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

    #pvt = share(this, ListView, {
        lastItem: accessor({
            get: () => this.$.#lastItem
        }),
        validItemTypes: accessor({
            get: () => [ this.$.#pvt.tagType("listitem") ]
        }),
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("slot"));
        },
        manageSelections(cause, prevItem, items) {
            this.#section.lock(() => {
                let pIndex = items.indexOf(prevItem);
                let cIndex = items.indexOf(cause);
                let lIndex = pIndex <= cIndex ? pIndex : cIndex;
                let hIndex = pIndex >= cIndex ? pIndex : cIndex;

                for (let i=0; i<items.length; ++i) {
                    if (this.$.#shiftDown) {
                        if ((i > lIndex) && (i < hIndex)) {
                            items[i].selected = !items[i].selected;
                        }
                        else if (![pIndex, cIndex].includes(i)) {
                            if (!this.$.#ctrlDown) {
                                items[i].selected = false;
                            }
                        }
                    }
                    else if (!this.$.#ctrlDown && (i !== cIndex)) {
                        items[i].selected = false;
                    }
                }
            });
        },
        onKeyDown(e) {
            let items = this.items;
            let index = items.indexOf(this.$.#lastItem);
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
            const pvt = this.$.#pvt;
            let validItems = [ "template" ].concat(pvt.validItemTypes);
            pvt.validateChildren(validItems,
                "ListViews can only contain ListItems and a single html template");

            let templates = this.querySelectorAll("template");
            if (templates.length > 1) {
                throw new TypeError("ListView can only have 1 template definition.");
            }
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            const items = this.querySelectorAll(pvt.tagType("listitem"));
            items.forEach(item => {
                item.addEventListener("selectedChanged", pvt.onSelectedChanged);
            });
        },
        onSelectedChanged(e) {
            let prevItem = this.$.#lastItem;
            let items = this.items;

            this.$.#pvt.manageSelections(e.target, prevItem, items);
            this.$.#lastItem = e.target;
            this.focus();
        },
        onSetModifiers(e) {
            this.$.#ctrlDown = this.multiSelect
                ? !!e.detail.ctrlDown
                : false;
            this.$.#shiftDown = this.multiSelect
                ? !!e.detail.shiftDown
                : false;
        },
        onItemAdded(e) {
            const pvt = this.$.#pvt;
            let item = e.detail;

            if (item && pvt.isTagType(item, pvt.tagType("listitem"))) {
                item.addEventListener("selectedChanged", pvt.onSelectedChanged);
            }
       },
        onItemRemoved(e) {
            const pvt = this.$.#pvt;
            let item = e.detail;

            if (item && pvt.isTagType(item, pvt.tagType("listitem"))) {
                item.removeEventListener("selectedChanged", pvt.onSelectedChanged);
            }
        },
        onFocused(e) {
            console.log(`${this.localName} focused`);
        },
        onBlur(e) {
            console.log(`${this.localName} lost focus`);
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;


        pvt.registerEvents(pvt, {
            keydown: "onKeyDown",
            setModifiers: "onSetModifiers",
            itemAdded: "onItemAdded",
            itemRemoved: "onItemRemoved",
            focus: "onFocused",
            blur: "onBlur"
        });
    }

    get items() { 
        let types = this.$.#pvt.validItemTypes.join(",");
        return this.$.#getOrderedItems(types); 
    }

    get selectedItems() { return this.items.filter(v => v.selected); }

}
