import { share, saveSelf } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

export default class TabSet extends TagBase {
    static #tagName = "js-tabset";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return TagBase.observedAttributes.concat(["status"]);
    }

    #currentTab = null;
    #tabOffsets = [];

    #buildOffsets() {
        let tabs = this.shadowRoot.querySelector("#tabs"); 
        let tab = tabs.firstElementChild;
        let pRect = tabs.getBoundingClientRect();

        while (tab !== null) {
            let rect = tab.getBoundingClientRect();
            this.pvt.#tabOffsets.push(~~pRect.left - ~~rect.left);
            tab = tab.nextElementSibling;
        }
    }

    #prot = share(this, TabSet, {
        render() {
            const prot = this.pvt.#prot;
            prot.renderContent([
                prot.newTag("div", {
                    id: "tabRow",
                    class: "tabrow"
                }, {
                    children: [
                        prot.newTag("div", {
                            class: "tabstart"
                        }, {
                            children: [
                                prot.newTag("button", {
                                    id: "prev",
                                    class: "tabnav",
                                    disabled: ""
                                }, {
                                    innerHTML: "&#x25C4"
                                }),
                                prot.newTag("div", {
                                    id: "tabscroll",
                                    class: "tabslider"
                                }, {
                                    children: [
                                        prot.newTag("div", {
                                            class: "stub tab"
                                        }, {
                                            children: [
                                                prot.newTag("img"),
                                                prot.newTag("span", null, {
                                                    innerHTML: "&nbsp;"
                                                }),
                                                prot.newTag("button", {
                                                    class: "roundButton"
                                                }, {
                                                    innerText: "×"
                                                })
                                            ]
                                        }),
                                        prot.newTag("div", {
                                            id: "tabs"
                                        })
                                    ]
                                })
                            ]
                        }),
                        prot.newTag("div", {
                            class: "tabend"
                        }, {
                            children: [
                                prot.newTag("button", {
                                    id: "next",
                                    class: "tabnav"
                                }, {
                                    innerHTML: "&#x25BA"
                                }),
                                prot.newTag("button", {
                                    id: "list",
                                    class: "tabnav"
                                }, {
                                    innerHTML: "&#x2026"
                                })
                            ]
                        })
                    ]
                }),
                prot.newTag("slot", {
                    class: "container"
                })
            ]);
        }, 
        onPostRender() {
            const prot = this.pvt.#prot;
            prot.validateChildren("js-tab", "Only Tabs can be added to TabSets.");
            let tabDiv = this.shadowRoot.querySelector("#tabs");
            tabDiv.innerHTML = "";

            let prev = this.shadowRoot.querySelector("#prev");
            let tabScroll = this.shadowRoot.querySelector("#tabscroll");
            let next = this.shadowRoot.querySelector("#next");
            let list = this.shadowRoot.querySelector("#list");
            prev.addEventListener("click", prot.onPrevClicked.bind(this));
            tabScroll.addEventListener("wheel", prot.onMouseWheelScrolled.bind(this));
            next.addEventListener("click", prot.onNextClicked.bind(this));
            list.addEventListener("click", prot.onListClicked.bind(this));

            for (let node of this.children) {
                let div = prot.newTag("div", {class: "tab"}, {page: node});
                let image = prot.newTag("img");
                let label = prot.newTag("span", {}, {innerText: node.getAttribute("caption")});
                let button = prot.newTag("button", {class: "roundButton"}, {innerText: "×"});
                
                node.tab = div;
                tabDiv.appendChild(div);
                div.appendChild(image);
                div.appendChild(label);
                div.appendChild(button);
                
                div.addEventListener("click", prot.onTabClicked.bind(this));
                button.addEventListener("click", prot.onButtonClicked.bind(this));

                if (node.hasAttribute("selected")) {
                    this.pvt.#currentTab = node;
                    div.classList.add("selected");
                }
                
                if (node.hasAttribute("iconsrc")) {
                    let iconSrc = node.getAttribute("iconsrc");
                    if (iconSrc.length) {
                        image.src = iconSrc;
                    }
                }
                
                if (!this.closeable) {
                    button.classList.add("hidden");
                }
            }

            prot.onResize();
        },
        onTabChange(e) {
            if (this.pvt.#currentTab && (this.pvt.#currentTab !== e.detail.newVal)) {
                this.pvt.#currentTab.selected = false;
                this.pvt.#currentTab.tab.classList.remove("selected");
            }
            this.pvt.#currentTab = e.detail.newVal;
            this.pvt.#currentTab.tab.classList.add("selected");
        },
        onResize() {
            let shadow = this.shadowRoot;
            if (shadow.innerHTML.length !== 0) {
                let tabDiv = shadow.querySelector("#tabs");
                let tabScroll = shadow.querySelector("#tabscroll");
                let prev = shadow.querySelector("#prev");
                let next = shadow.querySelector("#next");
                let list = shadow.querySelector("#list");
                let tabDelta = tabScroll.clientWidth - tabDiv.clientWidth;

                if (tabDelta >= 0) {
                    prev.setAttribute("disabled", "");
                    next.setAttribute("disabled", "");
                    list.setAttribute("disabled", "");
                }
                else {
                    if (tabDiv.offsetLeft > tabDelta) {
                        next.removeAttribute("disabled");
                    }
                    if (tabDiv.offsetLeft < 0) {
                        prev.removeAttribute("disabled");
                    }
                    list.removeAttribute("disabled");
                }
            }
        },
        onCloseableChange(e) {
            let status = this.shadowRoot.querySelector("span.status");
            if (status) {
                status.innerHTML = e.detail.newVal;
            }
        },
        onTabClicked(e) {
            e.currentTarget.page.selected = true;
        },
        onButtonClicked(e) {
            if ((!e.detail.cancelClose) && (e.target === e.currentTarget)) {
                let tab = e.currentTarget.parentElement;
                if (tab.page.close()) {
                    tab.parentElement.removeChild(tab);
                }
                e.cancelBubble = true;
            }
        },
        onPrevClicked(e) {
            let tabs = this.shadowRoot.querySelector("#tabs");
            let prev = this.shadowRoot.querySelector("#prev");
            let tabScroll = this.shadowRoot.querySelector("#tabscroll");
            let next = this.shadowRoot.querySelector("#next");
            let list = this.shadowRoot.querySelector("#list");
            let rect = tabs.getBoundingClientRect();
            let pRect = tabScroll.getBoundingClientRect();
            let left = ~~rect.left - ~~pRect.left;
            let scrollWidth = ~~(pRect.width - rect.width);

            if (!this.pvt.#tabOffsets.length)
                this.pvt.#buildOffsets();

            let offsets = this.pvt.#tabOffsets.slice().reverse();

            for (let offset of offsets) {
                if (offset > left) {
                    tabs.style.left = offset + "px";
                    next.removeAttribute("disabled");
                    list.removeAttribute("disabled");
                    if (offset === 0) {
                        prev.setAttribute("disabled", "");
                    }
                    else {
                        prev.removeAttribute("disabled");
                    }
                    break;
                }
            }
        },
        onMouseWheelScrolled(e) {
            let tabs = this.shadowRoot.querySelector("#tabs");
            let prev = this.shadowRoot.querySelector("#prev");
            let next = this.shadowRoot.querySelector("#next");
            let list = this.shadowRoot.querySelector("#list");
            let rect = tabs.getBoundingClientRect();
            let pRect = tabs.parentElement.getBoundingClientRect();
            let left = ~~(rect.left - pRect.left - e.deltaY);
            let scrollWidth = ~~(pRect.width - rect.width);
            let unit;

            switch(e.deltaMode) {
                case 0:
                    unit = "px";
                    break;
                case 1:
                    unit = "em";
                    break;
                case 2:
                    unit = "vh";
                    break;
            }

            if (scrollWidth >= 0) {
                prev.style.display = "none";
                next.style.display = "none";
                list.style.display = "none";
            }
            else {
                prev.removeAttribute("disabled");
                next.removeAttribute("disabled");
                list.removeAttribute("disabled");

                if (left > -32) {
                    left = 0;
                    prev.setAttribute("disabled", "");
                }
                if (left < scrollWidth + 32) {
                    left = scrollWidth;
                    next.setAttribute("disabled", "");
                    list.setAttribute("disabled", "");
                }
            }
            tabs.style.left = `${left}${unit}`;
        },
        onNextClicked(e) {
            let tabs = this.shadowRoot.querySelector("#tabs");
            let prev = this.shadowRoot.querySelector("#prev");
            let tabScroll = this.shadowRoot.querySelector("#tabscroll");
            let next = this.shadowRoot.querySelector("#next");
            let list = this.shadowRoot.querySelector("#list");
            let rect = tabs.getBoundingClientRect();
            let pRect = tabScroll.getBoundingClientRect();
            let left = ~~(rect.left - pRect.left);
            let scrollWidth = ~~(pRect.width - rect.width);

            if (!this.pvt.#tabOffsets.length)
                this.pvt.#buildOffsets();

            let offsets = this.pvt.#tabOffsets.slice();
            offsets.push(scrollWidth);

            for (let offset of offsets) {
                if (offset < left) {
                    tabs.style.left = offset + "px";
                    prev.removeAttribute("disabled");
                    if (offset <= scrollWidth) {
                        tabs.style.left = scrollWidth + "px";
                        next.setAttribute("disabled", "");
                        list.setAttribute("disabled", "");
                    }
                    else {
                        next.removeAttribute("disabled");
                        list.removeAttribute("disabled");
                    }
                    break;
                }
            }
        },
        onListClicked(e) {
            if (e.target === e.currentTarget) {
                let tabList = this.querySelectorAll("tab");
                let popup = document.createElement("js-popupmenu");
                tabList.forEach(tab => {
                    let item = document.createElement("js-menuitem");
                    item.iconSrc = tab.iconSrc;
                    item.caption = tab.caption;
                    popup.appendChild(item);
                });
                e.cancelBubble = true;
            }
        }
    });

    connectedCallback() {
        this.addEventListener("closeableChange", this.pvt.#prot.onCloseableChange);
        this.addEventListener("postRender", this.pvt.#prot.onPostRender);
        this.addEventListener("tabChange", this.pvt.#prot.onTabChange);
        window.addEventListener("resize", this.pvt.#prot.onResize);
        super.connectedCallback();
    }

    get closeable() { return this.hasAttribute("closeable"); }
    set closeable(v) { this.pvt.#prot.setBoolAttribute("closeable", v); }
    
    get showpages() { return this.hasAttribute("showpages"); }
    set showpages(v) { this.pvt.#prot.setBoolAttribute("showpages", v); }
}
