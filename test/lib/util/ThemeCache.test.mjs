import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import ThemeCache from '../../../src/util/ThemeCache.mjs';

// Mock CSSStyleSheet for JSDOM environment which doesn't support Constructable Stylesheets
global.CSSStyleSheet = class {
    constructor() {
        this.cssRules = [];
        this.cssText = "";
    }
    replaceSync(css) {
        this.cssText = css;
        // Basic simulation of rules for the tests
        if (css.includes('@media')) {
            const condition = css.match(/@media\s+([^{]+)/)?.[1]?.trim();
            this.cssRules = [{
                conditionText: condition,
                cssText: css,
                cssRules: [{ cssText: css }] // Simplified
            }];
        } else {
            this.cssRules = [{ cssText: css }];
        }
    }
};

// Mock SelectorBuilder-like objects for the DSL tests
const HOST = { valueOf: () => ':host' };
const MEDIA = { valueOf: () => '@media (min-width: 600px)' };

describe('ThemeCache', () => {
    let cache;

    beforeEach(() => {
        cache = new ThemeCache();
    });

    describe('Component Registration', () => {
        test('should register a component and compile its default styles', () => {
            const structure = [
                [[HOST], { display: 'flex', flexDirection: 'column' }]
            ];
            const skin = [
                [[HOST], { backgroundColor: 'white' }]
            ];

            cache.registerComponent('js-test', structure, skin);
            const styles = cache.getStyles('js-test');

            expect(styles).toHaveLength(2);
            expect(styles[0].cssText).toContain(':host {');
            expect(styles[0].cssText).toContain('display: flex');
            expect(styles[0].cssText).toContain('flex-direction: column');
            expect(styles[1].cssText).toContain('background-color: white');
        });

        test('should handle empty or missing styles gracefully', () => {
            cache.registerComponent('js-empty', [], []);
            const styles = cache.getStyles('js-empty');
            expect(styles).toHaveLength(0);
        });

        test('should compile nested @rules correctly', () => {
            const structure = [
                [
                    [MEDIA], 
                    [
                        [[HOST], { padding: '20px' }]
                    ]
                ]
            ];
            cache.registerComponent('js-media', structure, []);
            const styles = cache.getStyles('js-media');
            
            expect(styles[0].cssText).toContain('@media (min-width: 600px) {');
            expect(styles[0].cssText).toContain(':host {');
            expect(styles[0].cssText).toContain('padding: 20px');
        });
    });

    describe('Theme Management', () => {
        test('should register a theme and update active components', () => {
            cache.registerComponent('js-button', [[[HOST], { display: 'block' }]], []);
            
            const themeStyles = {
                'js-button': [[[HOST], { color: 'blue' }]]
            };
            
            cache.registerTheme('default', themeStyles);
            
            const styles = cache.getStyles('js-button');
            expect(styles).toHaveLength(2); 
            expect(styles[1].cssText).toContain('color: blue');
        });

        test('should not apply theme styles if the theme is not active', () => {
            cache.registerComponent('js-button', [[[HOST], { display: 'block' }]], []);
            
            const themeStyles = {
                'js-button': [[[HOST], { color: 'red' }]]
            };
            
            cache.registerTheme('material', themeStyles);
            
            const styles = cache.getStyles('js-button');
            expect(styles).toHaveLength(1);
        });

        test('should fire styleUpdate event when theme is applied', () => {
            cache.registerComponent('js-button', [[[HOST], { display: 'block' }]], []);
            const handler = jest.fn();
            cache.addEventListener('styleUpdate', handler);

            const themeStyles = {
                'js-button': [[[HOST], { color: 'green' }]]
            };
            
            cache.registerTheme('default', themeStyles);
            
            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0].detail).toContain('js-button');
        });
    });

    describe('Global Styles', () => {
        test('should register and retrieve global styles', () => {
            const structure = [[[ { valueOf: () => 'body' } ], { margin: '0' }]];
            const skin = [[[ { valueOf: () => 'body' } ], { color: 'black' }]];
            
            cache.registerGlobal(structure, skin);
            const styles = cache.getGlobalStyles();
            
            expect(styles).toHaveLength(2);
            expect(styles[0].cssText).toContain('margin: 0');
            expect(styles[1].cssText).toContain('color: black');
        });

        test('should update global styles when theme changes', () => {
            cache.registerGlobal([[[ { valueOf: () => 'body' } ], { margin: '0' }]], []);
            
            cache.registerTheme('default', {
                'global': [[[ { valueOf: () => 'body' } ], { backgroundColor: 'red' }]]
            });
            
            const styles = cache.getGlobalStyles();
            expect(styles).toHaveLength(2);
            expect(styles[1].cssText).toContain('background-color: red');
        });
    });

    describe('Latching', () => {
        test('should latch onto a manager and react to themeLoaded', () => {
            const mockManager = new EventTarget();
            mockManager.currentTheme = { themeName: 'default' };
            
            cache.latch(mockManager);
            
            const themeLoadedEvent = new CustomEvent('themeLoaded', {
                detail: {
                    themeName: 'default',
                    styles: { 'js-btn': [[[HOST], { opacity: '0.5' }]] }
                }
            });
            
            cache.registerComponent('js-btn', [[[HOST], { display: 'inline' }]], []);
            mockManager.dispatchEvent(themeLoadedEvent);
            
            const styles = cache.getStyles('js-btn');
            expect(styles).toHaveLength(2);
            expect(styles[1].cssText).toContain('opacity: 0.5');
        });

        test('should react to themeChange events from manager', () => {
            cache.registerComponent('js-btn', [[[HOST], { display: 'inline' }]], []);
            
            const mockManager = new EventTarget();
            mockManager.currentTheme = { themeName: 'dark' };
            
            cache.registerTheme('dark', { 'js-btn': [[[HOST], { color: 'black' }]] });
            
            cache.latch(mockManager);
            
            mockManager.currentTheme = { themeName: 'default' };
            mockManager.dispatchEvent(new Event('themeChange'));
            expect(cache.getStyles('js-btn')).toHaveLength(1);
            
            mockManager.currentTheme = { themeName: 'dark' };
            mockManager.dispatchEvent(new Event('themeChange'));
            expect(cache.getStyles('js-btn')).toHaveLength(2);
            expect(cache.getStyles('js-btn')[1].cssText).toContain('color: black');
        });
    });
});