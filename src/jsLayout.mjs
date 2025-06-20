import { share, define } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import Enum from "./util/Enum.mjs";

export default class Layout extends Base {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "anchor", "mode"
        ]);
    }

    /**
     * Specifies the sides of this element which will take up all available
     * room in the parent container.
     * @readonly
     * @enum {number} AnchorType
     * @member fillParent - Consumes all free space in the parent
     * @member left - Aligned as close to the parent left edge as possible
     * @member top - Aligned as close to the parent top edge as possible
     * @member right - Aligned as close to the parent right edge as possible
     * @member bottom - Aligned as close to the parent bottom edge as possible
     */
    static AnchorType = new Enum("AnchorType", [ "fillParent", "left", "top", "right", "bottom" ]);

    /**
     * Specifies the layout mode of a Layout element
     * @readonly
     * @enum {number} ModeType
     * @member html - children rely on CSS
     * @member anchored - children required to use the "anchor" property
     * @member fixed - children required to specify coordinates and size
     */
    static ModeType = new Enum("ModeType", [ "html", "anchored", "fixed" ]);
    
    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            anchor: { enumType: this.AnchorType },
            mode: { enumType: this.ModeType }
        });
        spvt.register(this);
    }

    #pvt = share(this, Layout, {
        render() {
            const pvt = this.$.#pvt;

            pvt.renderContent(pvt.make("slot"));
        },
        postRender() {
            this.fireEventAsync("layout");
        },
        onResize(e) {
            const pvt = this.$.#pvt;
            if (e.target == this) {
                const slot = pvt.getShadowChild("", "slot");

                if (slot && (this.mode == Layout.ModeType.anchored)
                    && (this.anchor == Layout.AnchorType.fillParent)) {
                    const siblings = pvt.getSiblings();
                    let dims = { left: 0, right: 0, top: 0, bottom:0 };

                    for (let element of siblings) {
                        if (element !== this) {
                            const bounds = pvt.getBounds(element);

                            switch(element.anchor) {
                                case Layout.AnchorType.left:
                                    dims.left += bounds.width;
                                    break;
                                case Layout.AnchorType.top:
                                    dims.top += bounds.height;
                                    break;
                                case Layout.AnchorType.right:
                                    dims.right += bounds.width;
                                    break;
                                case Layout.AnchorType.bottom:
                                    dims.bottom += bounds.height;

                            }
                        }
                    }

                    slot.style.left = `${dims.left}px`;
                    slot.style.top = `${dims.top}px`;
                    slot.style.right = `${dims.right}px`;
                    slot.style.bottom = `${dims.bottom}px`;
                }
            }
        },
        onLayout() {
            const pvt = this.$.#pvt;
            const bounds = pvt.getBounds();
            console.log(`Layout requested!\n${JSON.stringify(bounds, null, "  ")}`);
            this.fireEvent("resize");
        },
        onAnchorChanged() {
            this.fireEvent("layout");
        },
        onModeChanged() {
            this.$.#pvt.onAnchorChanged();
        }
    });

    constructor() {
        super();

        const pvt = this.#pvt;
        pvt.registerEvents({
            "render": pvt.render,
            "postRender": pvt.postRender,
            "resize": pvt.onResize,
            "layout": pvt.onLayout,
            "anchorChanged": pvt.onAnchorChanged,
            "modeChanged": pvt.onModeChanged
        });
    }
}

