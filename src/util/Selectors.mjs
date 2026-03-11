import { saveSelf, final } from "../../node_modules/cfprotected/index.mjs";
import SelectorBuilder from "./SelectorBuilder.mjs";

/**
 * @summary Concrete implementation of SelectorBuilder for standard tokens.
 */
class Selector extends SelectorBuilder {
    // Identity & Shadow DOM
    get UNIVERSAL() { return super.IS(Selectors.UNIVERSAL); }
    get HOST() { return super.IS(Selectors.HOST); }
    get HOST_CONTEXT() { return super.IS(Selectors.HOST_CONTEXT); }
    get SLOTTED() { return super.IS(Selectors.SLOTTED); }
    get PART() { return super.IS(Selectors.PART); }
    get TAG() { return super.IS(Selectors.TAG); }
    get ID() { return super.IS(Selectors.ID); }
    get CLASS() { return super.IS(Selectors.CLASS); }
    get ATTR() { return super.IS(Selectors.ATTR); }

    // Combinators
    get CHILD() { return super.CHILD(""); }
    get DESCENDANT() { return super.DESCENDANT(""); }
    get ADJACENT() { return super.ADJACENT(""); }
    get SIBLING() { return super.SIBLING(""); }

    // Pseudo-classes (User Action & State)
    get ACTIVE() { return super.IS(Selectors.ACTIVE); }
    get HOVER() { return super.IS(Selectors.HOVER); }
    get FOCUS() { return super.IS(Selectors.FOCUS); }
    get FOCUS_WITHIN() { return super.IS(Selectors.FOCUS_WITHIN); }
    get FOCUS_VISIBLE() { return super.IS(Selectors.FOCUS_VISIBLE); }
    get DISABLED() { return super.IS(Selectors.DISABLED); }
    get ENABLED() { return super.IS(Selectors.ENABLED); }
    get CHECKED() { return super.IS(Selectors.CHECKED); }
    get INDETERMINATE() { return super.IS(Selectors.INDETERMINATE); }
    get REQUIRED() { return super.IS(Selectors.REQUIRED); }
    get OPTIONAL() { return super.IS(Selectors.OPTIONAL); }
    get VALID() { return super.IS(Selectors.VALID); }
    get INVALID() { return super.IS(Selectors.INVALID); }
    get IN_RANGE() { return super.IS(Selectors.IN_RANGE); }
    get OUT_OF_RANGE() { return super.IS(Selectors.OUT_OF_RANGE); }
    get READ_ONLY() { return super.IS(Selectors.READ_ONLY); }
    get READ_WRITE() { return super.IS(Selectors.READ_WRITE); }
    get DEFAULT() { return super.IS(Selectors.DEFAULT); }
    get EMPTY() { return super.IS(Selectors.EMPTY); }
    get PLACEHOLDER_SHOWN() { return super.IS(Selectors.PLACEHOLDER_SHOWN); }
    get AUTOFILL() { return super.IS(Selectors.AUTOFILL); }

    // Pseudo-classes (Structural)
    get ROOT() { return super.IS(Selectors.ROOT); }
    get FIRST_CHILD() { return super.IS(Selectors.FIRST_CHILD); }
    get LAST_CHILD() { return super.IS(Selectors.LAST_CHILD); }
    get ONLY_CHILD() { return super.IS(Selectors.ONLY_CHILD); }
    get FIRST_OF_TYPE() { return super.IS(Selectors.FIRST_OF_TYPE); }
    get LAST_OF_TYPE() { return super.IS(Selectors.LAST_OF_TYPE); }
    get ONLY_OF_TYPE() { return super.IS(Selectors.ONLY_OF_TYPE); }
    get NTH_CHILD() { return super.IS(Selectors.NTH_CHILD); }
    get NTH_LAST_CHILD() { return super.IS(Selectors.NTH_LAST_CHILD); }
    get NTH_OF_TYPE() { return super.IS(Selectors.NTH_OF_TYPE); }
    get NTH_LAST_OF_TYPE() { return super.IS(Selectors.NTH_LAST_OF_TYPE); }

