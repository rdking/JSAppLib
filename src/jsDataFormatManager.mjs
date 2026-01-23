import { share, abstract, accessor } from "../node_modules/cfprotected/index.mjs";
import ManagerBase from "./jsManagerBase.mjs";
import AppLibError from "./errors/AppLibError.mjs"

/**
 * @description This is the management container tag for data format
 * translation. All data formats registered to this manager allow data to be
 * translated into and out of that format from any other registered format.
 * By default, a format is registered for handling JS Objects and JSON. Only
 * <js-dataformat> tags are allowed as children.
 */
export default class DataFormatManager extends ManagerBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ManagerBase.observedAttributes; 
    }

    static {
        const spvt =  this.#spvt;
        spvt.initAttributeProperties(this, {});
        spvt.register(this); 
    }

    #pvt = share(this, DataFormatManager, {
        onPostRender() {
            const pvt = this.$.#pvt;
            pvt.validateChildren(pvt.tagType("dataformat"), 
                "Invalid child of DataFormatManager. Children must be DataFormat tags only.");
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        const target = this.firstElementChild;
        
        this.insertBefore(
            pvt.make(pvt.tagType("dataformat"), {
                fixed: true,
                format: "js",
                type: "code"
            }, {
                children: [
                    pvt.make(pvt.tagType("from"), {
                        args: "doc"
                    }, {
                        innerHTML: "return doc;"
                    }),
                    pvt.make(pvt.tagType("to"), {
                        args: "doc"
                    }, {
                        innerHTML: "return doc;"
                    })
                ]
            }), 
            target
        );
        this.insertBefore(
            pvt.make(pvt.tagType("dataformat"), {
                fixed: true,
                format: "json",
                type: "code"
            }, {
                children: [
                    pvt.make(pvt.tagType("from"), {
                        args: "doc"
                    }, {
                        innerHTML: "return JSON.parse(doc);"
                    }),
                    pvt.make(pvt.tagType("to"), {
                        args: "doc"
                    }, {
                        innerHTML: "return JSON.stringify(doc, null, '  ');"
                    })
                ]
            }), 
            target
        );

        this.addEventListener("render", pvt.render);
    }

    get formats() {
        return [...this.children];
    }

    get stringFormats() {
        return [...this.children].filter(f => f.type == "string");
    }

    isRegistered(format) {
        const df = this.$.#pvt.tagType("dataformat");
        const element = this.querySelector(`${df}[format=${format}]`);

        return !!element && (typeof(element.from) == "function") && (typeof(element.to) == "function");
    }

    translate(srcFormat, destFormat, data) {
        const format = this.$.#pvt.tagType("dataformat");
        const stx = this.querySelector(`${format}[format=${srcFormat}]`);
        const dtx = this.querySelector(`${format}[format=${destFormat}]`);

        if (!stx) {
            throw new TypeError(`Unknown translation source format: ${srcFormat}`);
        }
        if (!dtx) {
            throw new TypeError(`Unknown translation source format: ${destFormat}`);
        }

        try {
            return dtx.to(stx.from(data));
        }
        catch(e) {
            throw new AppLibError("An error occured while translating...", e);
        }
    }
}
