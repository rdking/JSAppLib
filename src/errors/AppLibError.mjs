export default class AppLibError extends Error {
    /**
     * Generates an AppLib specific error message.
     * @param {string} reason A developer friendly message describing the error.
     * @param {Error|string} [cause] The exception that was originally thrown.
     */
    constructor(reason, cause) {
        super(`JSAppLib: ${reason}`);
        if (cause) {
            console.error(`Caused by: ${cause}`);
        }
    }
}
