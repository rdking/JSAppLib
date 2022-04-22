import { share, abstract } from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";

const FocusableTag = abstract(class FocusableTag extends TagBase {
    #prot = share(this, FocusableTag, {
        renderContent(content) {
            const prot = this.pvt.#prot;
            let wrapper = prot.newTag("div", {tabIndex: 0});
            prot.$uper.renderContent(content, wrapper);
            prot.$uper.renderContent(wrapper);
        }
    });

    constructor() {
        super({delegatesFocus: true})
    }
});

export default FocusableTag;