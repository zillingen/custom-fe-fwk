const entries = (obj) => {
    return Object.entries(obj);
};

const addEventListeners = (listeners = {}, el) => {
    const addedListeners = {};
    if (!el)
        return addedListeners;
    entries(listeners).forEach(([eventName, handler]) => {
        if (handler) {
            const listener = addEventListener(eventName, handler, el);
            addedListeners[eventName] = listener;
        }
    });
    return addedListeners;
};
const addEventListener = (eventName, handler, el) => {
    el.addEventListener(eventName, handler);
    return handler;
};
const removeEventListeners = (listeners = {}, el) => {
    if (!el)
        return;
    entries(listeners).forEach(([eventName, listener]) => {
        if (listener) {
            el.removeEventListener(eventName, listener);
        }
    });
};

const withoutNulls = (arr) => arr.filter((el) => el != null);

const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
};
const h = (tag, props = {}, children = []) => {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    };
};
const mapTextNodes = (children) => children.map((child) => typeof child === 'string' ? hString(child) : child);
const hString = (value) => ({ type: DOM_TYPES.TEXT, value });
const hFragment = (vNodes) => ({
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes))
});

const destroyDom = (vdom) => {
    const { type } = vdom;
    switch (type) {
        case DOM_TYPES.TEXT:
            removeTextNode(vdom);
            break;
        case DOM_TYPES.ELEMENT:
            removeElementNode(vdom);
            break;
        case DOM_TYPES.FRAGMENT:
            removeFragmentNodes(vdom);
            break;
        default:
            throw new Error(` Can't destroy DOM from: ${vdom}`);
    }
    delete vdom.el;
};
const removeTextNode = (vdom) => {
    const { el } = vdom;
    el?.remove();
};
const removeElementNode = (vdom) => {
    const { el, children, listeners } = vdom;
    el?.remove();
    children?.forEach(destroyDom);
    if (listeners && el) {
        removeEventListeners(listeners, el);
        delete vdom.listeners;
    }
};
const removeFragmentNodes = (vdom) => {
    const { children } = vdom;
    children.forEach(destroyDom);
};

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

const setAttributes = (el, attrs) => {
    const { class: className, style, ...otherAttrs } = attrs;
    if (className) {
        setClass(el, className);
    }
    if (style) {
        entries((style)).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value);
    }
};
const setClass = (el, className) => {
    el.className = '';
    if (typeof className === 'string') {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
};
const setStyle = (el, name, value) => {
    el.style.setProperty(name, value);
};
const setAttribute = (el, name, value) => {
    if (value === null) {
        removeAttribute(el, name);
    }
    else {
        el.setAttribute(name, String(value));
    }
};
const removeAttribute = (el, name) => {
    el.removeAttribute(name);
};

const mountDom = (vdom, parentEl) => {
    switch (vdom.type) {
        case DOM_TYPES.TEXT:
            createTextNode(vdom, parentEl);
            break;
        case DOM_TYPES.ELEMENT:
            createElementNode(vdom, parentEl);
            break;
        case DOM_TYPES.FRAGMENT:
            createFragmentNodes(vdom, parentEl);
            break;
        default:
            throw new Error(`Can't mount DOM from: ${vdom}`);
    }
};
const createTextNode = (node, parentEl) => {
    const { value } = node;
    const textNode = document.createTextNode(value);
    node.el = textNode;
    parentEl.append(textNode);
};
const createFragmentNodes = (vdom, parentEl) => {
    const { children } = vdom;
    vdom.el = parentEl;
    children.forEach((child) => mountDom(child, parentEl));
};
const createElementNode = (vdom, parentEl) => {
    const { tag, props, children } = vdom;
    const element = document.createElement(tag);
    if (!element) {
        throw new Error(`Can't create element for ${tag}`);
    }
    addProps(element, props, vdom);
    vdom.el = element;
    children?.forEach((child) => mountDom(child, element));
    parentEl.append(element);
};
const addProps = (el, props = {}, vdom) => {
    const { on: events, ...attrs } = props;
    vdom.listeners = addEventListeners(events, el);
    setAttributes(el, attrs);
};

function createApp({ state, view, reducers = {} }) {
    let parentEl = null;
    let vdom = null;
    const dispatcher = new Dispatcher();
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)];
    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload);
    }
    for (const actionName in reducers) {
        const reducer = reducers[actionName];
        if (!reducer)
            continue;
        const subs = dispatcher.subscribe(actionName, (payload) => {
            state = reducer(state, payload);
        });
        subscriptions.push(subs);
    }
    function renderApp() {
        if (!parentEl || !(parentEl instanceof HTMLElement)) {
            throw new Error('Invalid parent element provided to renderApp()');
        }
        if (vdom)
            destroyDom(vdom);
        vdom = view(state, emit);
        mountDom(vdom, parentEl);
    }
    return {
        mount(_parentEl) {
            if (parentEl) {
                throw new Error('App is already mounted');
            }
            parentEl = _parentEl;
            renderApp();
        },
        unmount() {
            if (vdom) {
                destroyDom(vdom);
                vdom = null;
            }
            subscriptions.forEach((unsubscribe) => unsubscribe());
            subscriptions.length = 0;
        }
    };
}

export { createApp, h, hFragment, hString };
