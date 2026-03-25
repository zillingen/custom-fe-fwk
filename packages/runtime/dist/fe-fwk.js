class Dispatcher {
    #subs = new Map();
    #afterHandlers = [];
    subscribe(commandName, handler) {
        if (!this.#subs.has(commandName)) {
            this.#subs.set(commandName, []);
        }
        const handlers = this.#subs.get(commandName);
        if (handlers.includes(handler)) {
            return () => { };
        }
        handlers.push(handler);
        return () => {
            const idx = handlers.indexOf(handler);
            if (idx !== -1) {
                handlers.splice(idx, 1);
            }
        };
    }
    afterEveryCommand(handler) {
        this.#afterHandlers.push(handler);
        return () => {
            const idx = this.#afterHandlers.indexOf(handler);
            if (idx !== -1) {
                this.#afterHandlers.splice(idx, 1);
            }
        };
    }
    dispatch(commandName, payload) {
        const handlers = this.#subs.get(commandName);
        if (handlers?.length) {
            let hasError = false;
            let error;
            // Execute all handlers, catching errors but continuing
            // Use a copy of the array to handle cases where handlers unsubscribe during execution
            const handlersCopy = [...handlers];
            handlersCopy.forEach((handler) => {
                try {
                    handler(payload);
                }
                catch (e) {
                    hasError = true;
                    error = e;
                }
            });
            // Always execute after handlers
            this.#afterHandlers.forEach((handler) => {
                try {
                    handler();
                }
                catch {
                    // After handler errors should not prevent other after handlers from running
                    // but should be logged or handled appropriately
                }
            });
            // Re-throw the first error if any occurred
            if (hasError) {
                throw error;
            }
        }
        else {
            console.warn(`No handlers for command: ${commandName}`);
            // Still execute after handlers even when no command handlers exist
            this.#afterHandlers.forEach((handler) => {
                try {
                    handler();
                }
                catch {
                    // After handler errors should not prevent other after handlers from running
                    // but should be logged or handled appropriately
                }
            });
        }
        return Boolean(handlers?.length);
    }
    hasSubscribers(commandName) {
        return this.#subs.has(commandName) && this.#subs.get(commandName).length > 0;
    }
    getSubscriberCount(commandName) {
        return this.#subs.get(commandName)?.length ?? 0;
    }
    clear() {
        this.#subs.clear();
        this.#afterHandlers.length = 0;
    }
}

console.log('This will soon be a frontend framework!');
const dispatcher = new Dispatcher();
dispatcher.subscribe('greet', (name) => {
    console.log('Hello', name);
});
dispatcher.dispatch('greet', 'John');
