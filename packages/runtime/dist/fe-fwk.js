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
            handlers?.splice(idx, 1);
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
            handlers.forEach((handler) => handler(payload));
        }
        else {
            console.warn(`No handlers for command: ${commandName}`);
            return false;
        }
        this.#afterHandlers.forEach((handler) => handler());
        return true;
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
