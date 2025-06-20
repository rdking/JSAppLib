import { share, final, accessor } from "../../cfprotected/index.mjs";
import DataHandlerBase from "./jsDataHandlerBase.mjs";

export default final(class From extends DataHandlerBase {
    static #spvt = share(this, {});

    static {
        this.#spvt.register(this);
    }
});