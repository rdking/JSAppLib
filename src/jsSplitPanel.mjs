import { share, abstract, accessor } from "../../cfprotected/index.mjs";
import Container from "./jsContainer.mjs";

const SplitPanel = abstract(class SplitPanel extends Container {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Container.observedAttributes.concat([
            "minfirstwidth", "minlastwidth", "splitpos"
        ]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            minfirstwidth: {},
            minlastwidth: {},
            splitpos: {}
        });
    }

    #resizing = false;
    #size;

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
        const sgap = pvt.getBounds(splitter, true)[widthProp.toLowerCase()];
        let size = this.$.#size;
        let pos = ~~this.splitpos;

        if (size === void 0) {
            size = pvt.getBounds()[widthProp.toLowerCase()];
        }

        size -= sgap;
        
        //Ignore certain things when resizing
        this.$.#resizing = true;

        //Make sure we don't cross the limit....
        if (pos < 0) {
            pos = this[`client${widthProp}`] + pos;
        }
        
        if (pos >= 0) {
            if (pos < this.minfirstwidth) {
                pos = this.minfirstwidth;
            } else if (pos > size - this.minsecondwidth) {
                pos = size - this.minsecondwidth;
            }
        }
        
        if ((this.splitpos > 0) && (pos !== ~~this.splitpos)) {
            this.splitpos = pos;
        }
        
        if (first) {
            let second = splitter.nextElementSibling;
            let firstDelta = pos;
            let secondDelta = size - pos;
            let sprop = widthProp.toLowerCase();
            
            first.style[sprop] = `${firstDelta}px`;
            second.style[sprop] = `${secondDelta}px`;
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
            const pvt = this.$.#pvt;
            const dimg = this.$.#pvt.shadowRoot.querySelector("#dragimg");
            const status = document.querySelector("js-statusbar");

            if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                pvt.onResized([e]);
            }
            
            this.$.#size = pvt.getBounds()[pvt.widthProp.toLowerCase()];

            e.dataTransfer.setData("application/json", JSON.stringify({
                id: e.target.id,
                status: status.status
            }));
            e.dataTransfer.setDragImage(dimg, 0, 0);
        },
        onDragSplitter(e) {
            const widthProp = this.$.#pvt.widthProp;
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const offsetSide = {Width: "Left", Height: "Top"}[widthProp];
            const offsetLength = e[`client${widthAxis}`];
            const status = document.querySelector("js-statusbar");
            let splitter = this.$.#pvt.shadowRoot.querySelector("div.splitter");

            if (this.$.#isInside(splitter.parentElement, widthProp, offsetLength)) {
                this.splitpos = e[`client${widthAxis}`] - this[`app${offsetSide}`];
            }

            status.status = `Offset: ${e[`client${widthAxis}`]}`;
        },
        onEndDragSplitter(e) {
            const status = document.querySelector("js-statusbar");

            this.$.#pvt.onDragSplitter(e);
            status.status = e.dataTransfer.getData("application/json")
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onContainerResized(e) {
            console.log("Split Container Resized!");
        },
        onResized(e) {
            if (e && (e[0].target == this)) {
                const pvt = this.$.#pvt;
                const widthProp = pvt.widthProp;
                const widthAxis = {Width: "inlineSize", Height: "blockSize"}[widthProp];
                const status = document.querySelector("js-statusbar");
                const splitter = pvt.shadowRoot.querySelector("div.splitter");
                if (splitter) {
                    let bounds = pvt.getBounds(splitter, true);
                    this.$.#size = e[0].devicePixelContentBoxSize[0][widthAxis] - bounds[widthProp.toLowerCase()];
                    this.$.#resizeSlots();
                }
            }
            else {
                this.$.#resizeSlots();
            }
        },
        onMinSlotWidthChanged() {
            if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                this.$.#pvt.onResized();
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

        pvt.registerEvents({
            "dragover": pvt.onDragOver,
            "minfirstwidthChanged": pvt.onMinSlotWidthChanged,
            "minlastwidthChanged": pvt.onMinSlotWidthChanged,
            "splitposChanged": pvt.onSplitPosChanged,
            "resize": pvt.onResized
        });

        this.minfirstwidth = (!this.minfirstwidth && (this.minfirstwidth !== 0)) ? 32 : this.minfirstwidth;
        this.minlastwidth = (!this.minlastwidth && (this.minlastwidth !== 0)) ? 32 : this.minlastwidth;
    }
});

export default SplitPanel;
