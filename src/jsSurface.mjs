import { share, accessor, abstract, final, saveSelf } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import HTMLColor from "./util/HTMLColor.mjs";
import Enum from "./util/Enum.mjs";
import CSS from "./util/Selectors.mjs";

/**
 * @summary A high-level graphics surface for 2D drawing and pixel manipulation.
 * @description Provides a simplified, all-in-one interface for common graphics
 * tasks, while still allowing direct access to the underlying 2D context.
 */
export default class Surface extends Base {
    static #spvt = share(this, {});

    /**
     * @inheritdoc
     */
    static get observedAttributes() {
        return Base.observedAttributes.concat([
            "surfacewidth", "surfaceheight", "width", "height"
        ]);
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        return [
            [
                [[CSS.HOST], {
                    flex: "1 1 auto",
                    overflow: "auto",
                    position: "relative"
                }],
                [[CSS.TAG("canvas")], {
                    position: "absolute",
                    overflow: "visible",
                    left: "calc(50% - (var(--surface-width, 320px) / 2))",
                    top: "calc(50% - (var(--surface-height, 240px) / 2))",
                    width: "var(--surface-width, 320px)",
                    height: "var(--surface-height, 240px)"
                }]
            ],
            [
                [[CSS.TAG("canvas")], {
                    backgroundColor: "black"
                }]
            ]
        ];
    }

    static #Plane = new Enum("Planes", ["FRONT", "BACK", "SCRATCH"]);
    static get Plane() { return Surface.#Plane; }

    static {
        saveSelf(this, "$");
        const spvt = this.$.#spvt;

        spvt.initAttributeProperties(this, {
            width: { },
            height: { },
            surfacewidth: { unbound: true },
            surfaceheight: { unbound: true }
        });

        spvt.register(this);
    }

    #planes = [];
    #updating = [false, false, false];
    #target = 0;
    #resizing = 0;

    #pvt = share(this, Surface, {
        render() {
            const pvt = this.$.#pvt;
            const width = parseInt(this.width) || 320;
            const height = parseInt(this.height) || 240;

            const front = pvt.make("canvas", { id: "front" });
            const back = pvt.make("canvas", { id: "back" });
            const scratch = pvt.make("canvas", { id: "scratch" });

            front.width = back.width = scratch.width = width;
            front.height = back.height = scratch.height = height;

            pvt.renderContent(front);

            this.$.#planes = [{
                canvas: front,
                context: front.getContext("2d", { willReadFrequently: true })
            }, {
                canvas: back,
                context: back.getContext("2d", { willReadFrequently: true })
            }, {
                canvas: scratch,
                context: scratch.getContext("2d", { willReadFrequently: true })
            }];

