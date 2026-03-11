import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import ToolBar from '../../src/jsToolBar.mjs';

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

describe('ToolBar Component', () => {
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

    test('ToolBar registers and renders correctly', () => {
        const toolbar = document.createElement('js-toolbar');
        app.appendChild(toolbar);
        
        expect(toolbar.isRendered).toBe(true);
        const shadow = toolbar.shadowRoot;
        expect(shadow.querySelector('slot')).not.toBeNull();
        expect(shadow.querySelector('.vr')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('ToolBar moveable attribute toggles vr visibility', () => {
        const toolbar = document.createElement('js-toolbar');
        app.appendChild(toolbar);
        const vr = toolbar.shadowRoot.querySelector('.vr');
        
        // Initial state (moveable defaults to false, .vr has .hidden)
        expect(vr.classList.contains('hidden')).toBe(true);
        
        toolbar.setAttribute('moveable', '');
        expect(vr.classList.contains('hidden')).toBe(false);
        
        toolbar.removeAttribute('moveable');
        expect(vr.classList.contains('hidden')).toBe(true);
    });

    test('ToolBar edge attribute sets slot', () => {
        const toolbar = document.createElement('js-toolbar');
        app.appendChild(toolbar);
        
        toolbar.setAttribute('edge', 'first');
        expect(toolbar.getAttribute('slot')).toBe('first');
        
        toolbar.setAttribute('edge', 'last');
        expect(toolbar.getAttribute('slot')).toBe('last');
        
        toolbar.setAttribute('edge', 'content');
        expect(toolbar.hasAttribute('slot')).toBe(false);
    });
});
