import { share, saveSelf } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

export default class MDIPanel extends ControlBase {
    static #spvt = share(this, {});

    static { 
        saveSelf(this, "$");

        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
        });
        this.#spvt.register(this);
    }

    #anonId = 0;
    #newDelta = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };

    #pvt = share(this, MDIPanel, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make("div", {
                    class: "dragoverlay"
                }),
                pvt.make(pvt.tagType("scspanel"), {
                    nofirst: ""
                }, {
                    children: [
                        pvt.make("slot"),
                        pvt.make("slot", {
                            id: "minArea",
                            name: "minArea",
                            slot: "last"
                        })
                    ]
                })
            ]);
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            let index = 0;
            pvt.validateChildren(pvt.tagType("mdiwindow"), "MDIPanel can only hold MDIWindows");
            
            [...this.children].forEach(child => {
                child.style.zIndex = index++;
                if (!child.id) {
                    child.id = `mdiwindow${++this.$.#anonId}`;
                }
            });

            if (this.childElementCount) {
                this.children[this.childElementCount - 1].classList.add("ontop");
            }
        },
        onStartDrag(e) {
            const overlay = this.$.#pvt.getShadowChild("div",".dragoverlay");
            if (e.detail) {
                overlay.classList.add("dragging");
                e.detail.style.zIndex = parseInt(e.detail.style.zIndex) + 1000000;
            } else {
                overlay.classList.add("resizing");
            }
        },
        onEndDrag(e) {
            const overlay = this.$.#pvt.getShadowChild("div",".dragoverlay");
            if (e.detail) {
                overlay.classList.remove("dragging");
                e.detail.style.zIndex = parseInt(e.detail.style.zIndex) - 1000000;
            } else {
                overlay.classList.remove("resizing");
            }
        }
    });

    constructor() {
        super();

        let pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            startDrag: "onStartDrag",
            endDrag: "onEndDrag"
        });
    }

    appendChild(child) {
        try {
            const pvt = this.$.#pvt;
            let index = this.childElementCount;
            super.appendChild(child);
            pvt.validateChildren(pvt.tagType("mdiwindow"), "MDIPanel can only hold MDIWindows");
            child.style.zIndex = index;
            if (!child.id) {
                child.id = `mdiwindow${++this.$.#anonId}`;
            }
        }
        catch(e) {
            this.removeChild(child);
            throw e;
        }
    }

    moveToTop(lastChild) {
        let index = 0;

        [...this.children].sort((a, b) => {
            return parseInt(b.style.zIndex) - parseInt(a.style.zIndex);
        }).forEach(child => {
            if (child !== lastChild) {
                child.classList.remove("ontop");
                child.style.zIndex = index++;
            }
        });
        
        if (parseInt(lastChild.style.zIndex) > index) {
            index += 1000000;
        }

        lastChild.style.zIndex = index;
        lastChild.classList.add("ontop");
    }

    newWindow() {
        const pvt = this.$.#pvt;
        const delta = this.$.#newDelta;
        let win = document.createElement(pvt.tagType("mdiwindow"));
        win.style.top = delta.y + "px";
        win.style.left = delta.x + "px";
        this.appendChild(win);
        delta.x += 32;
        delta.y += 32;

        if ((delta.x > this.clientWidth/2) || (delta.y > this.clientHeight/2)) {
            delta.w += 32;
            if (delta.w > this.clientWidth/2) {
                delta.w = 0;
                delta.h += 32;

                if (delta.h > this.clientHeight/2) {
                    delta.h = 0;
                }
            }

            delta.x = delta.w;
            delta.y = delta.h;
        }

        return win;
    }
}