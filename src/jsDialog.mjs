import { share, accessor } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Enum from "/node_modules/jsapplib/src/util/Enum.mjs";

export default class Dialog extends TagBase {
    static #tagName = "js-dialog";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes
            .concat([ "buttons", "title" ]); 
    }
    static get observedEvents() {
        return TagBase.observedEvents
            .concat(["buttonClick"]);
    }

    #hadParent = false;
    #prot = share(this, Dialog, {
        render() {
            const prot = this.pvt.#prot;
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
            buttonBar.innerHTML = "";

            for (let name of this.buttons) {
                let value = name.replace(/\s/g, "_").toLowerCase();
                let button = this.pvt.#prot.newTag("button", {
                    value: value
                }, {
                    innerHTML: name
                });
                buttonBar.appendChild(button);
                button.addEventListener("click", this.pvt.#prot.onButtonClick);
            }
        },
        onTitleChange(e) {
            this.shadowRoot.querySelector("#title").caption = this.title;
        }
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
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
        this.pvt.#hadParent = !!this.parentElement;
        if (!this.pvt.#hadParent) {
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

        if (!this.pvt.#hadParent) {
            app.removeChild(this);
            this.pvt.#hadParent = false;
        }
    }
}
