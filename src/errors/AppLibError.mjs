export default class AppLibError extends Error {
    constructor(reason) {
        super(`JSAppLib: ${reason}`);
    }
}
