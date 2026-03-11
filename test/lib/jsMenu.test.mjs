import { describe, test, expect, beforeAll } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import Menu from '../../src/jsMenu.mjs';
import MenuItem from '../../src/jsMenuItem.mjs';

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

describe('Menu Components', () => {
    let app;
    beforeAll(() => {
        document.body.setAttribute('data-debug', 'true');
        App.ready();
        app = new App();
        document.body.appendChild(app);
    });

    test('Menu registers and renders correctly', () => {
        const menu = document.createElement('js-menu');
        document.body.appendChild(menu);
        
        expect(menu.isRendered).toBe(true);
        const shadow = menu.shadowRoot;
        expect(shadow.querySelector('.menu')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('MenuItem registers and renders correctly', () => {
        const menu = document.createElement('js-menu');
        const item = document.createElement('js-menuitem');
        item.setAttribute('caption', 'File');
        menu.appendChild(item);
        document.body.appendChild(menu);

        expect(item.isRendered).toBe(true);
        const shadow = item.shadowRoot;
        expect(shadow.querySelector('#caption').innerHTML).toBe('File');
    });

    test('MenuItem separator renders hr', () => {
        const menu = document.createElement('js-menu');
        const item = document.createElement('js-menuitem');
        item.setAttribute('separator', '');
        menu.appendChild(item);
        document.body.appendChild(menu);

        const shadow = item.shadowRoot;
        expect(shadow.querySelector('hr')).not.toBeNull();
    });
});
