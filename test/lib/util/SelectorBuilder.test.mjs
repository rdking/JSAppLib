import { describe, test, expect } from '@jest/globals';
import SelectorBuilder from '../../../src/util/SelectorBuilder.mjs';

// Create a concrete subclass for testing since SelectorBuilder is abstract
class TestBuilder extends SelectorBuilder {}

describe('SelectorBuilder', () => {
    test('should instantiate with an initial value', () => {
        const b = new TestBuilder(':host');
        expect(b.valueOf()).toBe(':host');
    });

    test('should work as a tagged template literal (standalone)', () => {
        const b = new TestBuilder(':host');
        // The instance is a function, so it should be callable as a tag
        const b2 = b`.active`;
        expect(b2.valueOf()).toBe(':host.active');
        expect(b2).toBeInstanceOf(TestBuilder);
    });

    test('should handle interpolations in tag calls', () => {
        const b = new TestBuilder(':host');
        const suffix = 'active';
        const b2 = b`.${suffix}`;
        expect(b2.valueOf()).toBe(':host.active');
    });

    test('should support Child() chaining', () => {
        const b = new TestBuilder(':host');
        const b2 = b.Child('div');
        expect(b2.valueOf()).toBe(':host > div');
    });

    test('should support Descendant() chaining', () => {
        const b = new TestBuilder(':host');
        const b2 = b.Descendant('span');
        expect(b2.valueOf()).toBe(':host span');
    });

    test('should support Sibling() chaining', () => {
        const b = new TestBuilder('div');
        const b2 = b.Sibling('p');
        expect(b2.valueOf()).toBe('div ~ p');
    });

    test('should support Adjacent() chaining', () => {
        const b = new TestBuilder('div');
        const b2 = b.Adjacent('p');
        expect(b2.valueOf()).toBe('div + p');
    });

    test('should support Is() and Where() chaining', () => {
        const b = new TestBuilder('div');
        const b2 = b.Is(':hover');
        const b3 = b.Where(':active');
        expect(b2.valueOf()).toBe('div:hover');
        expect(b3.valueOf()).toBe('div:active');
    });

    test('should support Attr() method with various arguments', () => {
        const b = new TestBuilder('input');
        expect(b.Attr('type').valueOf()).toBe('input[type]');
        expect(b.Attr('type', '=', 'text').valueOf()).toBe('input[type="text"]');
        expect(b.Attr('class', '*=', 'btn').valueOf()).toBe('input[class*="btn"]');
    });

    test('should be immutable (return new instances for each operation)', () => {
        const b = new TestBuilder('div');
        const b2 = b.Child('span');
        expect(b).not.toBe(b2);
        expect(b.valueOf()).toBe('div');
        expect(b2.valueOf()).toBe('div > span');
    });

    test('should use the correct constructor for chained results (via cla$$)', () => {
        class SubBuilder extends TestBuilder {}
        const b = new SubBuilder('div');
        const b2 = b.Child('span');
        const b3 = b2`.active`;
        
        expect(b2).toBeInstanceOf(SubBuilder);
        expect(b3).toBeInstanceOf(SubBuilder);
    });
});
