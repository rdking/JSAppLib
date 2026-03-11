import { share, saveSelf, accessor } from "../node_modules/cfprotected/index.mjs";
import ActionControlBase from "./jsActionControlBase.mjs";
import Action from "./jsAction.mjs";
import CSS from "./util/Selectors.mjs";

export default class MenuItem extends ActionControlBase {
    static #spvt = share(this, {});

    static {
        const spvt = this.#spvt;
        spvt.initAttributeProperties(this, {
            separator: { isBool: true, readonly: true, caption: "separator" },
            highlighted: { isBool: true, caption: "highlighted" },
            parentmenu: { readonly: true, caption: "parentMenu" }
        });
        spvt.register(this);
    }
    static get observedAttributes() {
        return ActionControlBase.observedAttributes
            .concat([ "highlighted", "parentmenu", "separator" ]); 
    }

    /**
     * @inheritdoc
     */
    static getDefaultStyleSheet() {
        return [
            [
                [[CSS.HOST], {
                    display: "flex",
                    flex: "0 0 auto",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "2px 7px"
                }],
                [[CSS.HOST_CONTEXT(CSS.TAG("js-popupmenu"))], {
                    flex: "2 0 auto"
                }],
                [[CSS.CLASS("hidden")], {
                    visibility: "hidden"
                }],
                [[CSS.CLASS("iconcol").CLASS("hidden")], {
                    display: "none",
                    visibility: "inherit"
                }],
                [[CSS.CLASS("itemgrid")], {
                    display: "flex",
                    flex: "1",
                    flexWrap: "nowrap"
                }],
                [[CSS.ID("check")], {
                    display: "flex",
                    flex: "0 0 10px",
                    justifyContent: "flex-start",
                    width: "10px"
                }],
                [[CSS.CLASS("iconcol")], {
                    display: "flex",
                    flex: "0 0 20px",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "2px"
                }],
                [[CSS.ID("icon")], {
                    width: "18px",
                    height: "18px"
                }],
                [[CSS.CLASS("captioncol")], {
                    display: "flex",
                    flex: "0 1 auto",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingRight: "16px",
                    whiteSpace: "nowrap"
                }],
                [[CSS.CLASS("endblock")], {
                    display: "flex",
                    flex: "1 1 auto",
                    justifyContent: "end"
                }],
                [[CSS.CLASS("hotkeycol")], {
                    display: "flex",
                    flex: "0 0 auto",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }],
                [[CSS.CLASS("markcol")], {
                    display: "flex",
                    flex: "0 0 10px",
                    justifyContent: "end",
                    margin: "0px 4px",
                    width: "10px"
                }],
                [[CSS.TAG("hr")], {
                    width: "100%",
                    margin: "2px 0"
                }]
            ],
            [
                [[CSS.HOST], {
                    backgroundColor: "transparent",
                    color: "var(--pen-normal)"
                }],
                [[CSS.HOST(CSS.HOVER.NOT(CSS.ATTR("disabled")).NOT(CSS.ATTR("separator"))), 
                  CSS.HOST(CSS.ATTR("highlighted").NOT(CSS.ATTR("disabled")).NOT(CSS.ATTR("separator")))], {
                    backgroundColor: "var(--brush-selected)",
                    color: "var(--pen-selected)"
                }],
                [[CSS.HOST(CSS.ATTR("disabled"))], {
                    filter: "opacity(33%)"
                }]
            ]
        ];
    }

    #hasPopup() {
        let count = this.childElementCount;
        if ((count > 1) || ((count === 1) &&
            (this.firstElementChild.nodeName.toLowerCase() !== this.$.#pvt.tagType("popupmenu")))) {
            throw SyntaxError("Menu items are allowed only a single, optional popup menu.");
        }

        return !!count;
    }

    #showPopup() {
        if (this.$.#hasPopup()) {
            let popup = this.firstElementChild;
            if (!popup.isShowing) {
                const pvt = this.$.#pvt;
                const bounds = pvt.getBounds(this);
                let gpType = this.parentElement.nodeName.toLowerCase();
                let left = bounds.left;
                let top = bounds.top;

                if (gpType == pvt.tagType("menu")) {
                    top += bounds.height;
                }
                else {
                    // For nested items, calculate position relative to the parent popup.
                    const parentPopupBounds = pvt.getBounds(this.parentElement);
                    top -= parentPopupBounds.top;
                    left = bounds.width;
                }
                popup.show(left, top);
                this.highlighted = true;
            }
        }
    }

