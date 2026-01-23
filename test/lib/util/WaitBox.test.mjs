import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import WaitBox from '../../../src/util/WaitBox.mjs';

describe('WaitBox', () => {
    let waitBox;
    let mockObject;

    beforeEach(() => {
        waitBox = new WaitBox();
        mockObject = {
            method1: jest.fn(),
            method2: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('add', () => {
        test('should add a task to the queue', () => {
            waitBox.add(mockObject, mockObject.method1, ['param1']);
            expect(mockObject.method1).not.toHaveBeenCalled();
            waitBox.trigger();
            expect(mockObject.method1).toHaveBeenCalledWith('param1');
        });

        test('should throw TypeError for invalid parameters', () => {
            expect(() => waitBox.add(null, 'not-a-function', [])).toThrow(TypeError);
            expect(() => waitBox.add(undefined, 'not-a-function', [])).toThrow(TypeError);
            expect(() => waitBox.add({}, () => {}, 'not-an-array')).toThrow(TypeError);
            expect(() => waitBox.add(123, () => {}, [])).toThrow(TypeError);
        });

        test('should execute immediately if trigger has already been called', () => {
            waitBox.trigger(); // Trigger is called once.
            expect(mockObject.method1).not.toHaveBeenCalled();

            waitBox.add(mockObject, mockObject.method1, ['param1']);
            expect(mockObject.method1).toHaveBeenCalledWith('param1');
            expect(mockObject.method1).toHaveBeenCalledTimes(1);

            waitBox.add(mockObject, mockObject.method2, ['param2']);
            expect(mockObject.method2).toHaveBeenCalledWith('param2');
            expect(mockObject.method2).toHaveBeenCalledTimes(1);
        });
    });

    describe('trigger', () => {
        test('should execute all tasks in the queue', () => {
            waitBox.add(mockObject, mockObject.method1, [1]);
            waitBox.add(mockObject, mockObject.method2, ['hello']);

            waitBox.trigger();

            expect(mockObject.method1).toHaveBeenCalledWith(1);
            expect(mockObject.method2).toHaveBeenCalledWith('hello');
            expect(mockObject.method1).toHaveBeenCalledTimes(1);
            expect(mockObject.method2).toHaveBeenCalledTimes(1);
        });

        test('should not run if it is already processing', () => {
            const reentrantMethod = jest.fn(() => {
                waitBox.trigger();
            });

            waitBox.add(void 0, reentrantMethod, []);
            waitBox.add(mockObject, mockObject.method1, []);

            waitBox.trigger();

            expect(reentrantMethod).toHaveBeenCalledTimes(1);
            // If re-entrancy was allowed, method1 would not be called until after the
            // re-entrant trigger finished. This test ensures that the processing flag
            // prevents re-entrancy and all originally queued items are processed.
            expect(mockObject.method1).toHaveBeenCalledTimes(1);
        });


        test('should clear the queue after processing', () => {
            waitBox.add(mockObject, mockObject.method1, []);
            waitBox.trigger();
            expect(mockObject.method1).toHaveBeenCalledTimes(1);

            // Trigger again, method1 should not be called again because queue was cleared.
            waitBox.trigger();
            expect(mockObject.method1).toHaveBeenCalledTimes(1);
        });

        test('should process only items in queue when triggered', () => {
            const methodThatAdds = jest.fn(() => {
                waitBox.add(mockObject, mockObject.method2, []);
            });

            waitBox.add(void 0, methodThatAdds, []);

            waitBox.trigger();

            // The first method is called
            expect(methodThatAdds).toHaveBeenCalledTimes(1);
            // The second method should NOT have been called, because it was added
            // during the processing of the first trigger.
            expect(mockObject.method2).not.toHaveBeenCalled();

            // Now, because the WaitBox was triggered, adding a new item will trigger
            // processing of the queue. The queue contains the item added during the
            // first trigger, and we are adding a new one. Both should be processed.
            waitBox.add(mockObject, mockObject.method2, []);
            expect(mockObject.method2).toHaveBeenCalledTimes(2);
        });
    });

    describe('ready', () => {
        test('should return false initially', () => {
            expect(waitBox.ready).toBe(false);
        });

        test('should return true after trigger has been called', () => {
            waitBox.trigger();
            expect(waitBox.ready).toBe(true);
        });
    });
});
