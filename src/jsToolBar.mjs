import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import Enum from "/node_modules/jsapplib/src/util/Enum.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import ToolButton from "/node_modules/jsapplib/src/jsToolButton.mjs";

export default class ToolBar extends TagBase {
    static #tagName = "js-toolbar";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["displaymode", "edge"]);
    }

    static #BarEdges = new Enum("BarEdges", {
        "top": "toolbarTop",
        "left": "toolbarLeft",
        "bottom": "toolbarBottom",
        "right": "toolbarRight"
    });

    static get BarEdges() { return this.pvt.#BarEdges; }

    #prot = share(this, ToolBar, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent([
                prot.newTag("div", {
                    class: "vr"
                }),
                prot.newTag("slot")
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
            this.setAttribute("slot", this.edge.value);
        }
    });

    connectedCallback() {
        this.addEventListener("displaymodeChange", this.pvt.#prot.onDisplayModeChange);
        this.addEventListener("edgeChange", this.pvt.#prot.onEdgeChange);
        super.connectedCallback();
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
