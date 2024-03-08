import { share, saveSelf } from "../../cfprotected/index.mjs";
import Enum from "./util/Enum.mjs";
import Base from "./jsBase.mjs";
//import ToolButton from "/node_modules/jsapplib/src/jsToolButton.mjs";

export default class ToolBar extends Base {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return Base.observedAttributes.concat(["displaymode", "edge"]);
    }
    
    static #BarEdges = new Enum("BarEdges", [
        "top", "left", "bottom", "right"
    ]);
    
    static get BarEdges() { return this.$.#BarEdges; }
    
    static { this.#spvt.register(this); }
    
    #pvt = share(this, ToolBar, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make("div", {
                    class: "vr"
                }),
                pvt.make("slot")
            ]);
        },
        onDisplayModeChange(e) {
            let child = this.firstElementChild;

            while (child && ("fireEvent" in child)) {
                child.fireEvent("update");
                child = child.nextElementSibling;
            }
        },
        onEdgeChange(e) {
            this.setAttribute("slot", this.edge.name);
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt
        this.addEventListener("displaymodeChanged", pvt.onDisplayModeChange);
        this.addEventListener("edgeChanged", pvt.onEdgeChange);
        this.addEventListener("render", pvt.render);
    }

    get displayMode() { 
        let dm = this.getAttribute("displaymode");
        return dm ? ToolButton.ButtonModes(dm) : dm;
    }
    set displayMode(v) {
        v = ToolButton.ButtonModes(v);
        this.setAttribute("displaymode", v.name);
    }

    get edge() {
        let edge = this.getAttribute("edge") || "top";
        return ToolBar.BarEdges(edge);
    }
    set edge(v) {
        v = ToolBar.BarEdges(v);
        this.setAttribute("edge", v.name);
    }
}
