import { share, abstract, accessor } from "../node_modules/cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

const SplitPanel = abstract(class SplitPanel extends Container {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([
            "minfirstwidth", "minlastwidth", "splitpos", "favorlast"
        ]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            favorlast: { isBool: true, caption: "favorlast" },
            minfirstwidth: {},
            minlastwidth: {},
            splitpos: {}
        });
    }

    #oldStatus;
    #resizing = false;
    #isResizing = false;
    // #size;

    #getSize(target, axis, all) {
        const widthProp = axis || this.$.#pvt.widthProp;
        const style = window.getComputedStyle(target);
        let retval = target[`offset${widthProp}`];

        let front = parseFloat(style[`margin${widthProp == "Width" ? "Left" : "Top"}`])
            + parseFloat(this.minfirstwidth);
        let back = parseFloat(style[`margin${widthProp == "Width" ? "Right" : "Bottom"}`])
            + parseFloat(this.minlastwidth);

        return all
            ? {front, body: retval, back}
            : retval - front - back;
    }

    #isInside(target, axis, value) {
        const tSize = this.$.#getSize(target, axis, true);
        return (value > tSize.front) && (value < tSize.body - tSize.back);
    }

    #resizeSlots() {
        const pvt = this.$.#pvt;
        const widthProp = pvt.widthProp;
        const first = pvt.shadowRoot.querySelector("slot[name=first]");
        const splitter = first?.nextElementSibling;
        const last = splitter?.nextElementSibling;
        const sgap = pvt.getBounds(splitter, true)[widthProp.toLowerCase()];
        let pos = ~~this.splitpos - (this.favorlast ? sgap : 0);
        let size = this[`client${widthProp}`] - sgap;
        
        //Ignore certain things when resizing
        this.$.#resizing = true;
        
        if ((!this.favorlast && (this.minfirstwidth > pos)) 
            || (this.favorlast && (this.minfirstwidth > size - pos))) {
            pos = this.favorlast ? size - this.minfirstwidth : this.minfirstwidth;
        } else if ((this.favorlast && (this.minlastwidth > pos)) 
            || (!this.favorlast && (this.minlastwidth > size - pos))) {
            pos = this.favorlast ? this.minlastwidth : size - this.minlastwidth;
        }
        
        if (first) {
            let firstDelta = this.favorlast ? size - pos : pos;
            let lastDelta =  this.favorlast ? pos : size - pos;
            let sprop = widthProp.toLowerCase();
            
            first.style[sprop] = `${firstDelta}px`;
            last.style[sprop] = `${lastDelta}px`;
        }
        this.$.#resizing = false;
    }
    
    #pvt = share(this, SplitPanel, {
        widthProp: accessor({
            get: () => { throw new TypeError("Must override widthProp"); }
        }),
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {
                class: "container",
            }, {
                children: [
                    pvt.make("slot", {
                        name: "first"
                    }),
                    pvt.make("div", {
                        draggable: "true",
                        role: "handle",
                        class: "splitter"
                    },{
                        children: [
                            pvt.make("img", {
                                id: "dragimg",
                                src: "node_modules/jsapplib/src/images/noimg.png"
                            })
                        ]
                    }),
                    pvt.make("slot", {
                        name: "last"
                    })
                ]
            }));
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            let splitter = this.$.#pvt.shadowRoot.querySelector("div.splitter");
            let container = splitter.parentElement;
            splitter.addEventListener("dragstart", pvt.onStartDragSplitter);
            splitter.addEventListener("drag", pvt.onDragSplitter);
            splitter.addEventListener("dragend", pvt.onEndDragSplitter);
            container.addEventListener("dragover", pvt.onDragOver);
            container.addEventListener("resize", pvt.onContainerResized);
            pvt.observeSize(container);
            pvt.$uper.onPostRender();
        },
        onStartDragSplitter(e) {
            const dimg = this.$.#pvt.shadowRoot.querySelector("#dragimg");
            const status = document.querySelector("js-statusbar");

            if (status && ("status" in status)) {
                this.$.#oldStatus = status.status;
            }

            e.dataTransfer.setDragImage(dimg, 0, 0);
        },
        onDragSplitter(e) {
            const widthProp = this.$.#pvt.widthProp;
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const offsetLength = e[`layer${widthAxis}`];
            const status = document.querySelector("js-statusbar");
            let splitter = this.$.#pvt.shadowRoot.querySelector("div.splitter");

            status.status = "";

            if (this.$.#isInside(splitter.parentElement, widthProp, offsetLength)) {
                let width =  parseFloat(this[`client${widthProp}`]);
                status.status += `width: ${width}, `;
                this.splitpos = this.favorlast ? width - offsetLength : offsetLength;
            }

            status.status += `layer${widthAxis}: ${e[`layer${widthAxis}`]}`;
        },
        onEndDragSplitter(e) {
            const status = document.querySelector("js-statusbar");

            this.$.#pvt.onDragSplitter(e);
            status.status = this.$.#oldStatus;
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onContainerResized(e) {
            console.log("Split Container Resized!");
        },
        onResized(e) {
            this.$.#isResizing = true;

            // if (e && ("detail" in e) && (e.detail.target == this.parentElement)) {
            //     const pvt = this.$.#pvt;
            //     const widthProp = pvt.widthProp;
            //     const splitter = pvt.shadowRoot.querySelector("div.splitter");

            //     if (splitter) {
            //         let max = this[`client${widthProp}`];
            //         this.$.#size = max;
            //         this.$.#resizeSlots();
            //     }
            // }
            // else {
                this.$.#resizeSlots();
            // }

            this.$.#isResizing = false;
        },
        onMinSlotWidthChanged(e) {
            const pvt = this.$.#pvt;
            let size = this[`client${pvt.widthProp}`];

            if ((size === void 0) || (size < 0)) {
                pvt.onResized(e);
            } else {
                this.$.#resizeSlots();
            }
        },
        onSplitPosChanged(e) {
            if (!this.$.#resizing) {
                this.$.#resizeSlots();
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;

        pvt.registerEvents(pvt, {
            dragover: "onDragOver",
            minfirstwidthChanged: "onMinSlotWidthChanged",
            minlastwidthChanged: "onMinSlotWidthChanged",
            splitposChanged: "onSplitPosChanged",
            parentResized: "onResized"
        });

        this.minfirstwidth = (!this.minfirstwidth && (this.minfirstwidth !== 0)) ? 32 : this.minfirstwidth;
        this.minlastwidth = (!this.minlastwidth && (this.minlastwidth !== 0)) ? 32 : this.minlastwidth;
    }
});

export default SplitPanel;
