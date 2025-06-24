import { share, saveSelf } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

export default class MDIWindow extends ControlBase {
    static #spvt = share(this, {});

    static { 
        saveSelf(this, "$");

        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
        });
        this.#spvt.register(this);
    }

    #oldPosition = null;
    #dragOffsets = null;
    #oldStatus = null;

    #pvt = share(this, MDIWindow, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make(pvt.tagType("scspanel"), {}, {
                    children: [
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecorner nwsearrow"
                        }),
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecenter nsarrow"
                        }),
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecorner neswarrow"
                        }),
                        pvt.make(pvt.tagType("scspanel"), {
                            horizontal: ""
                        }, {
                            children: [
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecorner neswarrow"
                                }),
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecenter ewarrow"
                                }),
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecorner nwsearrow"
                                }),
                                pvt.make(pvt.tagType("scspanel"), {
                                    nolast: ""
                                }, {
                                    children: [
                                        pvt.make("div", {
                                            slot: "first",
                                            class: "header"
                                        }, {
                                            children: [
                                                pvt.make("div", {
                                                    id: "titleArea",
                                                    class: "title"
                                                }, {
                                                    children: [
                                                        pvt.make("label", {
                                                            id: "title",
                                                        }, {
                                                            innerHTML: this.title || " "
                                                        })
                                                    ]
                                                }),
                                                pvt.make("div", {
                                                    class: "buttons"
                                                }, {
                                                    children: [
                                                        pvt.make("button", {
                                                            id: "minimize"
                                                        }, {
                                                            innerHTML: "&#x2500;"
                                                        }),
                                                        pvt.make("button", {
                                                            id: "maximize"
                                                        }, {
                                                            innerHTML: "&#x2610;"
                                                        }),
                                                        pvt.make("button", {
                                                            id: "tiled",
                                                            class: "hidden"
                                                        }, {
                                                            innerHTML: "&#x2750;"
                                                        }),
                                                        pvt.make("button", {
                                                            id: "close"
                                                        }, {
                                                            innerHTML: "&#x2715;"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        pvt.make("div", {
                                            class: "body"
                                        }, {
                                            children: [
                                                pvt.make("slot", null, {
                                                    children: [
                                                        pvt.make("iframe")
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                pvt.make("div", {
                                    slot: "last",
                                    class: "edgecorner neswarrow"
                                }),
                                pvt.make("div", {
                                    slot: "last",
                                    class: "edgecenter ewarrow"
                                }),
                                pvt.make("div", {
                                    slot: "last",
                                    class: "edgecorner nwsearrow"
                                })
                            ]
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecorner neswarrow"
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecenter nsarrow"
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecorner nwsearrow"
                        })
                    ]
                }),
            ]);
        },
        onPostRender() {
            const pvt = this.$.#pvt;
            let titleArea = pvt.shadowRoot.querySelector("div.header");
            let minimize = pvt.shadowRoot.querySelector("#minimize");
            let maximize = pvt.shadowRoot.querySelector("#maximize");
            let tiled = this.shadowRoot.querySelector("#tiled");
            let close = this.shadowRoot.querySelector("#close");

            titleArea.addEventListener("mouseenter", pvt.onMouseEnterTitle);
            titleArea.addEventListener("mouseleave", pvt.onMouseLeaveTitle)
            minimize.addEventListener("click", pvt.onMinimizeClick);
            maximize.addEventListener("click", pvt.onMaximizeClick);
            tiled.addEventListener("click", pvt.onTiledClick);
            close.addEventListener("click", pvt.onCloseClick);
        },
        onTitleChange(e) {
            this.$.#pvt.shadowRoot.querySelector("#title").caption = this.title;
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

            this.classList.add("dragging");
            e.dataTransfer.setData("text/plain", e.target.id);
            this.style.opacity="0.001";

            let status = document.querySelector("js-statusbar");
            if (status) {
                this.$.#oldStatus = status.status;
            }
        },
        onDragging(e) {
            let status = document.querySelector("js-statusbar");
            if (status) {
                status.status = `Dragging to {${e.offsetX}, ${e.offsetY}}`;
            }
        },
        onDragEnd(e) {
            this.classList.remove("dragging");
            this.style.opacity = '';

            let status = document.querySelector("js-statusbar");
            if (status) {
                status.status = this.$.#oldStatus;
            }
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onMinimizeClick() {
            const pvt = this.$.#pvt;
            let titleArea = pvt.shadowRoot.querySelector("#titleArea");
            let buttonArea = pvt.shadowRoot.querySelector("div.buttons");
            let body = pvt.shadowRoot.querySelector("div.body");
            this.slot = "minArea";
            buttonArea.classList.add("hidden");
            body.classList.add("hidden");
            titleArea.addEventListener("dblclick", pvt.onUnMinimize);
            this.classList.add("minimized");
            this.style.position = "revert";
        },
        onUnMinimize() {
            const pvt = this.$.#pvt;
            let titleArea = pvt.shadowRoot.querySelector("#titleArea");
            let buttonArea = pvt.shadowRoot.querySelector("div.buttons");
            let body = pvt.shadowRoot.querySelector("div.body");
            titleArea.removeEventListener("dblclick", pvt.onUnMinimize);
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

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            dragstart: pvt.onDragStart,
            drag: pvt.onDragging,
            dragend: pvt.onDragEnd,
            //dragover: pvt.onDragOver,
            titleChange: pvt.onTitleChange,
            mousedown: pvt.onWindowClick
        });
    }

    get noMinimize() { this.hasAttribute("nominimize"); }
    set noMinimize(v) { this.$.#pvt.setBoolAttribute("nominimize", v); }

    get noMaximize() { this.hasAttribute("nomaximize"); }
    set noMaximize(v) { this.$.#pvt.setBoolAttribute("nomaximize", v); }

    get noClose() { this.hasAttribute("noclose"); }
    set noClose(v) { this.$.#pvt.setBoolAttribute("noclose", v); }

    get title() {
        const pvt = this.$.#pvt;
        let titleLabel = pvt.shadowRoot.querySelector("#title");
        return titleLabel?.innerText;
    }
    set title(v) {
        const pvt = this.$.#pvt;
        let titleLabel = pvt.shadowRoot.querySelector("#title");
        if (titleLabel) {
            titleLabel.innerText = v;
        }
    }

    get maximized() {
        let tiled = this.shadowRoot.querySelector("#tiled");
        return !tiled.classList.contains("hidden");
    }

    get browser() {
        return this.$.#pvt.getShadowChild("iframe");
    }

    get document() {
        return this.$.browser.contentDocument;
    }

    get context() {
        return this.$.browser.contentWindow;
    }
}
