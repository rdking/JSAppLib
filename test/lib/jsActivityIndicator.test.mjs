import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import ActivityIndicator from '../../src/jsActivityIndicator.mjs';

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

describe('ActivityIndicator Component', () => {
    let app;
    beforeAll(() => {
        document.body.setAttribute('data-debug', 'true');
        App.ready();
        app = new App();
        document.body.appendChild(app);
    });

    test('ActivityIndicator registers and renders correctly', () => {
        const ai = document.createElement('js-activityindicator');
        app.appendChild(ai);
        
        expect(ai.isRendered).toBe(true);
        const shadow = ai.shadowRoot;
        expect(shadow.querySelector('.overlay')).not.toBeNull();
        expect(shadow.querySelector('.spinner1')).not.toBeNull();
        expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    test('ActivityIndicator updates spinners when image changes', () => {
        const ai = document.createElement('js-activityindicator');
        app.appendChild(ai);
        
        ai.setAttribute('image', 'new-spinner.png');
        const img = ai.shadowRoot.querySelector('.spinner1');
        expect(img.getAttribute('src')).toBe('new-spinner.png');
    });
});
