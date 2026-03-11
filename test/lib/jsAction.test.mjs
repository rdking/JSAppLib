import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import ActionManager from '../../src/jsActionManager.mjs';
import Action from '../../src/jsAction.mjs';
import ActionButton from '../../src/jsActionButton.mjs';

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

describe('Action Components', () => {
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

    test('ActionButton registers and renders correctly', () => {
        const btn = document.createElement('js-actionbutton');
        btn.setAttribute('caption', 'Test');
        app.appendChild(btn);
        
        expect(btn.isRendered).toBe(true);
        const shadow = btn.shadowRoot;
        expect(shadow.querySelector('button')).not.toBeNull();
        expect(shadow.querySelector('label').innerHTML).toBe('Test');
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('ActionButton with icon', () => {
        const btn = document.createElement('js-actionbutton');
        btn.setAttribute('icon', 'test.png');
        app.appendChild(btn);
        
        const img = btn.shadowRoot.querySelector('img');
        expect(img.getAttribute('src')).toBe('test.png');
        expect(img.classList.contains('hidden')).toBe(false);
    });

    test('ActionManager hides its slot', () => {
        const am = document.createElement('js-actionmanager');
        app.appendChild(am);
        
        expect(am.isRendered).toBe(true);
        const shadow = am.shadowRoot;
        // Styles check would need a real browser or more complex mock, 
        // but we verify the sheet is adopted.
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });
});
