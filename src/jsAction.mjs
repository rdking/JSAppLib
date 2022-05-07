import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class Action extends TagBase {
    static #tagName = "js-action";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get keyAttributes() {
        return ["caption", "description", "disabled", "hotkey", "icon", "name",
            "ontriggered"]; 
    }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(this.keyAttributes);
    }

    #prot = share(this, Action, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent(prot.newTag("slot"));
        },
        onPreRender() {
            if (!this.hasAttribute("name") || !this.getAttribute("name").trim().length) {
                throw new TypeError("Action elements must have a name attribute");
            }
            if (!this.hasAttribute("caption") || !this.getAttribute("caption").trim().length) {
                throw new TypeError("Action elements must have a caption attribute");
            }
            if (!this.hasAttribute("ontriggered") || !this.getAttribute("ontriggered").trim().length) {
                throw new TypeError("Action elements must have an ontriggered attribute");
            }
            this.pvt.#prot.validateParent("js-actionmanager",
                "Action elements can only contained by an ActionManager element");
        },
        onCaptionChange() {
            this.parentElement.updateClients(this, "caption");
        },
        onDescriptionChange() {
            this.parentElement.updateClients(this, "description");
        },
        onDisabledChange() {
            this.parentElement.updateClients(this, "disabled");
        },
        onHotkeyChange() {
            this.parentElement.updateClients(this, "hotkey");
        },
        onIconChange() {
            this.parentElement.updateClients(this, "icon");
        },
        onNameChange() {
            this.parentElement.updateClients(this, "name");
        },
        onOnTriggeredChange() {
            this.parentElement.updateClients(this, "ontriggered");
        },
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("captionChange", prot.onCaptionChange);
        this.addEventListener("descriptionChange", prot.onDescriptionChange);
        this.addEventListener("disabledChange", prot.onDisabledChange);
        this.addEventListener("hotkeyChange", prot.onHotkeyChange);
        this.addEventListener("iconChange", prot.onIconChange);
        this.addEventListener("nameChange", prot.onNameChange);
        this.addEventListener("onOnTriggeredChange", prot.onOnTriggeredChange);
        super.connectedCallback();
    }

    get caption() {
        return this.getAttribute("caption");
    }

    set caption(v) {
        this.setAttribute("caption", v);
    }
    
    get description() {
        return this.getAttribute("description");
    }

    set description(v) {
        this.setAttribute("description", v);
    }
    
    get disabled() {
        return this.hasAttribute("disabled");
    }

    set disabled(v) {
        this.pvt.#prot.setBoolAttribute("disabled", v);
    }
    
    get hotkey() {
        return this.getAttribute("hotkey");
    }

    set hotkey(v) {
        this.setAttribute("hotkey", v);
    }
    
    get icon() {
        return this.getAttribute("icon");
    }

    set icon(v) {
        this.setAttribute("icon", v);
    }
    
    get name() {
        return this.getAttribute("name");
    }

    set name(v) {
        this.setAttribute("name", v);
    }
    
    get ontriggered() {
        return this.getAttribute("ontriggered");
    }

    set ontriggered(v) {
        this.setAttribute("ontriggered", v);
    }
};