    // Pseudo-classes (Functional & Logic)
    get NOT() { return super.IS(Selectors.NOT); }
    get IS() { return super.IS(Selectors.IS); }
    get WHERE() { return super.IS(Selectors.WHERE); }
    get HAS() { return super.IS(Selectors.HAS); }
    get LANG() { return super.IS(Selectors.LANG); }
    get DIR() { return super.IS(Selectors.DIR); }

    // Pseudo-classes (Location)
    get LINK() { return super.IS(Selectors.LINK); }
    get VISITED() { return super.IS(Selectors.VISITED); }
    get ANY_LINK() { return super.IS(Selectors.ANY_LINK); }
    get TARGET() { return super.IS(Selectors.TARGET); }
    get SCOPE() { return super.IS(Selectors.SCOPE); }

    // Pseudo-elements
    get BEFORE() { return super.IS(Selectors.BEFORE); }
    get AFTER() { return super.IS(Selectors.AFTER); }
    get MARKER() { return super.IS(Selectors.MARKER); }
    get PLACEHOLDER() { return super.IS(Selectors.PLACEHOLDER); }
    get SELECTION() { return super.IS(Selectors.SELECTION); }
    get FIRST_LINE() { return super.IS(Selectors.FIRST_LINE); }
    get FIRST_LETTER() { return super.IS(Selectors.FIRST_LETTER); }
    get FILE_SELECTOR_BUTTON() { return super.IS(Selectors.FILE_SELECTOR_BUTTON); }
    get BACKDROP() { return super.IS(Selectors.BACKDROP); }
    get CUE() { return super.IS(Selectors.CUE); }
}

/**
 * @summary Namespace for CSS selector builders.
 * @description Provides a comprehensive set of CSS selector tokens as static getters.
 * This class is final and protects its members against proxy wrapping.
 */