            this.$.#updateSurfaceCSS();
        },
        onWidthChanged(e) {
            const pvt = this.$.#pvt;
            if (!this.$.#resizing) {
                let { newValue } = e.detail;
                newValue = Math.max(1, parseInt(newValue) || 1);
                pvt.resize(newValue, this.height);
            }
        },
        onHeightChanged(e) {
            const pvt = this.$.#pvt;
            if (!this.$.#resizing) {
                let { newValue } = e.detail;
                newValue = Math.max(1, parseInt(newValue) || 1);
                pvt.resize(this.width, newValue);
            }
        },
        onSurfaceWidthChanged(e) {
            this.$.#updateSurfaceCSS();
        },
        onSurfaceHeightChanged(e) {
            this.$.#updateSurfaceCSS();
        },
        resize(width, height) {
            const pvt = this.$.#pvt;
            const planes = this.$.#planes;
            if (!planes.length) return;

            let front = planes[0];
            let back = planes[1];
            let scratch = planes[2];

            // Use scratch to hold current image
            scratch.canvas.width = width;
            scratch.canvas.height = height;
            scratch.context.drawImage(front.canvas, 0, 0, front.canvas.width, front.canvas.height, 0, 0, width, height);

            // Resize front and back
            front.canvas.width = width;
            front.canvas.height = height;
            front.context.drawImage(scratch.canvas, 0, 0);

            back.canvas.width = width;
            back.canvas.height = height;
            back.context.drawImage(scratch.canvas, 0, 0);

            this.$.#resizing++;
            this.setAttribute("width", width);
            this.setAttribute("height", height);
            this.$.#resizing--;
            
            this.$.#updateSurfaceCSS();
        }
    });

    #updateSurfaceCSS() {
        const sw = parseInt(this.surfaceWidth) || parseInt(this.width) || 320;
        const sh = parseInt(this.surfaceHeight) || parseInt(this.height) || 240;
        this.style.setProperty("--surface-width", `${sw}px`);
        this.style.setProperty("--surface-height", `${sh}px`);
    }

    #parseColor(color) {
        if (color instanceof HTMLColor) return color;
        try {
            return new HTMLColor(color);
        } catch (e) {
            return color;
        }
    }

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            render: "render",
            widthChanged: "onWidthChanged",
            heightChanged: "onHeightChanged",
            surfacewidthChanged: "onSurfaceWidthChanged",
            surfaceheightChanged: "onSurfaceHeightChanged"
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.#updateSurfaceCSS();
    }

    setTargetLayer(layer) {
        this.$.#target = Surface.Plane(layer).value;
    }

    beginPixelUpdate(layer = this.$.#target) {
        const target = Surface.Plane(layer).value;
        if (!this.$.#updating[target]) {
            const plane = this.$.#planes[target];
            plane.image = plane.context.getImageData(0, 0, plane.canvas.width, plane.canvas.height);
            this.$.#updating[target] = true;
            return plane.image;
        }
        return this.$.#planes[target].image;
    }

    endPixelUpdate(layer = this.$.#target) {
        const target = Surface.Plane(layer).value;
        if (this.$.#updating[target]) {
            const plane = this.$.#planes[target];
            plane.context.putImageData(plane.image, 0, 0);
            plane.image = null;
            this.$.#updating[target] = false;
        }
    }

    getPixel(x, y) {
        const target = this.$.#target;
        if (!this.$.#updating[target]) {
            throw new Error(`Cannot read pixels before calling "beginPixelUpdate" on the current layer.`);
        }

        const plane = this.$.#planes[target];
        if (x >= 0 && y >= 0 && x < plane.canvas.width && y < plane.canvas.height) {
            const index = 4 * (y * plane.canvas.width + x);
            const d = plane.image.data;
            return new HTMLColor([d[index], d[index + 1], d[index + 2], d[index + 3] / 255]);
        }
        throw new Error(`Pixel (${x}, ${y}) is outside the surface.`);
    }

    setPixel(x, y, color) {
        const target = this.$.#target;
        if (!this.$.#updating[target]) {
            throw new Error(`Cannot write pixels before calling "beginPixelUpdate" on the current layer.`);
        }

        const plane = this.$.#planes[target];
        if (x >= 0 && y >= 0 && x < plane.canvas.width && y < plane.canvas.height) {
            const index = 4 * (y * plane.canvas.width + x);
            const c = this.$.#parseColor(color);
            const d = plane.image.data;
            d[index] = c.red;
            d[index + 1] = c.green;
            d[index + 2] = c.blue;
            d[index + 3] = c.alpha;
        }
    }

    clear() {
        if (this.isPixelEditing) return;
        for (const plane of this.$.#planes) {
            plane.context.clearRect(0, 0, plane.canvas.width, plane.canvas.height);
        }
    }

    clearLayer(layer, color) {
        if (this.isPixelEditing) return;
        const plane = this.$.#planes[Surface.Plane(layer).value];
        const ctx = plane.context;
        const c = this.$.#parseColor(color);
        ctx.save();
        ctx.fillStyle = c.rgbaCode || c;
        ctx.fillRect(0, 0, plane.canvas.width, plane.canvas.height);
        ctx.restore();
    }

    copyLayer(from, to) {
        if (this.isPixelEditing) throw new Error("Cannot copy layers while pixel editing.");
        const fPlane = this.$.#planes[Surface.Plane(from).value];
        const tPlane = this.$.#planes[Surface.Plane(to).value];
        tPlane.context.clearRect(0, 0, tPlane.canvas.width, tPlane.canvas.height);
        tPlane.context.drawImage(fPlane.canvas, 0, 0);
    }

    scale(factorX, factorY) {
        if (this.isPixelEditing) throw new Error("Cannot scale while pixel editing.");
        this.$.#pvt.resize(~~(this.width * factorX), ~~(this.height * factorY));
    }

    // High-level Drawing API
    drawLine(x1, y1, x2, y2, color, width = 1) {
        const ctx = this.context;
        const c = this.$.#parseColor(color);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = c.rgbaCode || c;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.restore();
    }

    drawRect(x, y, w, h, color, fill = false) {
        const ctx = this.context;
        const c = this.$.#parseColor(color);
        ctx.save();
        if (fill) {
            ctx.fillStyle = c.rgbaCode || c;
            ctx.fillRect(x, y, w, h);
        } else {
            ctx.strokeStyle = c.rgbaCode || c;
            ctx.strokeRect(x, y, w, h);
        }
        ctx.restore();
    }

    drawCircle(x, y, r, color, fill = false) {
        const ctx = this.context;
        const c = this.$.#parseColor(color);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = c.rgbaCode || c;
            ctx.fill();
        } else {
            ctx.strokeStyle = c.rgbaCode || c;
            ctx.stroke();
        }
        ctx.restore();
    }

    drawText(text, x, y, font = "12px sans-serif", color = "white") {
        const ctx = this.context;
        const c = this.$.#parseColor(color);
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = c.rgbaCode || c;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawImage(img, x, y, w, h) {
        const ctx = this.context;
        if (w !== undefined && h !== undefined) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.drawImage(img, x, y);
        }
    }

    snapshot(type = "image/png", quality = 1.0) {
        return this.$.#planes[0].canvas.toDataURL(type, quality);
    }

    get context() {
        return this.$.#planes[this.$.#target].context;
    }

    get isPixelEditing() {
        return this.$.#updating.some(v => v);
    }

    get surfaceWidth() {
        return this.hasAttribute("surfacewidth") ? this.getAttribute("surfacewidth") : this.width;
    }

    set surfaceWidth(v) {
        this.setAttribute("surfacewidth", v);
    }

    get surfaceHeight() {
        return this.hasAttribute("surfaceheight") ? this.getAttribute("surfaceheight") : this.height;
    }

    set surfaceHeight(v) {
        this.setAttribute("surfaceheight", v);
    }
}
