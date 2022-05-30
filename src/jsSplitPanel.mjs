import { share, abstract, accessor } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

const SplitPanel = abstract(class SplitPanel extends TagBase {
    #dragStart = null;
    #oldWidth = null;
    #minWidth = 32;

    #getSize(target, axis, all) {
        const widthProp = axis || this.pvt.#prot.widthProp;
        const style = window.getComputedStyle(target);
        let retval = target[`offset${widthProp}`];

        const front = parseFloat(style[`margin${widthProp == "Width" ? "Left" : "Top"}`]);
        const back = parseFloat(style[`margin${widthProp == "Width" ? "Right" : "Bottom"}`]);

        return all
            ? {front, body: retval, back}
            : retval + front + back;
    }

    #isInside(target, axis, value) {
        const tSize = this.pvt.#getSize(target, axis, true);
        return (value > -tSize.front) && (value < tSize.body + tSize.back);
    }

    #resizeFirst(delta) {
        const widthProp = this.pvt.#prot.widthProp;
        const clientProp = `client${widthProp}`;
        let first = this.shadowRoot.querySelector("slot[name=first]");
        let splitter = first.nextElementSibling;
        let newWidth = first[clientProp] + delta;
        
        if (newWidth <= 0) {
            newWidth = this.pvt.#oldWidth;
        }
        else {
            const minWidth = this.pvt.#minWidth;
            const limit = this[clientProp] - (this.pvt.#getSize(splitter) + minWidth);
            const end = this.pvt.#getSize(this) - (this.pvt.#getSize(splitter) + minWidth);
            
            if (newWidth > end) {
                newWidth = this.pvt.#oldWidth;
            }
            else if (newWidth < minWidth) {
                newWidth = minWidth;
            }
            else if (newWidth > limit) {
                newWidth = limit;
            }
        }
        first.style[widthProp.toLowerCase()] = newWidth + "px";
    }

    #setDragState(state) {
        let first = this.shadowRoot.querySelector("slot[name=first]");
        let fn = (!!state) ? "add": "remove";
        first.classList[fn]("draggable");
        first.nextElementSibling.nextElementSibling.classList[fn]("draggable");
        first.parentElement.classList[fn]("draggable");
        this.classList[fn]("draggable");
    }

    #prot = share(this, SplitPanel, {
        widthProp: accessor({
            get: () => { throw new TypeError("Must override widthProp"); }
        }),
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                class: "container",
            }, {
                children: [
                    prot.newTag("slot", {
                        name: "first"
                    }),
                    prot.newTag("div", {
                        draggable: true,
                        class: "splitter"
                    }),
                    prot.newTag("slot", {
                        name: "second"
                    })
                ]
            }));
        },
        onPostRender() {
            const prot = this.pvt.#prot;
            let splitter = this.shadowRoot.querySelector("div.splitter");
            let container = splitter.parentElement;
            splitter.addEventListener("dragstart", prot.onStartDragSplitter);
            splitter.addEventListener("dragend", prot.onEndDragSplitter);
            container.addEventListener("dragover", prot.onDragOver);
            splitter.previousElementSibling.addEventListener("dragover", prot.onDragOver);
            splitter.nextElementSibling.addEventListener("dragover", prot.onDragOver);
        },
        onStartDragSplitter(e) {
            const prot = this.pvt.#prot;
            let first = this.shadowRoot.querySelector("slot[name=first]");
            this.pvt.#dragStart = e[`offset${({Width: "X", Height: "Y"}[prot.widthProp])}`];
            this.pvt.#setDragState(true);
            this.pvt.#oldWidth = parseFloat(first.style[prot.widthProp.toLowerCase()] || first[`client${prot.widthProp}`]);
            e.dataTransfer.setData("text/plain", e.target.id);
        },
        onDragSplitter(e) {
            const widthProp = this.pvt.#prot.widthProp;
            const lengthProp = widthProp == "Width" ? "Height" : "Width";
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const heightAxis = widthAxis == "X" ? "Y" : "X";
            const offsetLength = e[`offset${heightAxis}`];
            let delta = e[`offset${widthAxis}`] - this.pvt.#dragStart;
            let first = this.shadowRoot.querySelector("slot[name=first]");

            if (!this.pvt.#isInside(first.nextElementSibling, lengthProp, offsetLength)) {
                delta = Number.MIN_SAFE_INTEGER;
            }
            this.pvt.#resizeFirst(delta);
        },
        onEndDragSplitter(e) {
            const widthProp = this.pvt.#prot.widthProp;
            const lengthProp = widthProp == "Width" ? "Height" : "Width";
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const heightAxis = widthAxis == "X" ? "Y" : "X";
            const offsetLength = e[`offset${heightAxis}`];
            let delta = e[`offset${widthAxis}`] - this.pvt.#dragStart;
            let first = this.shadowRoot.querySelector("slot[name=first]");

            if (!this.pvt.#isInside(first.nextElementSibling, lengthProp, offsetLength)) {
                delta = Number.MIN_SAFE_INTEGER;
            }
            this.pvt.#resizeFirst(delta);
            this.pvt.#setDragState(false);

        },
        onDragOver(e) {
            e.preventDefault();
        }
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("postRender", prot.onPostRender);
        this.addEventListener("dragover", prot.onDragOver);
        super.connectedCallback();
    }

    get panelMin() { return this.getAttribute("panelmin"); }
    set panelMin(v) { 
        if (v < 16) v = 16;
        this.setAttribute("panelmin", v); 
    }
});

export default SplitPanel;
