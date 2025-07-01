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

    #oldHeight = null;
    #dragOffsets = null;
    #oldStatus = null;
    #resizing = false;

    #withEdges(fn) {
        const pvt = this.$.#pvt;
        let edges = [
            pvt.getShadowChildren(`div[slot=first].nwsearrow`),
            [pvt.getShadowChild(`div[slot=first].nsarrow`)],
            pvt.getShadowChildren(`div[slot=first].neswarrow`),
            [pvt.getShadowChild(`div[slot=first].ewarrow`)],
            [pvt.getShadowChild(`div[slot=last].ewarrow`)],
            pvt.getShadowChildren(`div[slot=last].neswarrow`),
            [pvt.getShadowChild(`div[slot=last].nsarrow`)],
            pvt.getShadowChildren(`div[slot=last].nwsearrow`),
        ];

        for (let edge of edges) {
            for (let part of edge) {
                fn(part);
            }
        }
    }

    #disableEdges() {
        this.$.#withEdges(part => {
            part.style.cursor = "default";
            part.style.pointerEvents = "none";
        });
    }

    #enableEdges() {
        this.$.#withEdges(part => {
            part.style.cursor = "";
            part.style.pointerEvents = "";
        });
    }

    #pvt = share(this, MDIWindow, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent([
                pvt.make(pvt.tagType("scspanel"), {}, {
                    children: [
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecorner nwsearrow",
                            "data-edge": "0"
                        }),
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecenter nsarrow",
                            "data-edge": "1"
                        }),
                        pvt.make("div", {
                            slot: "first",
                            class: "edgecorner neswarrow",
                            "data-edge": "2"
                        }),
                        pvt.make(pvt.tagType("scspanel"), {
                            horizontal: ""
                        }, {
                            children: [
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecorner neswarrow",
                                    "data-edge": "5"
                                }),
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecenter ewarrow",
                                    "data-edge": "3"
                                }),
                                pvt.make("div", {
                                    slot: "first",
                                    class: "edgecorner nwsearrow",
                                    "data-edge": "0"
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
                                    class: "edgecorner neswarrow",
                                    "data-edge": "2"
                                }),
                                pvt.make("div", {
                                    slot: "last",
                                    class: "edgecenter ewarrow",
                                    "data-edge": "4"
                                }),
                                pvt.make("div", {
                                    slot: "last",
                                    class: "edgecorner nwsearrow",
                                    "data-edge": "7"
                                })
                            ]
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecorner neswarrow",
                            "data-edge": "5"
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecenter nsarrow",
                            "data-edge": "6"
                        }),
                        pvt.make("div", {
                            slot: "last",
                            class: "edgecorner nwsearrow",
                            "data-edge": "7"
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

            this.$.#withEdges(part => {
                part.addEventListener("mousedown", pvt.onResizeStart);
                part.addEventListener("mousemove", pvt.onResize);
                part.addEventListener("mouseup", pvt.onResizeEnd);
            });
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
            const status = document.querySelector("js-statusbar");

            this.$.#dragOffsets = { 
                offsetX: e.offsetX,
                offsetY: e.offsetY
            };
            this.parentElement.fireEvent("startDrag", this);

            this.classList.add("dragging");
            e.dataTransfer.setData("text/plain", e.target.id);
            this.style.opacity="0.1";

            if (status) {
                this.$.#oldStatus = status.status;
            }
        },
        onDragging(e) {
            const status = document.querySelector("js-statusbar");
            const deltas = this.$.#dragOffsets;
            let left = e.pageX - this.$.appLeft - deltas.offsetX;
            let top = e.pageY - this.$.appTop - deltas.offsetY;
            this.style.display="none";

            left = (left < 0) ? 0 : left;
            top = (top < 0) ? 0 : top;

            this.style.left = `${left}px`;
            this.style.top = `${top}px`;

            if (status) {
                status.status = `deltas: {${deltas.offsetX}, ${deltas.offsetY}}, page: {${e.pageX-this.$.appLeft}, ${e.pageY-this.$.appTop}}`;
            }
        },
        onDragEnd(e) {
            this.style.pointerEvents = "";
            this.classList.remove("dragging");
            this.style.opacity = '';
            this.style.display="";
            this.parentElement.fireEvent("endDrag", this);

            e.preventDefault();

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
            this.$.#disableEdges();
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
            this.$.#enableEdges();
        },
        onMaximizeClick(e) {
            const pvt = this.$.#pvt;
            e.srcElement.classList.add("hidden");
            e.srcElement.nextElementSibling.classList.remove("hidden");
            this.classList.add("maximized");
            this.$.#oldHeight = this.style.height;
            this.style.height = '';
            this.$.#disableEdges();
        },
        onTiledClick(e) {
            const pvt = this.$.#pvt;
            e.srcElement.classList.add("hidden");
            e.srcElement.previousElementSibling.classList.remove("hidden");
            this.classList.remove("maximized");
            this.style.height = this.$.#oldHeight;
            this.$.#enableEdges();
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
        },
        onResizeStart(e) {
            if (e.buttons == 1) {
                console.log("Beginning resizing...");
                this.$.#resizing = {
                    x: e.screenX,
                    y: e.screenY,
                    edge: parseInt(e.target.getAttribute("data-edge")),
                    left: parseFloat(this.style.left),
                    top: parseFloat(this.style.top),
                    width: parseFloat(this.style.width),
                    height: parseFloat(this.style.height)
                };

                this.addEventListener("mousemove", this.$.#pvt.onResize);
                window.addEventListener("mousemove", this.$.#pvt.onResize);
                window.addEventListener("mouseup", this.$.#pvt.onResizeEnd);
                this.parentElement.fireEvent("startDrag");
            }
        },
        onResize(e) {
            let sz = this.$.#resizing;

            if (sz) {
                console.log("Still resizing...");
                let delta = {
                    x: e.screenX - sz.x,
                    y: e.screenY - sz.y
                };

                if (sz.edge < 3) {
                    this.style.top = `${sz.top + delta.y}px`;
                    this.style.height = `${sz.height - delta.y}px`;
                }

                if (sz.edge > 4) {
                    this.style.height = `${sz.height + delta.y}px`;
                }

                if ([0, 3, 5].includes(sz.edge)) {
                    this.style.left = `${sz.left + delta.x}px`;
                    this.style.width = `${sz.width - delta.x}px`;
                }

                if ([2, 4, 7].includes(sz.edge)) {
                    this.style.width = `${sz.width + delta.x}px`;
                }
            }
        },
        onResizeEnd(e) {
            console.log("Ending resizing...");
            this.$.#resizing = false;
            this.parentElement.fireEvent("endDrag");
            window.removeEventListener("mouseup", this.$.#pvt.onResizeEnd);
            window.removeEventListener("mousemove", this.$.#pvt.onResize);
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents({
            dragstart: pvt.onDragStart,
            drag: pvt.onDragging,
            dragend: pvt.onDragEnd,
            drop: pvt.onDrop,
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
