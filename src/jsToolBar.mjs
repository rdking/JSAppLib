import { share, saveSelf } from "../../cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Container from "./jsContainer.mjs";
import SCSPanel from "./jsSCSPanel.mjs";
//import ToolButton from "/node_modules/jsapplib/src/jsToolButton.mjs";

export default class ToolBar extends Container {
    static #spvt = share(this, {});
    
    static get observedAttributes() {
        return Container.observedAttributes.concat(["displaymode", "edge", "moveable"]);
    }
    
    static {
        const spvt = this.#spvt;

        spvt.initAttributeProperties(this, {
            displaymode: {
                enum: ActionControlBase.ButtonModes
            },
            edge: {
                enum: SCSPanel.PanelPos
            },
            moveable: {
                isBool: true,
                caption: "moveable"
            }
        });
        spvt.register(this);
    }
    
    #pvt = share(this, ToolBar, {
        render() {
            const pvt = this.$.#pvt;
            
            pvt.renderContent([
                pvt.make("div", {
                    class: "vr hidden"
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
        onEdgeChanged(e) {
            const ppos = SCSPanel.PanelPos;

            if (ppos(this.edge) == ppos.content) {
                this.removeAttribute("slot");
            } else {
                this.setAttribute("slot", ppos(this.edge).name);
            }
        },
        onMoveableChanged(e) {
            let element = this.$.#pvt.shadowRoot.querySelector(".vr");
            
            if (element) {
                element.classList[this.moveable ? "add": "remove"]("hidden");
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt

        pvt.registerEvents(pvt, {
            displaymodeChanged: "onDisplayModeChange",
            edgeChanged: "onEdgeChanged",
            moveableChanged: "onMoveableChanged"
        });
    }
}
