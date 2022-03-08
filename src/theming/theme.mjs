import { saveSelf } from "/node_modules/cfprotected/index.mjs";

export default class Theme {
    #themeManager = null;
    #themeName = null;
    #globalStyleSheet = null;
    #componentSheets = null;
    #componentColors = null;
    #isDefault = false;

    #createLink(name, file) {
        let retval = "";
        if (file) {
            retval = `<link id="${name}" rel="stylesheet" href="${file}"/>`;
        }
        return retval;
    }

    constructor(manager, info) {
        saveSelf(this, "pvt");

        let prefix = `${info.root}/${info.folder}/`;
        let components = info.components;
        this.pvt.#themeManager = manager;
        this.pvt.#globalStyleSheet = prefix + components.global;
        this.pvt.#componentColors = prefix + components.color;

        if (Array.isArray(components.tags)) {
            this.pvt.#componentSheets = {};

            for (let name of components.tags) {
                this.pvt.#componentSheets[name] = prefix + name + ".css";
            }
        }
    }

    componentLink(tagName) {
        let retval = "";
        if (tagName in this.pvt.#componentSheets) {
            retval = this.pvt.#createLink("colors", this.pvt.#componentColors)
                + this.pvt.#createLink("componentTheme", this.pvt.#componentSheets[tagName]);
        }
        else {
            console.warn(`Could not find style for ${tagName}...`);
        }
        return retval;
    }

    get name() { return this.pvt.#themeName; }
    get globalLink() {
        return this.pvt.#createLink("colors", this.pvt.#componentColors)
            + this.pvt.#createLink("theme", this.pvt.#globalStyleSheet);
    }

    get isDefault() { return this.pvt.#isDefault; }
}
