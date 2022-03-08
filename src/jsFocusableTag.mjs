import { share, abstract } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

const FocusableTag = abstract(class FocusableTag extends TagBase {
    #prot = share(this, FocusableTag, {
        renderContent(content) {
            let wrapper = this.pvt.#prot.newTag("div", {tabIndex: 0});
            this.pvt.#prot.$uper.renderContent(content, wrapper);
            this.pvt.#prot.$uper.renderContent(wrapper);
        }
    });

    constructor() {
        super({delegatesFocus: true})
    }
});

export default FocusableTag;