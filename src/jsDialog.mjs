import { share, accessor } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Enum from "/node_modules/jsapplib/src/util/Enum.mjs";

export default class Dialog extends TagBase {
    static #tagName = "js-dialog";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.$.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes
            .concat([ "buttons", "title" ]); 
    }
    static get observedEvents() {
        return TagBase.observedEvents
            .concat(["buttonClick"]);
    }
    static get isManagement() {return true};

    #hadParent = false;

    #renderButtons() {
        let retval = [];
        for (let name of this.buttons) {
            let value = name.replace(/\s/g, "_").toLowerCase();
            let button = this.$.#prot.newTag("button", {
                value: value
            }, {
                innerHTML: name
            });
            button.addEventListener("click", this.$.#prot.onButtonClick);
            retval.push(button);
        }

        return retval;
    }

    #prot = share(this, Dialog, {
        render() {
            const prot = this.$.#prot;
            prot.renderContent(
                prot.newTag("div", {
                    class: "overlay",
                    hidden: ""
                },{
                    children: [
                        prot.newTag("div", {
                            class: "dialog"
                        }, {
                            children: [
                                prot.newTag("div", {
                                    class: "title"
                                }, {
                                    children: [
                                        prot.newTag("js-label", {
                                            id: "title",
                                            caption: this.title || " "
                                        })
                                    ]
                                }),
                                prot.newTag("div", {
                                    class: "body"
                                }, {
                                    children: [
                                        prot.newTag("slot")
                                    ]
                                }),
                                prot.newTag("div", {
                                    class: "buttonbar"
                                }, {
                                    children: this.$.#renderButtons()
                                })
                            ]
                        })
                    ]
                })
            );
        },
        onButtonClick(e) {
            let data = Object.defineProperties({}, {
                button: {
                    enumerable: true,
                    value: e.currentTarget.value
                },
                closeDialog: {
                    enumerable: true,
                    writable: true,
                    value: true
                }
            });
            this.fireEvent("buttonClick", data);
            if (data.closeDialog) {
                this.hide();
            }
        },
        onButtonsChange(e) {
            const buttonBar = this.shadowRoot.querySelector("div.buttonbar");
            let buttons = this.$.#renderButtons();
            buttonBar.innerHTML = "";
            buttons.forEach(b => buttonBar.appendChild(b));
        },
        onTitleChange(e) {
            this.shadowRoot.querySelector("#title").caption = this.title;
        }
    });

    connectedCallback() {
        const prot = this.$.#prot;
        this.addEventListener("buttonsChange", prot.onButtonsChange);
        this.addEventListener("titleChange", prot.onTitleChange);
        super.connectedCallback();
    }

    get title() { return this.getAttribute("title"); }
    set title(v) { this.setAttribute("title", v); }

    get buttons() {
        let blist = this.getAttribute("buttons") || "";
        return blist.split(/\s*,\s*/);
    }
    set buttons(v) {
        v = v || "";

        if (typeof(v) == "string") {
            v = v.split(/\s*,\s*/);
        }
        this.setAttribute("buttons", v.join(","));
    }

    get visible() {
        let overlay = this.shadowRoot.querySelector("div.overlay");
        return !!(overlay && !overlay.hasAttribute("hidden"));
    }

    show() {
        this.$.#hadParent = !!this.parentElement;
        if (!this.$.#hadParent) {
            this.addEventListenerOnce("postRender", () => {
                let overlay = this.shadowRoot.querySelector("div.overlay");
                overlay.removeAttribute("hidden");
            });
            
            app.appendChild(this);
        }
        else {
            let overlay = this.shadowRoot.querySelector("div.overlay");
            overlay.removeAttribute("hidden");
        }
    }

    hide() {
        let overlay = this.shadowRoot.querySelector("div.overlay");
        overlay.setAttribute("hidden", "");

        if (!this.$.#hadParent) {
            app.removeChild(this);
            this.$.#hadParent = false;
        }
    }
}
