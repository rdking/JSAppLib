import { share, final } from "/node_modules/cfprotected/index.mjs";
import MenuItem from "/node_modules/jsapplib/src/jsMenuItem.mjs";

let MenuSeparator = final(class MenuSeparator extends MenuItem {
    static #tagName = "js-menuseparator";
    static #sprot = share(this, {});

    static { this.#sprot.registerTag(this); }
    static get tagName() { return this.pvt.#tagName; }
    static get observedAttributes() {
        return MenuItem.observedAttributes.concat(["theme", "style", "classList"]); 
    }

    #prot = share(this, MenuSeparator, {
        render() {
            this.pvt.#prot.renderContent(`<hr/>`);
        },
        onClicked(e) {
            e.cancelBubble = true;
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    });
});

export default MenuSeparator;
