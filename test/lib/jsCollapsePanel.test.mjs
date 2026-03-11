import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import CollapsePanel from '../../src/jsCollapsePanel.mjs';

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

describe('CollapsePanel Component', () => {
    let app;
    beforeAll(() => {
        document.body.setAttribute('data-debug', 'true');
        App.ready();
        app = new App();
        document.body.appendChild(app);
    });

    test('CollapsePanel registers and renders correctly', () => {
        const cp = document.createElement('js-collapsepanel');
        app.appendChild(cp);
        
        expect(cp.isRendered).toBe(true);
        const shadow = cp.shadowRoot;
        expect(shadow.querySelector('.header')).not.toBeNull();
        expect(shadow.querySelector('.body')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('CollapsePanel toggles collapsed class on body', () => {
        const cp = document.createElement('js-collapsepanel');
        app.appendChild(cp);
        const body = cp.shadowRoot.querySelector('.body');
        
        expect(body.classList.contains('collapsed')).toBe(false);
        
        cp.setAttribute('collapsed', '');
        expect(body.classList.contains('collapsed')).toBe(true);
        
        cp.removeAttribute('collapsed');
        expect(body.classList.contains('collapsed')).toBe(false);
    });
});
