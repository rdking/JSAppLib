import { share, saveSelf } from "../../cfprotected/index.mjs";
import Menu from "./jsMenu.mjs";
import MenuItem from "./jsMenuItem.mjs";
import Base from "./jsBase.mjs";

export default class PopupMenu extends Menu {
    static #spvt= share(this, {});

    static {
        this.#spvt.register(this);
    }

    #htmlCaption = null;
    #showing = false;

    #pvt = share(this, PopupMenu, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {
                id: "menubody",
                class: "hidden background"
            }, {
                children: [
                    pvt.make("slot")
                ]
            }));
        },
        onPreRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(
                pvt.tagTypes("menuitem", "menuseparator"),
                "Only MenuItems can be placed in a Menu."
            );
        },
        onMouseDown(e) {
            if (e.target instanceof MenuItem) {
                if (this.$.#showing) {
                    this.parentElement.fireEvent("click");
                }
            }
            else {
                this.hide();
            }
        },
        onExternalClick(e) {
            if (this.$.#showing) {
                const pvt = this.$.#pvt;
                const parent = pvt.isTagType(this.parentElement, pvt.tagType("menuitem"))
                    ? this.parentElement : null;

                if (![this, parent].includes(e.target)) {
                    try {
                        //See if we're a child element of the target.
                        this.$.#pvt.validateAncestry(e.target.nodeName.toLowerCase(), void 0, void 0, true);
                    }
                    catch(ex) {
                        //Since the click wasn't in this popup, hide it.
                        if (parent && parent.selected) {
                            parent.click();
                        }
                        else {
                            this.hide();
                        }
                    }
                }
            }
        },
        onBlur(e) {
            if (this.$.#showing) {
                const pvt = this.$.#pvt;
                const parent = pvt.isTagType(this.parentElement, pvt.tagType("menuitem"))
                    ? this.parentElement : null;

                if (![this, parent].includes(e.target)) {
                    try {
                        //See if we're a child element of the target.
                        this.$.#pvt.validateAncestry(e.target.nodeName.toLowerCase(), void 0, void 0, true);
                    }
                    catch(ex) {
                        //Since the click wasn't in this popup, hide it.
                        if (parent && parent.selected) {
                            parent.click();
                        }
                        else {
                            this.hide();
                        }
                    }
                }
            }
        }
    });
    
    constructor() {
        super();

        const pvt = this.$.#pvt;
        //this.addEventListener("mousedown", pvt.onMouseDown);
        this.addEventListener("render", pvt.render);
        window.addEventListener("blur", pvt.onBlur);
        window.addEventListener("click", pvt.onExternalClick);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }

    get isShowing() { return this.$.#showing; }

    show(left, top) {
        if (!this.$.#showing) {
            let div = this.shadowRoot.querySelector("#menubody.hidden");
            div.classList.replace("hidden", "showing");
            div.style.top = top;
            div.style.left = left;
            this.$.#showing = true;
        }
    }

    hide() {
        if (this.$.#showing) {
            let div = this.shadowRoot.querySelector("#menubody.showing");
            if (this.currentMenuItem) {
                this.currentMenuItem.fireEvent("click");
            }
            div.classList.replace("showing", "hidden");
            this.$.#showing = false;
        }
    }
}
