import { withoutNulls } from './utils/arrays'
import type { VNode, VNodeProps, VElementNode, VFragmentNode, VTextNode } from './h.types';

export const DOM_TYPES = {
  TEXT: 'text',
  ELEMENT: 'element',
  FRAGMENT: 'fragment',
} as const;

export const h = (
  tag: keyof HTMLElementTagNameMap,
  props: VNodeProps = {},
  children: Array<VNode | string | null | undefined> = []
): VElementNode => {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT
  }
};

const mapTextNodes = (children: Array<VNode | string>): VNode[] =>
  children.map((child) => typeof child === 'string' ? hString(child) : child) 

export const hString = (value: string): VTextNode => ({ type: DOM_TYPES.TEXT, value })

export const hFragment = (vNodes: Array<VNode | string | null | undefined>): VFragmentNode => ({
  type: DOM_TYPES.FRAGMENT,
  children: mapTextNodes(withoutNulls(vNodes))
})