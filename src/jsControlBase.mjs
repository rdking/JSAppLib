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
            const element = other || this;
            const rect = element.getBoundingClientRect();
            let { top, left, width, height, right, bottom } = rect;

            // getBoundingClientRect is relative to the viewport, so add scroll offsets
            // to get the position relative to the document.
            top += window.scrollY;
            left += window.scrollX;

            if (withMargins) {
                const style = window.getComputedStyle(element);
                const marginTop = parseFloat(style.marginTop);
                const marginLeft = parseFloat(style.marginLeft);
                const marginRight = parseFloat(style.marginRight);
                const marginBottom = parseFloat(style.marginBottom);

                top -= marginTop;
                left -= marginLeft;
                width += marginLeft + marginRight;
                height += marginTop + marginBottom;
            }
    
            // Using Math.round() is generally safer than the bitwise ~~ operator for rounding.
            return { top: Math.round(top), left: Math.round(left), width: Math.round(width), height: Math.round(height) };
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
        const app = this.closest('js-app');
        if (app) {
            const appRect = app.getBoundingClientRect();
            const thisRect = this.getBoundingClientRect();
            return thisRect.top - appRect.top;
        }
        return 0; // Or handle the "not in-app" case as needed
    }

    get appLeft() {
        const app = this.closest('js-app');
        if (app) {
            const appRect = app.getBoundingClientRect();
            const thisRect = this.getBoundingClientRect();
            return thisRect.left - appRect.left;
        }
        return 0; // Or handle the "not in-app" case as needed
    }
});

export default ControlBase;