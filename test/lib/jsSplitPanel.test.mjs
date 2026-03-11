import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import HSplitPanel from '../../src/jsHSplitPanel.mjs';
import VSplitPanel from '../../src/jsVSplitPanel.mjs';

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

describe('SplitPanel Components', () => {
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

    test('HSplitPanel registers and renders correctly', () => {
        const panel = document.createElement('js-hsplitpanel');
        app.appendChild(panel);
        
        expect(panel.isRendered).toBe(true);
        const shadow = panel.shadowRoot;
        expect(shadow.querySelector('.container')).not.toBeNull();
        expect(shadow.querySelector('.splitter')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('VSplitPanel registers and renders correctly', () => {
        const panel = document.createElement('js-vsplitpanel');
        app.appendChild(panel);
        
        expect(panel.isRendered).toBe(true);
        const shadow = panel.shadowRoot;
        expect(shadow.querySelector('.container')).not.toBeNull();
        expect(shadow.querySelector('.splitter')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('SplitPanel connectedCallback initializes min widths', () => {
        const panel = document.createElement('js-hsplitpanel');
        app.appendChild(panel);
        
        expect(Number(panel.minfirstwidth)).toBe(32);
        expect(Number(panel.minlastwidth)).toBe(32);
    });
});
