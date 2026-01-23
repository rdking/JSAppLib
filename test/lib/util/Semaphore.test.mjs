import Semaphore from '../../../src/util/Semaphore.mjs';
import { jest } from '@jest/globals';

describe('Semaphore', () => {
    test('should execute synchronous tasks sequentially', async () => {
        const s = new Semaphore();
        const order = [];

        s.lock(() => {
            order.push(1);
        });
        s.lock(() => {
            order.push(2);
        });

        // Add a final async task to await, ensuring the queue is drained before we assert
        await s.lockAsync(async () => {
            order.push(3);
        });

        expect(order).toEqual([1, 2, 3]);
    });

    test('should execute asynchronous tasks sequentially', async () => {
        const s = new Semaphore();
        const order = [];

        const task1 = s.lockAsync(async () => {
            await new Promise(r => setTimeout(r, 10)); // Simulate async work
            order.push(1);
        });

        const task2 = s.lockAsync(async () => {
            order.push(2);
        });

        await Promise.all([task1, task2]);

        expect(order).toEqual([1, 2]);
    });

    test('should execute mixed sync and async tasks in order', async () => {
        const s = new Semaphore();
        const order = [];

        s.lock(() => order.push(1));

        const task2 = s.lockAsync(async () => {
            await new Promise(r => setTimeout(r, 10));
            order.push(2);
        });

        s.lock(() => order.push(3));
        
        const task4 = s.lockAsync(async () => {
            order.push(4);
        });

        await Promise.all([task2, task4]);

        expect(order).toEqual([1, 2, 3, 4]);
    });

    test('lockAsync should resolve with the callback return value', async () => {
        const s = new Semaphore();
        const result = await s.lockAsync(async () => {
            return 42;
        });
        expect(result).toBe(42);
    });

    test('lockAsync should reject if the callback throws an error', async () => {
        const s = new Semaphore();
        const testError = new Error('test error');
        
        await expect(s.lockAsync(async () => {
            throw testError;
        })).rejects.toThrow(testError);
    });

    test('should release lock even if a task throws an error', async () => {
        const s = new Semaphore();
        const order = [];
        const testError = new Error('test error');

        await expect(s.lockAsync(async () => {
            order.push(1);
            throw testError;
        })).rejects.toThrow(testError);

        // This second task should run, proving the lock was released.
        await s.lockAsync(async () => {
            order.push(2);
        });

        expect(order).toEqual([1, 2]);
    });

    describe('with fake timers', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should yield to event loop between tasks', () => {
            const s = new Semaphore();
            const order = [];

            // Queue up two synchronous tasks. The second one (3) should wait.
            s.lock(() => order.push(1));
            s.lock(() => order.push(3));

            // Queue up a plain setTimeout callback. Because the semaphore yields
            // using setTimeout, this task should be able to execute *between*
            // the two semaphore tasks.
            setTimeout(() => {
                order.push(2);
            }, 0);

            // Run all timers to completion.
            jest.runAllTimers();

            // Assert the final order.
            expect(order).toEqual([1, 2, 3]);
        });
    });
});
