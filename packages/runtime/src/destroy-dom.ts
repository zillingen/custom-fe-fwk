import { removeEventListeners } from './events'
import { DOM_TYPES } from './h';
import type { VElementNode, VFragmentNode, VNode, VTextNode } from './h.types';

export const destroyDom = (vdom: VNode): void => {
  const { type } = vdom

  switch (type) {
    case DOM_TYPES.TEXT:
      removeTextNode(vdom) 
      break;
    
    case DOM_TYPES.ELEMENT:
      removeElementNode(vdom)
      break;

    case DOM_TYPES.FRAGMENT:
      removeFragmentNodes(vdom)
      break

    default:
      throw new Error(` Can't destroy DOM from: ${vdom}`)
  }

  delete vdom.el
}

const removeTextNode = (vdom: VTextNode) => {
  const { el } = vdom
  el?.remove()
}

const removeElementNode = (vdom: VElementNode) => {
  const { el, children, listeners } = vdom

  el?.remove()
  children?.forEach(destroyDom)

  if (listeners && el) {
    removeEventListeners(listeners, el)
    delete vdom.listeners
  } 
}

const removeFragmentNodes = (vdom: VFragmentNode) => {
  const { children } = vdom
  children.forEach(destroyDom)
}
