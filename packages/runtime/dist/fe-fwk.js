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

const setAttributes = (el, attrs) => {
    const { class: className, style, ...otherAttrs } = attrs;
    if (className) {
        setClass(el, className);
    }
    if (style) {
        Object.entries((style)).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value);
    }
    // ...
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
/*
const removeStyle = (el: HTMLElement, name: string) => {
  el.style.setProperty(name, null)
}
  */
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

const addEventListeners = (listeners = {}, el) => {
    const addedListeners = {};
    Object.entries(listeners).forEach(([eventName, handler]) => {
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

const lipsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Curabitur mauris purus, ornare ut ullamcorper ut, suscipit et erat. 
  Mauris vulputate metus lobortis pulvinar mollis. 
  Vestibulum vel convallis lacus. Maecenas porta.`;
const lipsum = (len = 1) => Array.from({ length: len }).fill(hString(lipsumText));

console.log('This will soon be a frontend framework!');
const vdom = h('form', { class: 'login_form', action: 'login', children: [
        h('input', { type: 'text', name: 'user' }),
        h('input', { type: 'password', name: 'pass' }),
        h('button', { on: { click: () => console.log('login') } }, ['Login'])
    ] });
const exVdom = hFragment([
    h('h1', { class: 'title' }, ['My counter']),
    h('div', { class: 'container' }, [
        h('button', {}, ['Decrement']),
        h('span', {}, ['0']),
        h('button', {}, ['Increment']),
    ])
]);
console.log('vdom:', vdom);
console.log('exVdom:', exVdom);
const blog = h('div', { class: 'blog-vdom blog--v0.0.1', 'data-testid': 'blog-wrapper' }, [
    h('h1', { class: 'title title-s1' }, ['My news blog']),
    h('section', { class: 'blog-list-section', 'data-testid': 'blog-list' }, [
        h('p', { class: 'post' }, [lipsum(1).at(0)])
    ])
]);
const el = document.querySelector('.ContentWrapper-module__contentContainer--AGolz');
if (el) {
    mountDom(blog, el);
}
