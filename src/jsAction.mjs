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
        onCaptionChanged() {
            this.parentElement.updateClients(this, "caption");
        },
        onDescriptionChanged() {
            this.parentElement.updateClients(this, "description");
        },
        onDisabledChanged() {
            this.parentElement.updateClients(this, "disabled");
        },
        onHotkeyChanged() {
            this.parentElement.updateClients(this, "hotkey");
        },
        onIconChanged() {
            this.parentElement.updateClients(this, "icon");
        },
        onNameChanged() {
            this.parentElement.updateClients(this, "name");
        },
        onOnTriggeredChanged() {
            this.parentElement.updateClients(this, "ontriggered");
        },
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("captionChanged", prot.onCaptionChanged);
        this.addEventListener("descriptionChanged", prot.onDescriptionChanged);
        this.addEventListener("disabledChanged", prot.onDisabledChanged);
        this.addEventListener("hotkeyChanged", prot.onHotkeyChanged);
        this.addEventListener("iconChanged", prot.onIconChanged);
        this.addEventListener("nameChanged", prot.onNameChanged);
        this.addEventListener("onOnTriggeredChanged", prot.onOnTriggeredChanged);
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
