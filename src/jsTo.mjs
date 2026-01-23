import { share, final, accessor } from "../node_modules/cfprotected/index.mjs";
import DataHandlerBase from "./jsDataHandlerBase.mjs";

export default final(class To extends DataHandlerBase {
    static #spvt = share(this, {});

    static {
        this.#spvt.register(this);
    }
});