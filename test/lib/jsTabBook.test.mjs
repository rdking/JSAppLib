import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import App from '../../src/jsApp.mjs';
import TabBook from '../../src/jsTabBook.mjs';
import TabPage from '../../src/jsTabPage.mjs';
import TabStrip from '../../src/jsTabStrip.mjs';
import Tab from '../../src/jsTab.mjs';

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

describe('Tab Components', () => {
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

    test('TabBook and related elements register correctly', () => {
        const tabBook = document.createElement('js-tabbook');
        const page1 = document.createElement('js-tabpage');
        page1.setAttribute('caption', 'Page 1');
        tabBook.appendChild(page1);
        app.appendChild(tabBook);
        
        expect(tabBook.isRendered).toBe(true);
        const shadow = tabBook.shadowRoot;
        expect(shadow.querySelector('#tabs')).not.toBeNull();
    });

    test('TabStrip correctly identifies its active tab', () => {
        const strip = document.createElement('js-tabstrip');
        const tab1 = document.createElement('js-tab');
        const tab2 = document.createElement('js-tab');
        strip.appendChild(tab1);
        strip.appendChild(tab2);
        app.appendChild(strip);

        expect(strip.activeTab).toBe(tab1);
        
        tab2.click();
        expect(strip.activeTab).toBe(tab2);
    });

    test('Tab rendering and flip state', () => {
        const strip = document.createElement('js-tabstrip');
        const tab = document.createElement('js-tab');
        tab.setAttribute('caption', 'My Tab');
        strip.appendChild(tab);
        app.appendChild(strip);

        expect(tab.isRendered).toBe(true);
        const container = tab.shadowRoot.querySelector('.container');
        expect(container).not.toBeNull();
        expect(container.classList.contains('flip')).toBe(false);

        tab.setAttribute('flip', '');
        expect(container.classList.contains('flip')).toBe(true);
    });
});
