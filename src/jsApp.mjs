import { share } from "../node_modules/cfprotected/index.mjs";
import Base from "./jsBase.mjs";
import AppLibError from "./errors/AppLibError.mjs";
import CSS from "./util/Selectors.mjs";

export default class App extends Base {
    static #spvt= share(this, {});

    static {
        this.#spvt.register(this);
    }
    
    /**
     * @summary Initializes the library by registering elements and global styles.
     */
    static ready() {
        const [struct, skin] = this.getGlobalStyleSheet();
        this.$.#spvt.themeCache.registerGlobal(struct, skin);
        this.$.#spvt.registerElements();
    }

    /**
     * @summary Returns the global default style configuration for the library.
     * @returns {Array<Array>} A tuple [[structure], [skin]] containing DSL rule arrays.
     */
    static getGlobalStyleSheet() {
        return [
            [],
            [
                /* Format of all color names
                * (pen|brush)(?:-(input|container))?-(normal|selected|disabled|error)
                *
                * pen          => foreground color
                * brush        => background color
                * -normal      => active state
                * -selected    => selected state
                * -disabled    => disabled state
                * -error       => error state
                * -input       => applied to all input components
                * -container   => applied to all container components
                * -default     => applied to a default action component
                *
                * Special cases
                */
                [[CSS.HOST], {
                    "--error": "#EE3749",
                    "--pen-normal": "black;",
                    "--pen-selected": "black;",
                    "--pen-disabled": "gray;",
                    "--pen-error": "gold;",
                    "--pen-input-normal": "black;",
                    "--pen-input-selected": "black;",
                    "--pen-input-disabled": "gray;",
                    "--pen-input-error": "gold;",
                    "--pen-container-normal": "black;",
                    "--pen-container-selected": "black;",
                    "--pen-container-disabled": "gray;",
                    "--pen-container-error": "gold;",

                    "--brush-normal": "#eee0ca;",
                    "--brush-selected": "#cea86c;",
                    "--brush-disabled": "#80786d;",
                    "--brush-error": "var(--error)",
                    "--brush-input-normal": "white;",
                    "--brush-input-selected": "#cea86c;",
                    "--brush-input-disabled": "#80786d;",
                    "--brush-input-error": "var(--error)",
                    "--brush-container-normal": "#eee0ca;",
                    "--brush-container-selected": "#cea86c;",
                    "--brush-container-disabled": "#80786d;",
                    "--brush-container-error": "var(--error)",

                    "--brush-shadow": "rgba(64, 64, 64, 0.25);",
                    "--brush-highlight": "rgba(255, 255, 255, 0.25);",
                    "--brush-overlay": "rgba(96, 96, 96, 0.5);",
                    "--border-shallow": "gray;",
                    "--border-deep": "black;"
                }],
                [[CSS.HOST.CLASS("light")], {
                    "--pen-normal": "#3f4963;",
                    "--pen-selected": "#f9f9f9;",
                    "--pen-disabled": "#9191a1;",
                    "--brush-normal": "#f9f9f9;",
                    "--brush-selected": "#af4f4e;",
                    "--brush-disabled": "#e0a068;"
                }],
                [[CSS.HOST.CLASS("dark")], {
                    "--pen-normal": "#f9f9f9;",
                    "--pen-selected": "#f9f9f9;",
                    "--pen-disabled": "#e0a068;",
                    "--brush-normal": "#3f4963;",
                    "--brush-selected": "#af4f4e;",
                    "--brush-disabled": "#9191a1;"
                }]
            ]
        ];
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        return [
            [
                [[CSS.HOST], {
                    display: "flex",
                    flexDirection: "column",
                    flex: "0 0 auto",
                    alignItems: "stretch",
                    position: "absolute",
                    left: "0",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    margin: "0",
                    cursor: "default",
                    userSelect: "none",
                    contain: "strict",
                    overflow: "clip"
                }],
                [[CSS.TAG("slot")], {
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 0 auto",
                    alignItems: "stretch",
                    contain: "strict",
                    overflow: "clip"
                }],
                [[CSS.TAG("div").ID("overlay")], {
                    position: "absolute",
                    inset: "0",
                    display: "none",
                    zIndex: "1000000"
                }],
                [[CSS.TAG("div").ID("overlay").CLASS("visible")], {
                    display: "flex"
                }],
                [[CSS.TAG("div")], {
                    display: "flex",
                    flex: "1 0 auto"
                }]
            ],
            [
                [[CSS.HOST], {
                    backgroundColor: "var(--brush-container-normal)",
                    color: "var(--pen-container-normal)"
                }]
            ]
        ];
    }

    #pvt= share(this, App, {
        render() {
            const pvt = this.$.#pvt;
            pvt.renderContent(pvt.make("div", {}, {
                children: [
                    pvt.make("div", { id: "overlay" }),
                    pvt.make("slot")
                ]
            }));
        }
    });
    
    #components = {};

    get components() {
        return this.#components;
    }

    #addProperty(e) {
        const name = e.detail;
        if (name && (name != this.id)) {
            Object.defineProperty(this.#components, name, {
                enumerable: true,
                configurable: true,
                get() { return document.getElementById(name); }
            });
        }
    }

    #removeProperty(e) {
        const name = e.detail;
        if (name in this.#components) {
            delete this.#components[name];
        }
    }

    constructor() {
        super();

        if ("JSAppLib" in window) {
            if ("app" in JSAppLib) {
                throw new AppLibError(`Only 1 App instance allowed per window.`);
            }
        }
        else {
            Object.defineProperty(window, "JSAppLib", {
                enumerable: false,
                configurable: false,
                writable: false,
                value: {}
            });
        }

        Object.defineProperty(JSAppLib, "app", {
            enumerable: true,
            configurable: false,
            writable: false,
            value: this
        });

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            addComponent: this.$.#addProperty,
            removeComponent: this.$.#removeProperty
        });
    }
 
    getManager(mgrName) {
        const pvt = this.$.#pvt;
        const mgmt = document.querySelector(pvt.tagType("management"));
        let retval;

        if (mgmt) {
            retval = mgmt.querySelector(pvt.tagType(mgrName));
        }

        return retval;
    }

    get menu() {
        return this.querySelector(this.$.#pvt.tagType("menu"));
    }

    get statusBar() {
        return this.querySelector(this.$.#pvt.tagType("statusbar"));
    }

    get themeManager() {
        return this.getManager("thememanager");
    }

    get actionManager() {
        return this.getManager("actionmanager");
    }

    get dialogManager() {
        return this.getManager("dialogmanager");
    }

    get dataFormatManager() {
        return this.getManager("dataformatmanager");
    }

    get overlayShowing() {
        return this.$.#pvt.shadowRoot.querySelector("#overlay").classList.contains("visible");
    }

    showOverlay(ui) {
        let overlay = this.$.#pvt.shadowRoot.querySelector("#overlay");
        if (!this.overlayShowing) {
            overlay.classList.add("visible");
        }
        overlay.appendChild(ui);
    }

    hideOverlay(ui) {
        const overlay = this.$.#pvt.shadowRoot.querySelector("#overlay");
        overlay.removeChild(ui);
        if (overlay.children.length === 0) {
            overlay.classList.remove("visible");
        }
    }
}
