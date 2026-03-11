import { describe, test, expect } from '@jest/globals';
import SelectorBuilder from '../../../src/util/SelectorBuilder.mjs';

// Create a concrete subclass for testing since SelectorBuilder is abstract
class TestBuilder extends SelectorBuilder {}

describe('SelectorBuilder (Functional)', () => {
    test('should instantiate with an initial value', () => {
        const b = new TestBuilder(':host');
        expect(b.valueOf()).toBe(':host');
    });

    test('should work as a standard function call', () => {
        const b = new TestBuilder(':host');
        const b2 = b(".active");
        expect(b2.valueOf()).toBe(':host.active');
    });

    test('should work as a tagged template literal', () => {
        const b = new TestBuilder(':host');
        const b2 = b`.active`;
        expect(b2.valueOf()).toBe(':host.active');
    });

    test('should wrap arguments when wrapPrefix/Suffix are provided', () => {
        const b = new TestBuilder(':host', '(', ')');
        const b2 = b(".light");
        expect(b2.valueOf()).toBe(':host(.light)');
    });

    test('should support ATTR() with various arguments', () => {
        const b = new TestBuilder('input');
        expect(b.ATTR('type').valueOf()).toBe('input[type]');
        expect(b.ATTR('type', '=', 'text').valueOf()).toBe('input[type="text"]');
    });

    test('should support nested functional calls', () => {
        const host = new TestBuilder(':host', '(', ')');
        const attr = new TestBuilder('', '[', ']');
        const not = new TestBuilder(':not', '(', ')');

        // :host([highlighted]:not([disabled]))
        const result = host(
            attr("highlighted").IS(
                not(attr("disabled"))
            )
        );
        expect(result.valueOf()).toBe(':host([highlighted]:not([disabled]))');
    });

    test('should support Matcher tokens in ATTR()', () => {
        const attr = new TestBuilder('', '[', ']');
        const startsWith = new TestBuilder('^=', '"', '"');
        
        // [name^="foo"]
        const result = attr("name", startsWith("foo"));
        expect(result.valueOf()).toBe('[name^="foo"]');
    });

    test('should support combinators with spacing', () => {
        const div = new TestBuilder('div');
        expect(div.CHILD('span').valueOf()).toBe('div > span');
        expect(div.DESCENDANT('p').valueOf()).toBe('div p');
        expect(div.SIBLING('h1').valueOf()).toBe('div ~ h1');
        expect(div.ADJACENT('h2').valueOf()).toBe('div + h2');
    });
});