const Selectors = final(class Selectors {
    static #tagTransformer = (v) => v;
    static set tagTransformer(v) { this.$.#tagTransformer = v; }
    static get tagTransformer() { return this.$.#tagTransformer; }

    static {
        saveSelf(this, "$");
    }

    // Identity & Shadow DOM
    static #UNIVERSAL = new Selector("*");
    static #HOST = new Selector(":host", "(", ")");
    static #HOST_CONTEXT = new Selector(":host-context", "(", ")");
    static #SLOTTED = new Selector("::slotted", "(", ")");
    static #PART = new Selector("::part", "(", ")");
    static #TAG = new Selector("", "", "", (v) => Selectors.tagTransformer(v));
    static #ID = new Selector("#");
    static #CLASS = new Selector(".");
    static #ATTR = new Selector("", "[", "]");

    // Combinators
    static #CHILD = new Selector(" > ");
    static #DESCENDANT = new Selector(" ");
    static #ADJACENT = new Selector(" + ");
    static #SIBLING = new Selector(" ~ ");

    // Matchers (Type 2.4)
    static #EQUALS = new Selector("=", "\"", "\"");
    static #STARTSWITH = new Selector("^=", "\"", "\"");
    static #ENDSWITH = new Selector("$=", "\"", "\"");
    static #CONTAINS = new Selector("*=", "\"", "\"");
    static #INCLUDES = new Selector("~=", "\"", "\"");
    static #DASHMATCH = new Selector("|=", "\"", "\"");

    // Pseudo-classes (User Action & State)
    static #ACTIVE = new Selector(":active");
    static #HOVER = new Selector(":hover");
    static #FOCUS = new Selector(":focus");
    static #FOCUS_WITHIN = new Selector(":focus-within");
    static #FOCUS_VISIBLE = new Selector(":focus-visible");
    static #DISABLED = new Selector(":disabled");
    static #ENABLED = new Selector(":enabled");
    static #CHECKED = new Selector(":checked");
    static #INDETERMINATE = new Selector(":indeterminate");
    static #REQUIRED = new Selector(":required");
    static #OPTIONAL = new Selector(":optional");
    static #VALID = new Selector(":valid");
    static #INVALID = new Selector(":invalid");
    static #IN_RANGE = new Selector(":in-range");
    static #OUT_OF_RANGE = new Selector(":out-of-range");
    static #READ_ONLY = new Selector(":read-only");
    static #READ_WRITE = new Selector(":read-write");
    static #DEFAULT = new Selector(":default");
    static #EMPTY = new Selector(":empty");
    static #PLACEHOLDER_SHOWN = new Selector(":placeholder-shown");
    static #AUTOFILL = new Selector(":autofill");

    // Pseudo-classes (Structural)
    static #ROOT = new Selector(":root");
    static #FIRST_CHILD = new Selector(":first-child");
    static #LAST_CHILD = new Selector(":last-child");
    static #ONLY_CHILD = new Selector(":only-child");
    static #FIRST_OF_TYPE = new Selector(":first-of-type");
    static #LAST_OF_TYPE = new Selector(":last-of-type");
    static #ONLY_OF_TYPE = new Selector(":only-of-type");
    static #NTH_CHILD = new Selector(":nth-child", "(", ")");
    static #NTH_LAST_CHILD = new Selector(":nth-last-child", "(", ")");
    static #NTH_OF_TYPE = new Selector(":nth-of-type", "(", ")");
    static #NTH_LAST_OF_TYPE = new Selector(":nth-last-of-type", "(", ")");

    // Pseudo-classes (Functional & Logic)
    static #NOT = new Selector(":not", "(", ")");
    static #IS = new Selector(":is", "(", ")");
    static #WHERE = new Selector(":where", "(", ")");
    static #HAS = new Selector(":has", "(", ")");
    static #LANG = new Selector(":lang", "(", ")");
    static #DIR = new Selector(":dir", "(", ")");

    // Pseudo-classes (Location)
    static #LINK = new Selector(":link");
    static #VISITED = new Selector(":visited");
    static #ANY_LINK = new Selector(":any-link");
    static #TARGET = new Selector(":target");
    static #SCOPE = new Selector(":scope");

    // Pseudo-elements
    static #BEFORE = new Selector("::before");
    static #AFTER = new Selector("::after");
    static #MARKER = new Selector("::marker");
    static #PLACEHOLDER = new Selector("::placeholder");
    static #SELECTION = new Selector("::selection");
    static #FIRST_LINE = new Selector("::first-line");
    static #FIRST_LETTER = new Selector("::first-letter");
    static #FILE_SELECTOR_BUTTON = new Selector("::file-selector-button");
    static #BACKDROP = new Selector("::backdrop");
    static #CUE = new Selector("::cue");

    static {
        saveSelf(this, "$");
    }

    // Public Getters with proxy protection (using this.$)
    static get UNIVERSAL() { return this.$.#UNIVERSAL; }
    static get HOST() { return this.$.#HOST; }
    static get HOST_CONTEXT() { return this.$.#HOST_CONTEXT; }
    static get SLOTTED() { return this.$.#SLOTTED; }
    static get PART() { return this.$.#PART; }
    static get TAG() { return this.$.#TAG; }
    static get ID() { return this.$.#ID; }
    static get CLASS() { return this.$.#CLASS; }
    static get ATTR() { return this.$.#ATTR; }

    static get CHILD() { return this.$.#CHILD; }
    static get DESCENDANT() { return this.$.#DESCENDANT; }
    static get ADJACENT() { return this.$.#ADJACENT; }
    static get SIBLING() { return this.$.#SIBLING; }

    static get EQUALS() { return this.$.#EQUALS; }
    static get STARTSWITH() { return this.$.#STARTSWITH; }
    static get ENDSWITH() { return this.$.#ENDSWITH; }
    static get CONTAINS() { return this.$.#CONTAINS; }
    static get INCLUDES() { return this.$.#INCLUDES; }
    static get DASHMATCH() { return this.$.#DASHMATCH; }

    static get ACTIVE() { return this.$.#ACTIVE; }
    static get HOVER() { return this.$.#HOVER; }
    static get FOCUS() { return this.$.#FOCUS; }
    static get FOCUS_WITHIN() { return this.$.#FOCUS_WITHIN; }
    static get FOCUS_VISIBLE() { return this.$.#FOCUS_VISIBLE; }
    static get DISABLED() { return this.$.#DISABLED; }
    static get ENABLED() { return this.$.#ENABLED; }
    static get CHECKED() { return this.$.#CHECKED; }
    static get INDETERMINATE() { return this.$.#INDETERMINATE; }
    static get REQUIRED() { return this.$.#REQUIRED; }
    static get OPTIONAL() { return this.$.#OPTIONAL; }
    static get VALID() { return this.$.#VALID; }
    static get INVALID() { return this.$.#INVALID; }
    static get IN_RANGE() { return this.$.#IN_RANGE; }
    static get OUT_OF_RANGE() { return this.$.#OUT_OF_RANGE; }
    static get READ_ONLY() { return this.$.#READ_ONLY; }
    static get READ_WRITE() { return this.$.#READ_WRITE; }
    static get DEFAULT() { return this.$.#DEFAULT; }
    static get EMPTY() { return this.$.#EMPTY; }
    static get PLACEHOLDER_SHOWN() { return this.$.#PLACEHOLDER_SHOWN; }
    static get AUTOFILL() { return this.$.#AUTOFILL; }

    static get ROOT() { return this.$.#ROOT; }
    static get FIRST_CHILD() { return this.$.#FIRST_CHILD; }
    static get LAST_CHILD() { return this.$.#LAST_CHILD; }
    static get ONLY_CHILD() { return this.$.#ONLY_CHILD; }
    static get FIRST_OF_TYPE() { return this.$.#FIRST_OF_TYPE; }
    static get LAST_OF_TYPE() { return this.$.#LAST_OF_TYPE; }
    static get ONLY_OF_TYPE() { return this.$.#ONLY_OF_TYPE; }
    static get NTH_CHILD() { return this.$.#NTH_CHILD; }
    static get NTH_LAST_CHILD() { return this.$.#NTH_LAST_CHILD; }
    static get NTH_OF_TYPE() { return this.$.#NTH_OF_TYPE; }
    static get NTH_LAST_OF_TYPE() { return this.$.#NTH_LAST_OF_TYPE; }

    static get NOT() { return this.$.#NOT; }
    static get IS() { return this.$.#IS; }
    static get WHERE() { return this.$.#WHERE; }
    static get HAS() { return this.$.#HAS; }
    static get LANG() { return this.$.#LANG; }
    static get DIR() { return this.$.#DIR; }

    static get LINK() { return this.$.#LINK; }
    static get VISITED() { return this.$.#VISITED; }
    static get ANY_LINK() { return this.$.#ANY_LINK; }
    static get TARGET() { return this.$.#TARGET; }
    static get SCOPE() { return this.$.#SCOPE; }

    static get BEFORE() { return this.$.#BEFORE; }
    static get AFTER() { return this.$.#AFTER; }
    static get MARKER() { return this.$.#MARKER; }
    static get PLACEHOLDER() { return this.$.#PLACEHOLDER; }
    static get SELECTION() { return this.$.#SELECTION; }
    static get FIRST_LINE() { return this.$.#FIRST_LINE; }
    static get FIRST_LETTER() { return this.$.#FIRST_LETTER; }
    static get FILE_SELECTOR_BUTTON() { return this.$.#FILE_SELECTOR_BUTTON; }
    static get BACKDROP() { return this.$.#BACKDROP; }
    static get CUE() { return this.$.#CUE; }
});

export default Selectors;