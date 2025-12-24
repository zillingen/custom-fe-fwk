import type { VNode, VNodeProps, VElementNode, VFragmentNode, VTextNode } from './h.types';
export declare const DOM_TYPES: {
    readonly TEXT: "text";
    readonly ELEMENT: "element";
    readonly FRAGMENT: "fragment";
};
export declare const h: (tag: keyof HTMLElementTagNameMap, props?: VNodeProps, children?: Array<VNode | string | null | undefined>) => VElementNode;
export declare const hString: (value: string) => VTextNode;
export declare const hFragment: (vNodes: Array<VNode | string | null | undefined>) => VFragmentNode;
//# sourceMappingURL=h.d.ts.map