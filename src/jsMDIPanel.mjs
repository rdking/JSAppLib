import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class MDIPanel extends TagBase {
    static #tagName = "js-mdipanel";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }

    #dragOffsets = null;
    #anonId = 0;

    #prot = share(this, MDIPanel, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent([
                prot.newTag("slot"),
                prot.newTag("slot", {
                    id: "minArea",
                    name: "minArea"
                })
            ]);
        },
        onPostRender() {
            let index = 0;
            this.pvt.#prot.validateChildren("js-mdiwindow", "MDIPanel can only hold MDIWindows");
            
            [...this.children].forEach(child => {
                child.style.zIndex = index++;
                if (!child.id) {
                    child.id = `mdiwindow${++this.pvt.#anonId}`;
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
            const { offsetX, offsetY } = this.pvt.#dragOffsets;
            const target = document.getElementById(e.dataTransfer.getData(`text/plain`));
            const style = window.getComputedStyle(target);
            const x = parseFloat(style.left);
            const y = parseFloat(style.top);
            const left = e.offsetX - offsetX;
            const top = e.offsetY - offsetY;

            target.style.left = left + "px";
            target.style.top = top + "px";
            target.classList.remove("hidden", "dragging");

            this.pvt.#dragOffsets = null;
            e.preventDefault();
        },
        onSetDragOffsets(e) {
            this.pvt.#dragOffsets = e.detail;
        }
    });

    connectedCallback() {
        let prot = this.pvt.#prot;
        this.addEventListener("dragover", prot.onDragOver);
        this.addEventListener("drop", prot.onDrop);
        this.addEventListener('postRender', prot.onPostRender);
        this.addEventListener("setDragOffsets", prot.onSetDragOffsets);
        super.connectedCallback();
    }

    appendChild(child) {
        try {
            let index = this.childElementCount;
            super.appendChild(child);
            this.pvt.#prot.validateChildren("js-mdiwindow", "MDIPanel can only hold MDIWindows");
            child.style.zIndex = index;
            if (!child.id) {
                child.id = `mdiwindow${++this.pvt.#anonId}`;
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
}