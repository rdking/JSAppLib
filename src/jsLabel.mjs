import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

/**
 * @class Label
 * Declares a finite-length strip of text with options for truncation and
 * word wrapping.
 */
export default class Label extends TagBase {
    static #tagName = "js-label";
    static #sprot = share(this, {});
    
    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["caption", "align-end"]); 
    }

    #prot = share(this, Label, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("div", {
                class: (this.alignEnd) ? "alignEnd" : ""
            }, {
                children: [
                    prot.newTag("slot")
                ]
            }));
        },
    
        onCaptionChanged(vals) {
            this.setAttribute(vals.name, vals.newVal);
            this.innerHTML = this.getAttribute("caption");
        },
    
        onAlignEndChanged(vals) {
            this.fireEvent("render");
        }
            
    });

    connectedCallback() {
        this.addEventListener("captionChanged", this.pvt.#prot.onCaptionChanged);
        this.addEventListener("alignEndChanged", this.pvt.#prot.onAlignEndChanged);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(val) { this.setAttribute("caption", val); }

    get alignEnd() { return this.hasAttribute("align-end"); }
    set alignEnd(val) {
        if (val) {
            this.setAttribute("align-end", "");
        }
        else {
            this.removeAttribute("align-end");
        }
    }
}
