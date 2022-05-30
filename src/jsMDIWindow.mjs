import { share } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class MDIWindow extends TagBase {
    static #tagName = "js-mdiwindow";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }

    #oldPosition = null;
    #dragOffsets = null;

    #prot = share(this, MDIWindow, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent([
                prot.newTag("div", {
                    class: "header"
                }, {
                    children: [
                        prot.newTag("div", {
                            id: "titleArea",
                            class: "title"
                        }, {
                            children: [
                                prot.newTag("label", {
                                    id: "title",
                                }, {
                                    innerHTML: this.title || " "
                                })
                            ]
                        }),
                        prot.newTag("div", {
                            class: "buttons"
                        }, {
                            children: [
                                prot.newTag("button", {
                                    id: "minimize"
                                }, {
                                    innerHTML: "&#x2500;"
                                }),
                                prot.newTag("button", {
                                    id: "maximize"
                                }, {
                                    innerHTML: "&#x2610;"
                                }),
                                prot.newTag("button", {
                                    id: "tiled",
                                    class: "hidden"
                                }, {
                                    innerHTML: "&#x2750;"
                                }),
                                prot.newTag("button", {
                                    id: "close"
                                }, {
                                    innerHTML: "&#x2715;"
                                })
                            ]
                        })
                    ]
                }),
                prot.newTag("div", {
                    class: "body"
                }, {
                    children: [
                        prot.newTag("slot", null, {
                            children: [
                                // prot.newTag("iframe")
                            ]
                        })
                    ]
                })
            ]);
        },
        onPostRender() {
            const prot = this.pvt.#prot;
            let titleArea = this.shadowRoot.querySelector("#titleArea");
            let minimize = this.shadowRoot.querySelector("#minimize");
            let maximize = this.shadowRoot.querySelector("#maximize");
            let tiled = this.shadowRoot.querySelector("#tiled");
            let close = this.shadowRoot.querySelector("#close");

            this.addEventListener("dragstart", prot.onDragStart);
            this.addEventListener("dragend", prot.onDragEnd);
            titleArea.addEventListener("mouseenter", prot.onMouseEnterTitle);
            titleArea.addEventListener("mouseleave", prot.onMouseLeaveTitle)
            minimize.addEventListener("click", prot.onMinimizeClick);
            maximize.addEventListener("click", prot.onMaximizeClick);
            tiled.addEventListener("click", prot.onTiledClick);
            close.addEventListener("click", prot.onCloseClick);
        },
        onTitleChange(e) {
            this.shadowRoot.querySelector("#title").caption = this.title;
        },
        onMouseEnterTitle(e) {
            if (!this.maximized) {
                this.setAttribute("draggable", true);
            }
        },
        onMouseLeaveTitle(e) {
            this.removeAttribute("draggable");
        },
        onDragStart(e) {
            this.parentElement.fireEvent("setDragOffsets", { 
                offsetX: e.offsetX,
                offsetY: e.offsetY
            });

            this.classList.add("hidden", "dragging");
            e.dataTransfer.setData("text/plain", e.target.id);
        },
        onDragEnd(e) {
            this.classList.remove("hidden", "dragging");

            let status = document.querySelector("js-statusbar");
            if (status) {
                status.status = '';
            }
        },
        onMinimizeClick() {
            let titleArea = this.shadowRoot.querySelector("#titleArea");
            let buttonArea = this.shadowRoot.querySelector("div.buttons");
            let body = this.shadowRoot.querySelector("div.body");
            this.slot = "minArea";
            buttonArea.classList.add("hidden");
            body.classList.add("hidden");
            titleArea.addEventListener("dblclick", this.pvt.#prot.onUnMinimize);
            this.classList.add("minimized");
            this.style.position = "revert";
        },
        onUnMinimize() {
            let titleArea = this.shadowRoot.querySelector("#titleArea");
            let buttonArea = this.shadowRoot.querySelector("div.buttons");
            let body = this.shadowRoot.querySelector("div.body");
            titleArea.removeEventListener("dblclick", this.pvt.#prot.onUnMinimize);
            buttonArea.classList.remove("hidden");
            body.classList.remove("hidden");
            this.style.position = "";
            this.classList.remove("minimized");
            this.slot = '';
        },
        onMaximizeClick(e) {
            e.srcElement.classList.add("hidden");
            e.srcElement.nextElementSibling.classList.remove("hidden");
            this.style.position = "revert";
        },
        onTiledClick(e) {
            e.srcElement.classList.add("hidden");
            e.srcElement.previousElementSibling.classList.remove("hidden");
            this.style.position = "";
        },
        onCloseClick() {
            let response = { canClose: true };
            this.fireEvent("closing", response);

            if (response.canClose) {
                this.parentElement.removeChild(this);
            }
        },
        onWindowClick() {
            this.parentElement.moveToTop(this);
        }
    });

    connectedCallback() {
        const prot = this.pvt.#prot;
        this.addEventListener("postRender", prot.onPostRender);
        this.addEventListener("titleChange", prot.onTitleChange);
        this.addEventListener("mousedown", prot.onWindowClick);
        super.connectedCallback();
    }

    get noMinimize() { this.hasAttribute("nominimize"); }
    set noMinimize(v) { this.pvt.#prot.setBoolAttribute("nominimize", v); }

    get noMaximize() { this.hasAttribute("nomaximize"); }
    set noMaximize(v) { this.pvt.#prot.setBoolAttribute("nomaximize", v); }

    get noClose() { this.hasAttribute("noclose"); }
    set noClose(v) { this.pvt.#prot.setBoolAttribute("noclose", v); }

    get title() { return this.getAttribute("title"); }
    set title(v) { this.setAttribute("title", v); }

    get maximized() {
        let tiled = this.shadowRoot.querySelector("#tiled");
        return !tiled.classList.contains("hidden");
    }
}
