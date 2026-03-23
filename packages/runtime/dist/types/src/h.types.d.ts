import { DOM_TYPES } from './h';
export type DOM_TYPES_TYPE = typeof DOM_TYPES[keyof typeof DOM_TYPES];
export type VNode = VElementNode | VTextNode | VFragmentNode;
export type EventName = keyof GlobalEventHandlersEventMap;
export type EventHandlers = Partial<{
    [K in EventName]: EventHandler | null | undefined;
}>;
export type VNodeProps = {
    on?: EventHandlers;
    class?: string | string[];
    [prop: string]: unknown;
};
export type EventHandler = (this: ThisParameterType<HTMLElement>, ...args: unknown[]) => unknown;
export type VElementNode = {
    tag: keyof HTMLElementTagNameMap;
    props?: VNodeProps;
    children?: VNode[];
    type: 'element';
    el?: HTMLElement;
    listeners?: EventHandlers;
};
export type VTextNode = {
    value: string;
    type: 'text';
    el?: Text;
};
export type VFragmentNode = {
    type: 'fragment';
    children: VNode[];
    el?: HTMLElement;
};
//# sourceMappingURL=h.types.d.ts.map