    #hidePopup() {
        if (this.$.#hasPopup()) {
            let popup = this.firstElementChild;
            if (popup.isShowing) {
                let menuItem = popup.currentMenuItem;
                popup.hide();
                this.highlighted = false;

                if (menuItem) {
                    menuItem.$.#hidePopup();
                }
            }
        }
    }

    #makeHtmlCaption() {
        let retval = "";
        let match = this.caption ? this.caption.match(/_(\w)/) : null;
        if (match && (match.length > 0)) {
            let key = match[1];
            retval = this.caption.replace(`_${key}`, `<u>${key}</u>`);
        }
        else {
            retval = this.caption;
        }

        return retval;
    }

    #pvt = share(this, MenuItem, {
        render() {
            const pvt = this.$.#pvt;
            const parentType = this.parentElement.nodeName.toLowerCase();
            const isPopupMenu = parentType == pvt.tagType("popupmenu");
            
            if (!this.$.#pvt.tagTypes(["menu","menuitem","popupmenu"]).includes(parentType)) {
                throw new SyntaxError("Menu items cannot exist outside of a menu or popup menu.");
            }
            
            pvt.renderContent(this.separator
                ? [ pvt.make("hr") ]
                : [ pvt.make("div", {
                        class: "itemgrid"
                    }, {
                        children: [
                            !isPopupMenu ? null : pvt.make("div", {
                                id: "check",
                                class: (this.toggle && this.highlighted) ? "" : "hidden"
                            }, {
                                innerHTML: "&check;"
                            }),
                            !isPopupMenu ? null : pvt.make("div", {
                                class: "iconcol" + (this.parentElement.hasAttribute("showIcons") ? "" : " hidden")
                            }, {
                                children: [
                                    pvt.make("img", {
                                        id: "icon",
                                        draggable: false,
                                        class: "icon" + (this.icon ? "" : " hidden"),
                                        src: this.icon || ""
                                    })
                                ]
                            }),
                            pvt.make("div", {
                                class: isPopupMenu ? "captioncol" : ""
                            }, {
                                children: [
                                    pvt.make("label", {
                                        id: "caption",
                                        class: isPopupMenu ? "caption" : ""
                                    }, {
                                        innerHTML: this.$.#makeHtmlCaption(),
                                    })        
                                ]
                            }),
                            pvt.make("div", {
                                class: "endblock"
                            }, {
                                children: [
                                    pvt.make("div", {
                                        class: "hotkeycol"
                                    }, {
                                        children: [
                                            !isPopupMenu ? null : pvt.make("span", {
                                                id: "hotkey"
                                            },{
                                                innerHTML: this.$.#hasPopup() ? "" : (Action.validateHotKey(this.hotkey) || "")
                                            })
                                        ]
                                    }),
                                    pvt.make("div", {
                                        class: isPopupMenu ? "markcol" : "",
                                    }, {
                                        innerHTML: isPopupMenu && this.$.#hasPopup() ? "&rtrif;" : ""
                                    })
                                ]
                            })
                        ]
                    }),
                    pvt.make("slot")
                ]
            );
        },
        onPreRender() {
            this.$.#pvt.validateParent(this.$.#pvt.tagTypes(["menu","popupmenu"]), "MenuItems can only be placed in a Menu.");
            this.$.#pvt.validateChildren(this.$.#pvt.tagType("popupmenu"), "Only PopupMenus can be placed in a MenuItem.");
        },
        onCaptionChanged() {
            let caption = this.$.#pvt.shadowRoot.querySelector("#caption");
            if (caption)
                caption.innerHTML = this.$.#makeHtmlCaption();
        },
        onIconChanged() {
            let icon = this.$.#pvt.shadowRoot.querySelector("#icon");
            if (icon) {
                icon.src = this.icon;
                icon.classList[this.icon ? "remove": "add"]("hidden");
            }
        },
        onHotkeyChanged() {
            let hotkey = this.$.#pvt.shadowRoot.querySelector("#hotkey");
            if (hotkey)
                hotkey.innerHTML = this.hotkey;
        },
        onSelectedChanged() {
            let check = this.$.#pvt.shadowRoot.querySelector("#check");
            if (check)
                check.classList[this.selected?"remove":"add"]("hidden");
        },
        onHighlightedChanged() {
            if (this.$.#hasPopup()) {
                let popup = this.firstElementChild;
                if (this.parentElement.menuOpen) {
                    this.highlighted
                        ? this.$.#showPopup()
                        : this.$.#hidePopup();
                }
                else if (popup.isShowing) {
                    this.$.#hidePopup();
                }
            }
        },
        onShowIconsChanged(e) {
            let iconbox = this.$.#pvt.shadowRoot.querySelector(".iconcol");
            if (iconbox) {
                iconbox.classList[this.parentElement.showIcons ? "remove": "add"]("hidden");
            }
            if (this.childElementCount > 0) {
                this.firstElementChild.fireEvent("showiconsChanged");
            }
        },
        onClicked(e) {
            if (e.target === e.currentTarget) {
                if (this.separator) {
                    e.cancelBubble = true;
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
                else {
                    this.parentElement.fireEvent("itemClicked", { item: this });
                    if (!this.highlighted) {
                        JSAppLib.app?.menu?.fireEvent("closeMenu");
                    }
                }
            }
        },
        onMouseEntered(e) {
            this.parentElement.fireEvent("itemHovered", { item: this });
        },
        onMouseLeft(e) {
            this.parentElement.fireEvent("itemLeft", { item: this, relatedTarget: e.relatedTarget });
        }
    });

    constructor() {
        super();

        const pvt = this.$.#pvt;
        pvt.registerEvents(pvt, {
            captionChanged: "onCaptionChanged",
            iconChanged: "onIconChanged",
            hotkeyChanged: "onHotkeyChanged",
            highlightedChanged: "onHighlightedChanged",
            showiconsChanged: "onShowIconsChanged",
            mouseenter: "onMouseEntered",
            mouseleave: "onMouseLeft",
            click: "onClicked"
        });
    }

    get hasPopup() { return this.$.#hasPopup(); }

    get isShowingPopup() {
        let popup = this.firstElementChild;
        return !!(popup && popup.isShowing);
    }
}
