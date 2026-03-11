import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import TreeView from '../../src/jsTreeView.mjs';
import TreeBranch from '../../src/jsTreeBranch.mjs';
import TreeLeaf from '../../src/jsTreeLeaf.mjs';

// Mock CSSStyleSheet for JSDOM
if (typeof CSSStyleSheet === 'undefined') {
    global.CSSStyleSheet = class {
        constructor() {}
        replaceSync() {}
    };
}

// Mock ResizeObserver for JSDOM
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('TreeView Components', () => {
    let app;
    beforeAll(() => {
        document.body.setAttribute('data-debug', 'true');
        App.ready();
        app = new App();
        document.body.appendChild(app);
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        document.body.appendChild(app);
    });

    test('TreeView registers and renders correctly with template', () => {
        const tree = document.createElement('js-treeview');
        const template = document.createElement('template');
        template.innerHTML = '${name}';
        tree.appendChild(template);
        app.appendChild(tree);
        
        expect(tree.isRendered).toBe(true);
        const shadow = tree.shadowRoot;
        expect(shadow.querySelector('.focusable')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('TreeLeaf renders within TreeView', () => {
        const tree = document.createElement('js-treeview');
        const template = document.createElement('template');
        template.innerHTML = '<span>${name}</span>';
        tree.appendChild(template);
        
        const leaf = document.createElement('js-treeleaf');
        leaf.innerHTML = '{"name": "Leaf 1"}';
        tree.appendChild(leaf);
        app.appendChild(tree);

        expect(leaf.isRendered).toBe(true);
        const leafShadow = leaf.shadowRoot;
        expect(leafShadow.querySelector('.leaf')).not.toBeNull();
        expect(leafShadow.querySelector('.marker')).not.toBeNull();
    });

    test('TreeBranch correctly slots caption leaf', () => {
        const tree = document.createElement('js-treeview');
        const template = document.createElement('template');
        template.innerHTML = '${name}';
        tree.appendChild(template);

        const branch = document.createElement('js-treebranch');
        const caption = document.createElement('js-treeleaf');
        caption.setAttribute('iscaption', '');
        caption.innerHTML = '{"name": "Branch Root"}';
        branch.appendChild(caption);
        tree.appendChild(branch);
        app.appendChild(tree);

        expect(caption.getAttribute('slot')).toBe('caption');
    });
});
