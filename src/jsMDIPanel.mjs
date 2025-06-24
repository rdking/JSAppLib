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

    #dragOffsets = null;
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
                pvt.make("slot"),
                pvt.make("slot", {
                    id: "minArea",
                    name: "minArea"
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
        onDragOver(e) {
            e.preventDefault();
        },
        onDrop(e) {
            if (this.$.#dragOffsets) {
                const { offsetX, offsetY } = this.$.#dragOffsets;
                const pvt = this.$.#pvt;
                const target = document.getElementById(e.dataTransfer.getData(`text/plain`));
                const pdims = pvt.getBounds(e.target);
                const tdims = pvt.getBounds();
                let x = e.offsetX - offsetX;
                let y = e.offsetY - offsetY;

                if (!pvt.isTagType(e.target, "MDIPanel")) {
                    x += parseFloat(pdims.left) - parseFloat(tdims.left);
                    y += parseFloat(pdims.top) - parseFloat(tdims.top);
                }

                target.style.left = x + "px";
                target.style.top = y + "px";
                target.classList.remove("dragging");
                target.style.opacity = '';

                this.$.#dragOffsets = null;
                e.preventDefault();
            }
        },
        onSetDragOffsets(e) {
            this.$.#dragOffsets = e.detail;
        }
    });

    constructor() {
        super();

        let pvt = this.$.#pvt;
        pvt.registerEvents({
            dragover: pvt.onDragOver,
            drop: pvt.onDrop,
            postRender: pvt.onPostRender,
            setDragOffsets: pvt.onSetDragOffsets
        });
    }

    appendChild(child) {
        try {
            let index = this.childElementCount;
            super.appendChild(child);
            this.$.#pvt.validateChildren("js-mdiwindow", "MDIPanel can only hold MDIWindows");
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
        let index = parseInt(lastChild.style.zIndex);

        [...this.children].forEach(child => {
            let val = parseInt(child.style.zIndex);
            if (val == this.childElementCount - 1) {
                child.classList.remove("ontop");
            }
            if (val > index) {
                child.style.zIndex = val - 1;
            }
        });
        
        lastChild.style.zIndex = this.childElementCount - 1;
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