import { setAttributes } from './attributes';
import { addEventListeners } from './events';
import { DOM_TYPES } from './h';
import type { VNodeProps, VElementNode, VFragmentNode, VNode, VTextNode } from './h.types';

export const mountDom = (vdom: VNode, parentEl: HTMLElement): void => {
  switch (vdom.type) {
    case DOM_TYPES.TEXT:
      createTextNode(vdom, parentEl) 
      break
    case DOM_TYPES.ELEMENT:
      createElementNode(vdom, parentEl)
      break
    case DOM_TYPES.FRAGMENT:
      createFragmentNodes(vdom, parentEl)
      break
    default:
      throw new Error(`Can't mount DOM from: ${vdom}`)
  }
}

const createTextNode = (node: VTextNode, parentEl: HTMLElement) => {
  const { value } = node

  const textNode = document.createTextNode(value)
  node.el = textNode

  parentEl.append(textNode)
}

const createFragmentNodes = (vdom: VFragmentNode, parentEl: HTMLElement) => {
  const { children } = vdom
  vdom.el = parentEl

  children.forEach((child) => mountDom(child, parentEl))
}

const createElementNode = (vdom: VElementNode, parentEl: HTMLElement) => {
  const { tag, props, children } = vdom

  const element = document.createElement(tag)
  if (!element) {
    throw new Error(`Can't create element for ${tag}`)
  }
  addProps(element, props, vdom)
  vdom.el = element

  children?.forEach((child) => mountDom(child, element))
  parentEl.append(element)
}

const addProps = (el: HTMLElement, props: VNodeProps = {}, vdom: VElementNode) => {
  const { on: events, ...attrs } = props

  vdom.listeners = addEventListeners(events, el) 
  setAttributes(el, attrs)
}
