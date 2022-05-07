import { share, accessor } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Enum from "/node_modules/jsapplib/src/util/Enum.mjs";

export default class ToolButton extends TagBase {
    static #tagName = "js-toolbutton";
    static #sprot = share(this, {
        actionFieldMap: accessor({
            get: () => ({
                caption: "caption",
                icon: "icon",
                description: "description",
                disabled: "disabled",
                ontriggered: "onAction"
            })
        })
    });
    static #buttonModes = new Enum("ButtonModes", ["iconOnly", "textOnly", "both"]);

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes
            .concat([ "caption", "displaymode", "icon" ]); 
    }

    static get ButtonModes() { return this.#buttonModes; }

    #update() {
        const prot = this.pvt.#prot;
        let button = this.shadowRoot.querySelector("button");
        let contents = button.innerHTML;
        button.innerHTML = "";

        if (this.displayMode !== ToolButton.ButtonModes.textOnly) {
            if (this.icon && this.icon.length) {
                button.appendChild(
                    prot.newTag("img", { src: this.icon})
                );
            }
        }

        if (this.displayMode !== ToolButton.ButtonModes.iconOnly) {
            if (this.caption && this.caption.trim().length) {
                let caption = this.caption.replace("_", "");
                button.appendChild(
                    prot.newTag("js-label", null, {caption})
                );
            }
        }

        if (button.innerHTML == "") {
            button.innerHTML = contents;
        }
    }

    #prot = share(this, ToolButton, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("button", { type: "button" }));
        },
        onUpdate() {
            this.pvt.#update();
        },
        onCaptionChange(e) {
            this.pvt.#update();
        },
        onIconSrcChange(e) {
            this.pvt.#update();
        },
        onMouseEntered(e) {
            let statusbar = document.querySelector("js-statusbar");

            if (statusbar && this.description) {
                statusbar.status = this.description;
            }
        },
        onMouseLeft(e) {
            let statusbar = document.querySelector("js-statusbar");

            if (statusbar && (statusbar.status == this.description)) {
                statusbar.status = "";
            }
        },
        onClicked(e) {
            if (!this.disabled) {
                Function(this.onAction)();
            }
        }
    });

    connectedCallback() {
        this.addEventListener("update", this.pvt.#prot.onUpdate);
        this.addEventListener("captionChange", this.pvt.#prot.onCaptionChange);
        this.addEventListener("displaymodeChange", this.pvt.#prot.onCaptionChange);
        this.addEventListener("iconChange", this.pvt.#prot.onIconSrcChange);
        this.addEventListener("mouseenter", this.pvt.#prot.onMouseEntered);
        this.addEventListener("mouseleave", this.pvt.#prot.onMouseLeft);
        this.addEventListener("click", this.pvt.#prot.onClicked);
        super.connectedCallback();
    }

    get caption() { return this.getAttribute("caption"); }
    set caption(v) { this.setAttribute("caption", v); }

    get description() { return this.getAttribute("description"); }
    set description(v) { this.setAttribute("description", v); }

    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(v) { this.pvt.#prot.setBoolAttribute("disabled", v); }
    
    get icon() { return this.getAttribute("icon"); }
    set icon(v) { this.setAttribute("icon", v); }

    get onAction() { return this.getAttribute("onaction"); }
    set onAction(v) { this.setAttribute("onaction", v); }

    get displayMode() { 
        let dm = this.getAttribute("displaymode");
        dm = dm ? dm : this.parentElement.displayMode;
        dm = dm ? dm : "both";
        return ToolButton.ButtonModes(dm);
    }
    set displayMode(v) {
        v = ToolButton.ButtonModes(v);
        this.setAttribute("displaymode", v.name);
    }
}
