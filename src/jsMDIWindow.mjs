import { share, saveSelf } from "../../cfprotected/index.mjs";
import ControlBase from "./jsControlBase.mjs";

export default class MDIWindow extends ControlBase {
    static #spvt = share(this, {});

    static get observedAttributes() {
        return ControlBase.observedAttributes.concat([
            "maximize", "minimize", "nomaximize", "nominimize", "noclose", "uri", "title"
        ]);
    }

    static { 
        saveSelf(this, "$");

        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            maximize: { isBool: true, caption: "maximized",
                getter: function getMaximized() {
                    let tiled = this.$.#pvt.shadowRoot.querySelector("#tiled");
                    return !tiled.classList.contains("hidden");
                },
                setter: function setMaximized(v) {
                    const pvt = this.$.#pvt;
                    if (v) {
                        pvt.onMaximizeClick();
                    } else {
                        pvt.onTiledClick();
                    }
                }
            },
            minimize: { isBool: true, caption: "minimized",
                getter: function getMinimized() {
                    return this.slot == "minArea";
                },
                setter: function setMinimized(v) {
                    const pvt = this.$.#pvt;
                    if (v) {
                        pvt.onMinimizeClick();
                    } else {
                        pvt.onUnMinimize();
                    }
                }
            },
            nomaximize: { isBool: true, readonly: true, caption: "noMaximize" },
            nominimize: { isBool: true, readonly: true, caption: "noMinimize" },
            noclose: { isBool: true, readonly: true, caption: "noClose" },
            uri: {},
            title: {}
        });
        this.#spvt.register(this);
    }

    #oldHeight = null;
    #dragOffsets = null;
    #oldStatus = null;
    #deltas = false;

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
        validateUri(uri) {
            let retval = ""

            if ((typeof(uri) == "string") && (uri.length > 0)) {
                try {
                    const url = new URL(uri, window.location.href);
                    
                    if (['http:', 'https:'].includes(url.protocol)) {
                        if (url.origin === window.location.origin)
                            retval = url.href;
                    } else if (window.location.protocol === 'file:') {
                        if (url.protocol === 'file:')
                            retval = url.href;
                    } else if (url.origin === window.location.origin) {
                        retval = url.href;
                    } else {
                        console.warn(`Blocked loading ${uri}.`);
                    }
                } catch (e) {}
            }

            return retval;
        },
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
                                                        pvt.make("iframe", {
                                                            sandbox: "allow-scripts allow-modals allow-popups allow-forms allow-same-origin",
                                                            src: pvt.validateUri(this.uri)
                                                        })
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
            let titleArea = pvt.shadowRoot.querySelector("div#titleArea");
            let minimize = pvt.shadowRoot.querySelector("#minimize");
            let maximize = pvt.shadowRoot.querySelector("#maximize");
            let tiled = pvt.shadowRoot.querySelector("#tiled");
            let close = pvt.shadowRoot.querySelector("#close");

            titleArea.addEventListener("dblclick", pvt.onDoubleTitleClick);
            titleArea.addEventListener("mousedown", pvt.onStartMoving);
            titleArea.addEventListener("mousemove", pvt.onMoving);
            titleArea.addEventListener("mouseup", pvt.onEndMoving);
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
            const pvt = this.$.#pvt;
            let titleLabel = pvt.shadowRoot.querySelector("#title");
            if (titleLabel) {
                titleLabel.innerText = e.detail.newValue;
            }
        },
        onStartMoving(e) {
            const pvt = this.$.#pvt;

            if (!this.maximized && !this.minimized) {
                if ((e.detail != 2) && (e.buttons == 1)) {
                    console.log("Beginning moving...");
                    this.$.#deltas = {
                        type: "moving",
                        x: e.screenX,
                        y: e.screenY,
                        edge: parseInt(e.target.getAttribute("data-edge")),
                        left: parseFloat(this.style.left),
                        top: parseFloat(this.style.top),
                        width: parseFloat(this.style.width),
                        height: parseFloat(this.style.height)
                    };

                    window.addEventListener("mousemove", pvt.onMoving);
                    window.addEventListener("mouseup", pvt.onEndMoving);
                    this.parentElement.fireEvent("startDrag", this);
                }
            }
        },
        onMoving(e) {
            if (!this.maximized && !this.minimized) {
                let sz = this.$.#deltas;
                
                if (sz.type == "moving") {
                    console.log("Still moving...");
                    let delta = {
                        x: e.screenX - sz.x,
                        y: e.screenY - sz.y
                    };
                    
                    this.style.top = `${Math.max(0, (sz.top || 0) + delta.y)}px`;
                    this.style.left = `${Math.max(0, (sz.left || 0) + delta.x)}px`;
                }
            }
        },
        onEndMoving(e) {
            const pvt = this.$.#pvt;

            if (!this.maximized && !this.minimized) {
                let sz = this.$.#deltas;
                
                if (sz.type == "moving") {
                    console.log("Ending moving...");
                    this.$.#deltas = false;
                    this.parentElement.fireEvent("endDrag", this);
                    window.removeEventListener("mouseup", pvt.onEndMoving);
                    window.removeEventListener("mousemove", pvt.onMoving);
                }
            }
        },
        onMinimizeClick() {
            const pvt = this.$.#pvt;
            let titleArea = pvt.shadowRoot.querySelector("#titleArea");
            let buttonArea = pvt.shadowRoot.querySelector("div.buttons");
            let body = pvt.shadowRoot.querySelector("div.body");
            
            this.$.#oldStatus = {
                top: this.style.top,
                left: this.style.left,
                width: this.style.width,
                height: this.style.height
            };
            this.style.top = "";
            this.style.left = "";
            this.style.width = "";
            this.style.height = "";

            this.slot = "minArea";
            buttonArea.classList.add("hidden");
            body.classList.add("hidden");
            titleArea.addEventListener("dblclick", pvt.onUnMinimize);
            this.classList.add("minimized");
            this.style.position = "";
            this.$.#disableEdges();
            this.$.setAttribute("minimized", "");
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

            if (this.$.#oldStatus) {
                this.style.top = this.$.#oldStatus.top;
                this.style.left = this.$.#oldStatus.left;
                this.style.width = this.$.#oldStatus.width;
                this.style.height = this.$.#oldStatus.height;
                this.$.#oldStatus = null;
            }

            this.$.#enableEdges();
            this.$.removeAttribute("minimized");
        },
        onMaximizeClick(e) {
            const pvt = this.$.#pvt;
            const maximize = pvt.shadowRoot.querySelector("#maximize");
            const tiled = pvt.shadowRoot.querySelector("#tiled");
            maximize.classList.add("hidden");
            tiled.classList.remove("hidden");
            this.classList.add("maximized");
            this.$.#oldHeight = this.style.height;
            this.style.height = '';
            this.$.#disableEdges();
            this.$.setAttribute("maximized", "");
        },
        onTiledClick(e) {
            const pvt = this.$.#pvt;
            const maximize = pvt.shadowRoot.querySelector("#maximize");
            const tiled = pvt.shadowRoot.querySelector("#tiled");
            tiled.classList.add("hidden");
            maximize.classList.remove("hidden");
            this.classList.remove("maximized");
            this.style.height = this.$.#oldHeight;
            this.$.#enableEdges();
            this.$.removeAttribute("maximized");
        },
        onCloseClick() {
            let response = { canClose: true };
            this.fireEvent("closing", response);
            
            if (response.canClose) {
                this.parentElement.removeChild(this);
            }
        },
        onDoubleTitleClick(e) {
            const pvt = this.$.#pvt;
            this.$.maximized ? pvt.onTiledClick(e) : pvt.onMaximizeClick(e);
        },
        onWindowClick(e) {
            this.focus();
        },
        onResizeStart(e) {
            if (e.buttons == 1) {
                console.log("Beginning resizing...");
                this.$.#deltas = {
                    type: "resizing",
                    x: e.screenX,
                    y: e.screenY,
                    edge: parseInt(e.target.getAttribute("data-edge")),
                    left: parseFloat(this.style.left),
                    top: parseFloat(this.style.top),
                    width: parseFloat(this.style.width),
                    height: parseFloat(this.style.height)
                };

                window.addEventListener("mousemove", this.$.#pvt.onResize);
                window.addEventListener("mouseup", this.$.#pvt.onResizeEnd);
                this.parentElement.fireEvent("startDrag");
            }
        },
        onResize(e) {
            let sz = this.$.#deltas;

            if (sz.type == "resizing") {
                console.log("Still resizing...");
                let delta = {
                    x: e.screenX - sz.x,
                    y: e.screenY - sz.y
                };

                if (sz.edge < 3) {
                    this.style.top = `${Math.max(0, (sz.top || 0) + delta.y)}px`;
                    this.style.height = `${Math.max(0, (sz.height || 0) - delta.y)}px`;
                }

                if (sz.edge > 4) {
                    this.style.height = `${Math.max(0, (sz.height || 0) + delta.y)}px`;
                }

                if ([0, 3, 5].includes(sz.edge)) {
                    this.style.left = `${Math.max(0, (sz.left || 0) + delta.x)}px`;
                    this.style.width = `${Math.max(0, (sz.width || 0) - delta.x)}px`;
                }

                if ([2, 4, 7].includes(sz.edge)) {
                    this.style.width = `${Math.max(0, (sz.width || 0) + delta.x)}px`;
                }
            }
        },
        onResizeEnd(e) {
            console.log("Ending resizing...");
            this.$.#deltas = false;
            this.parentElement.fireEvent("endDrag");
            window.removeEventListener("mouseup", this.$.#pvt.onResizeEnd);
            window.removeEventListener("mousemove", this.$.#pvt.onResize);
        },
        onUriChange(e) {
            const pvt = this.$.#pvt;
            const frame = pvt.shadowRoot.querySelector("iframe");
            if (frame) {
                frame.src = pvt.validateUri(this.uri);
            }
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            titleChanged: pvt.onTitleChange,
            mousedown: pvt.onWindowClick,
            uriChanged: pvt.onUriChange
        });
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

    focus() {
        this.parentElement.moveToTop(this);
    }
}
