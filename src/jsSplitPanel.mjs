import { share, abstract, accessor } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";

const SplitPanel = abstract(class SplitPanel extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "minfirstwidth", "minsecondwidth", "splitpos"
        ]);
    }

    static {
        this.#spvt.initAttributeProperties(this, {
            minfirstwidth: {},
            minsecondwidth: {},
            splitpos: {}
        });
    }

    #observer;
    #resizing = false;
    #size;

    #getSize(target, axis, all) {
        const widthProp = axis || this.$.#pvt.widthProp;
        const style = window.getComputedStyle(target);
        let retval = target[`offset${widthProp}`];

        const front = parseFloat(style[`margin${widthProp == "Width" ? "Left" : "Top"}`]);
        const back = parseFloat(style[`margin${widthProp == "Width" ? "Right" : "Bottom"}`]);

        return all
            ? {front, body: retval, back}
            : retval + front + back;
    }

    #isInside(target, axis, value) {
        const tSize = this.$.#getSize(target, axis, true);
        return (value > -tSize.front) && (value < tSize.body + tSize.back);
    }

    #resizeSlots() {
        const widthProp = this.$.#pvt.widthProp;
        const size = this.$.#size;
        let first = this.shadowRoot.querySelector("slot[name=first]");
        let pos = ~~this.splitpos;
        
        //Ignore certain things when resizing
        this.$.#resizing = true;

        //Make sure we don't cross the limit....
        if (pos < this.minfirstwidth) {
            pos = this.minfirstwidth;
        } else if (pos > size - this.minsecondwidth) {
            pos = size - this.minsecondwidth;
        }
        
        if (pos !== ~~this.splitpos) {
            this.splitpos = pos;
        }
        
        if (first) {
            let splitter = first.nextElementSibling;
            let second = splitter.nextElementSibling;
            let firstDelta = pos;
            let secondDelta = size - pos;
            
            first.style["flex-basis"] = `${firstDelta}px`;
            second.style["flex-basis"] = `${secondDelta}px`;
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
                        name: "second"
                    })
                ]
            }));
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            let splitter = this.shadowRoot.querySelector("div.splitter");
            let container = splitter.parentElement;
            splitter.addEventListener("dragstart", pvt.onStartDragSplitter);
            splitter.addEventListener("drag", pvt.onDragSplitter);
            splitter.addEventListener("dragend", pvt.onEndDragSplitter);
            container.addEventListener("dragover", pvt.onDragOver);
            splitter.previousElementSibling.addEventListener("dragover", pvt.onDragOver);
            splitter.nextElementSibling.addEventListener("dragover", pvt.onDragOver);
        },
        onStartDragSplitter(e) {
            const pvt = this.$.#pvt;
            const splitter = this.shadowRoot.querySelector("div.splitter");
            const bounds = pvt.getBounds(splitter);
            const dimg = this.shadowRoot.querySelector("#dragimg");

            if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                this.$.#pvt.onResized();
            }
            
            e.dataTransfer.setData("text/plain", e.target.id);
            e.dataTransfer.setDragImage(dimg, 0, 0);
        },
        onDragSplitter(e) {
            const widthProp = this.$.#pvt.widthProp;
            const lengthProp = widthProp == "Width" ? "Height" : "Width";
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const heightAxis = widthAxis == "X" ? "Y" : "X";
            const offsetSide = {Width: "Left", Height: "Top"}[widthProp];
            const offsetLength = e[`offset${heightAxis}`];
            let splitter = this.shadowRoot.querySelector("div.splitter");

            if (this.$.#isInside(splitter, lengthProp, offsetLength)) {
                this.splitpos = e[`client${widthAxis}`] - this[`offset${offsetSide}`];
            }
        },
        onEndDragSplitter(e) {            
            const widthProp = this.$.#pvt.widthProp;
            const lengthProp = widthProp == "Width" ? "Height" : "Width";
            const widthAxis = {Width: "X", Height: "Y"}[widthProp];
            const heightAxis = widthAxis == "X" ? "Y" : "X";
            const offsetSide = {Width: "Left", Height: "Top"}[widthProp];
            const offsetLength = e[`offset${heightAxis}`];
            let splitter = this.shadowRoot.querySelector("div.splitter");

            if (this.$.#isInside(splitter, lengthProp, offsetLength)) {
                this.splitpos = e[`client${widthAxis}`] - this[`offset${offsetSide}`];
            }
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onResized(e) {
            if (e && (e[0].target == this)) {
                const pvt = this.$.#pvt;
                const widthProp = pvt.widthProp;
                const widthAxis = {Width: "inlineSize", Height: "blockSize"}[widthProp];
                const splitter = this.shadowRoot.querySelector("div.splitter");
                if (splitter) {
                    let bounds = pvt.getBounds(splitter, true);
                    this.$.#size = e[0].devicePixelContentBoxSize[0][widthAxis] - bounds[widthProp.toLowerCase()];
                    this.$.#resizeSlots();
                }
            }
        },
        onMinFirstWidthChanged() {
            if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                this.$.#pvt.onResized();
            } else {
                this.$.#resizeSlots();
            }
        },
        onMinSecondWidthChanged() {
            if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                this.$.#pvt.onResized();
            } else {
                this.$.#resizeSlots();
            }
        },
        onSplitPosChanged() {
            if (!this.$.#resizing) {
                if ((this.$.#size === void 0) || (this.$.#size < 0)) {
                    this.$.#pvt.onResized();
                } else {
                    this.$.#resizeSlots();
                }
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        this.$.#observer = new ResizeObserver(pvt.onResized);
        this.$.#observer.observe(this);

        this.addEventListener("render", pvt.render);
        this.addEventListener("postRender", pvt.onPostRender);
        this.addEventListener("dragover", pvt.onDragOver);
        this.addEventListener("minfirstwidthChanged", pvt.onMinFirstWidthChanged);
        this.addEventListener("minsecondwidthChanged", pvt.onMinSecondWidthChanged);
        this.addEventListener("splitposChanged", pvt.onSplitPosChanged);
        //window.addEventListener("resize", pvt.onResized);

        this.minfirstwidth = (!this.minfirstwidth && (this.minfirstwidth !== 0)) ? 32 : this.minfirstwidth;
        this.minsecondwidth = (!this.minsecondwidth && (this.minsecondwidth !== 0)) ? 32 : this.minsecondwidth;
    }
});

export default SplitPanel;
