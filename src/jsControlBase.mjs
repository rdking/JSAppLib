import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import Base from "./jsBase.mjs";

const ControlBase = abstract(class ControlBase extends Base {
    static #spvt = share(this, {});

    static {
        const spvt = this.#spvt;
        spvt.register(this);
    }

    #resizeObserver;

    #pvt = share(this, ControlBase, {
        getBounds(other, withMargins) {
            let e = other || this;
            let b = e.getBoundingClientRect();
            let c = window.getComputedStyle(e);
            let {height, width, bottom, right} = b;
            let top = e.offsetTop, left = e.offsetLeft;
            let margins = {
                top: parseFloat(c.marginTop),
                left: parseFloat(c.marginLeft),
                right: parseFloat(c.marginRight),
                bottom: parseFloat(c.marginBottom)
            };
            
            while (e.offsetParent) {
                e = e.offsetParent;
                top += e.offsetTop + (e.scrollX || e.scrollLeft || 0);
                left += e.offsetLeft + (e.scrollY || e.scrollTop || 0);         
            }

            if (withMargins) {
                top -= margins.top;
                left -= margins.left;
                right += margins.right
                bottom += margins.bottom;
                width += margins.left + margins.right;
                height += margins.top + margins.bottom;
            }
    
            return { top: ~~top, left: ~~left, width: ~~width, height: ~~height };
        },
        /**
         * Finds all of the children having the same parent, whether in the
         * light DOM or the shadow DOM.
         * @returns [ HTMLElements ]
         */
        getSiblings() {
            const pvt = this.$.#pvt;
            const parent = pvt.getShadowParent(this.parentElement);
            let retval;
            
            if (parent.nodeName.toLowerCase() == "slot") {
                retval = parent.assignedElements();
            } else {
                retval = parent.children;
            }

            return retval;
        },
        onResized(events) {
            let targets = new Map();
            for (const event of events) {
                this.fireEvent("resize", event);
                targets.set(event.target, event);
            }

            targets.forEach(event => {
                const parent = event.target;
                for (let child of this.children) {
                    if ("fireEvent" in child)
                        child.fireEvent("parentResized", event);
                }
            });

            this.$.#pvt.onPostRender();
        },
        observeSize(target) {
            this.$.#resizeObserver.observe(target);
        }
    });

    connectedCallback() {
        const pvt = this.$.#pvt;
        this.$.#resizeObserver = new ResizeObserver(pvt.onResized);
        
        super.connectedCallback();
    }

    disconnectedCallback() {
        let observer = this.$.#resizeObserver;
        observer.disconnect();

        super.disconnectedCallback();
    }

    get appTop() {
        let parent = this.offsetParent;
        let retval = this.offsetTop;
        
        while (!this.$.#pvt.isTagType(parent, "app")) {
            retval += parent.offsetTop;
            parent = parent.offsetParent;
        }

        return retval;
    }

    get appLeft() {
        let parent = this.offsetParent;
        let retval = this.offsetLeft;
        
        while (!this.$.#pvt.isTagType(parent, "app")) {
            retval += parent.offsetLeft;
            parent = parent.offsetParent;
        }

        return retval;
    }
});

export default ControlBase;