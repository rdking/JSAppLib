import { share, accessor, abstract, final } from "../../cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import HTMLColor from "./util/HTMLColor.mjs";
import Enum from "./util/Enum.mjs";

const scss = `
<style>
    :host {
        flex: 1;
        overflow: auto;
        position: relative;
    }

    canvas {
        position: absolute;
        overflow: visible;
        left: calc(50% - 160px);
        top: calc(50% - 120px);
        width: 320px;
        height: 240px;
        background-color: black;
    }
</style>
`;

export default class Surface extends Base {
    static observedAttributes = ["surfacewidth", "surfaceheight", "width", "height"];
    static #Plane = new Enum("Planes", ["FRONT", "BACK", "SCRATCH"]);
    static get Plane() { return this.$.#Plane; }

    //Pulls in shared private functions
    static #spvt= share(this, {});

    static {
        this.#spvt.initAttributeProperties(this, {
            width: { },
            height: { },
            surfacewidth: { unbound: true },
            surfaceheight: { unbound: true }
        });
        this.#spvt.register(this);
    }

    #planes;
    #updating = [false, false, false];
    #target = 0;
    #resizing = 0;

    #pvt= share(this, Surface, {
        render() {
            let front = this.#pvt.make("canvas");
            let back = this.#pvt.make("canvas");
            let scratch = this.#pvt.make("canvas");
    
            front.id = "front";
            front.width = 320;
            front.height = 240;
            back.width = 320;
            back.height = 240;
            scratch.width = 320;
            scratch.height = 240;
    
            this.shadowRoot.innerHTML = scss;
            this.shadowRoot.append(front);
    
            this.#planes = [{
                canvas: front,
                context: front.getContext("2d", { willReadFrequently: true })
            }, {
                canvas: back,
                context: back.getContext("2d", { willReadFrequently: true })
            }, {
                canvas: scratch,
                context: scratch.getContext("2d", { willReadFrequently: true })
            }];
        },
        onWidthChanged(e) {
            if (!this.$.#resizing) {
                let { newValue } = e.detail;
                newValue = Math.max(1, newValue);
                this.$.#resize(newValue, this.height);
            }
        },
        onHeightChanged(e) {
            if (!this.$.#resizing) {
                let { newValue } = e.detail;
                newValue = Math.max(1, newValue);
                this.$.#resize(this.width, newValue);
            }
        },
        onSurfaceWidthChanged(e) {
            let { newValue } = e.detail;
            let canvas = this.$.#planes[0].canvas; 
            let style = canvas.style;
            let scrollLeft = canvas.Left + (canvas.scrollWidth - canvas.scrollLeft)/2;
            let factor = newValue/canvas.clientWidth;
            style.width = newValue + "px";
            if (newValue > this.clientWidth) {
                style.left = "0px";
                canvas.scrollLeft = scrollLeft * factor;
            }
            else {
                style.left = `calc(50% - ${newValue/2}px)`;
            }
        },
        onSurfaceHeightChanged(e) {
            let { newValue } = e.detail;
            let canvas = this.$.#planes[0].canvas; 
            let style = canvas.style;
            let scrollTop = canvas.scrollTop + (canvas.scrollHeight - canvas.scrollTop)/2;
            let factor = newValue/canvas.clientHeight;
            style.height = newValue + "px";
            if (newValue > this.clientWidth) {
                style.top = "0px";
                canvas.scrollTop = scrollTop * factor;
            }
            else {
                style.top = `calc(50% - ${newValue/2}px)`;
            }
        }
    });

    #resize(width, height) {
        const planes = this.$.#planes;
        let front = planes[0];
        let back = planes[1];
        let scratch = planes[2];
        scratch.canvas.setAttribute("width", width);
        scratch.canvas.setAttribute("height", height);
        scratch.context.drawImage(front.canvas, 0, 0, front.canvas.width, front.canvas.height, 0, 0, width, height);
        front.canvas.setAttribute("width", width);
        front.canvas.setAttribute("height", height);
        front.context.drawImage(scratch.canvas, 0, 0);
        back.canvas.setAttribute("width", width);
        back.canvas.setAttribute("height", height);
        back.context.drawImage(scratch.canvas, 0, 0);
        ++this.$.#resizing;
        this.setAttribute("width", width);
        this.setAttribute("height", height);
        --this.$.#resizing;
    }

    #parseColor(color) {
        let retval = color;
        try {
            if (!(color instanceof HTMLColor)) {
                retval = new HTMLColor(color);
            }
        }
        catch(e) {
            retval = color;
        }

        return retval;
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener("render", this.$.#pvt.render);
        this.addEventListener("widthChanged", this.$.#pvt.onWidthChanged);
        this.addEventListener("heightChanged", this.$.#pvt.onHeightChanged);
        this.addEventListener("surfacewidthChanged", this.$.#pvt.onSurfaceWidthChanged);
        this.addEventListener("surfaceheightChanged", this.$.#pvt.onSurfaceHeightChanged);
        super.connectedCallback();
    }

    setTargetLayer(layer) {
        layer = Surface.Plane(layer);
        this.$.#target = layer.value;
    }

    /**
     * Enables pixel editing mode.
     */
    beginPixelUpdate(layer) {
        if (layer == void 0) {
            layer = this.$.#target;
        }
        layer = Surface.Plane(layer);

        const target = layer.value;
        let retval;
        if (!this.$.#updating[target]) {
            const plane = this.$.#planes[target];
            const { width, height } = plane.canvas;
            plane.image = plane.context.getImageData(0, 0, width, height);
            
            this.$.#updating[target] = true;
            retval = plane.image;
        }
        return retval;
    }

    /**
     * Ends pixel editing mode.
     */
    endPixelUpdate(layer) {
        if (layer == void 0) {
            layer = this.$.#target;
        }
        layer = Surface.Plane(layer);

        const target = layer.value;
        if (this.$.#updating[target]) {
            const plane = this.$.#planes[target];
            plane.context.putImageData(plane.image, 0, 0);
            plane.image = null;
            
            this.$.#updating[target] = false;
        }
    }

    /**
     * Retrieves the color of a selected pixel.
     * @param {Number} x Horizontal coordinate
     * @param {Number} y Vertical coordinate
     * @returns HTMLColor corresponding to the selected pixel.
     */
    getPixel(x, y) {
        let retval = null;
        const target = this.$.#target;
        const plane = this.$.#planes[target];
        const image = plane.image;
        const context = plane.context;
        const canvas = plane.canvas;

        if (!this.#updating[target]) {
            throw new Error(`Cannot read pixels on the surface before calling "beginUpdate" on the current layer.`);
        }

        if ((x >= 0) && (y >= 0) && (canvas.width > x) && (canvas.height > y)) {
            const canvas = context.canvas;
            const index = 4 * (y * canvas.width + x);

            retval = new HTMLColor([image.data[index], image.data[index+1], image.data[index+2], image.data[index+3]/255]);
        }
        else {
            throw new Error(`Requested pixel position (${x}, ${y}) is outside the surface.`);
        }

        return retval;
    }

    /**
     * Sets a selected pixel to the given color.
     * @param {Number} x Horizontal coordinate
     * @param {Number} y Vertical coordinate
     * @param {HTMLColor} color Color to apply
     */
    setPixel(x, y, color) {
        const target = this.$.#target;
        const plane = this.$.#planes[target];
        const canvas = plane.canvas;

        if (!this.#updating[target]) {
            throw new Error(`Cannot write pixels on the surface before calling "beginUpdate" on the current layer.`);
        }

        if ((x >= 0) && (y >= 0) && (canvas.width > x) && (canvas.height > y)) {
            const image = plane.image;
            const index = 4 * (y * canvas.width + x);
            color = this.$.#parseColor(color);  
            image.data[index + 0] = color.red;
            image.data[index + 1] = color.green;
            image.data[index + 2] = color.blue;
            image.data[index + 3] = color.alpha;
        }
    }

    /**
     * Proportionately scales the Surface to the desired dimensions.
     * @param {Number} factor Multiplier requred to reach the new size.
     */
    scale(factorX, factorY) {
        if (this.isPixelEditing) {
            new Error("Cannot scale a surface while in Pixel Editing mode.");
        }

        let newWidth = ~~(this.width * factorX);
        let newHeight = ~~(this.height * factorY);
        this.$.#resize(newWidth, newHeight);
    }

    /**
     * Blanks all layers of the canvas.
     */
    clear() {
        if (!this.isPixelEditing) {
            for (let plane of this.$.#planes) {
                plane.context.clearRect(0, 0, plane.canvas.width, plane.canvas.height);
            }
        }
    }

    /**
     * Fills a selected layer with the given color.
     * @param {Surface.Plane} layer Plane to be cleared
     * @param {HTMLColor} color Color to fill the plane
     */
    clearLayer(layer, color) {
        if (!this.isPixelEditing) {
            let plane = this.$.#planes[Surface.Plane(layer).value];
            let canvas = plane.canvas;
            let context = plane.context;
            color = this.$.#parseColor(color);
            context.save();
            context.fillStyle = color.rgbaCode;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();
        }
    }

    /**
     * Copies the image data from one layer to another.
     * @param {Surface.Plane} from Source plane
     * @param {Surface.Plane} to Destination plane
     */
    copyLayer(from, to) {
        from = Surface.Plane(from);
        to = Surface.Plane(to);

        const fPlane = this.$.#planes[from.value];
        const tPlane = this.$.#planes[to.value];
        if (this.isPixelEditing) {
            throw new Error("Cannot copy surface layers while in Pixel Editing mode.");
        }
        tPlane.context.drawImage(fPlane.canvas, 0, 0);
    }

    get isPixelEditing() {
        const updating = this.$.#updating;
        return (updating[0] || updating[1] || updating[2]);
    }

    get surfaceWidth() {
        return this.$.#planes[0].canvas.clientWidth;
    }

    set surfaceWidth(v) {
        this.$.#pvt.onSurfaceWidthChanged({detail: {newValue: v}});
    }

    get surfaceHeight() {
        return this.$.#planes[0].canvas.clientHeight;
    }

    set surfaceHeight(v) {
        this.$.#pvt.onSurfaceHeightChanged({detail: {newValue: v}});
    }
}
