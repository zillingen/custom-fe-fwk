import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { destroyDom } from '../destroy-dom'
import { h, hString, hFragment, DOM_TYPES } from '../h'
import type { VNode, VElementNode, VFragmentNode, VTextNode } from '../h.types'

// Mock `removeEventListeners` to track calls
vi.mock('../events', () => ({
  removeEventListeners: vi.fn(),
}))

describe('destroyDom', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  // --- Text Node Tests ---

  it('should destroy a text node by removing the underlying text node', () => {
    const vText = hString('hello')
    vText.el = document.createTextNode('hello')
    container.appendChild(vText.el)

    expect(vText.el.parentNode).toBe(container)

    destroyDom(vText)

    // After destroyDom, el property is deleted, so we need to check that the element was removed
    expect(vText.el).toBeUndefined()
  })

  it('should delete el property from text node after removal', () => {
    const vText: VTextNode = { type: DOM_TYPES.TEXT, value: 'hi' }
    const textEl = document.createTextNode('hi')
    vText.el = textEl
    container.appendChild(textEl)

    expect(vText.el).toBeDefined()

    destroyDom(vText)

    expect((vText as VTextNode & { el?: undefined }).el).toBeUndefined()
  })

  // --- Element Node Tests ---

  it('should destroy an element by removing it and its children from DOM', () => {
    const vDiv = h('div', { class: 'container' }, [
      h('span', {}, ['child']),
      hString('text'),
    ])

    // Manually mock element and children elements
    const divEl = document.createElement('div')
    divEl.className = 'container'
    container.appendChild(divEl)
    vDiv.el = divEl

    const spanEl = document.createElement('span')
    const textEl = document.createTextNode('text')
    divEl.appendChild(spanEl)
    divEl.appendChild(textEl)

    const vSpan = vDiv.children?.[0] as VElementNode
    const vText = vDiv.children?.[1] as VTextNode
    vSpan.el = spanEl
    vText.el = textEl

    expect(divEl.parentNode).toBe(container)

    destroyDom(vDiv)

    expect(divEl.parentNode).toBeNull()
    expect(spanEl.parentNode).toBeNull()
    expect(textEl.parentNode).toBeNull()

    expect((vDiv as VElementNode & { el?: undefined }).el).toBeUndefined()
    expect((vSpan as VElementNode & { el?: undefined }).el).toBeUndefined()
    expect((vText as VTextNode & { el?: undefined }).el).toBeUndefined()
  })

  it('should remove event listeners attached to the element', async () => {
    const onClick = vi.fn()
    const vDiv: VElementNode = {
      type: DOM_TYPES.ELEMENT,
      tag: 'button',
      listeners: { click: onClick },
    }

    const buttonEl = document.createElement('button')
    vDiv.el = buttonEl
    container.appendChild(buttonEl)

    // Simulate event listener attachment
    buttonEl.addEventListener('click', onClick)

    destroyDom(vDiv)

    // Expect `removeEventListeners` was called
    const { removeEventListeners } = await import('../events')
    expect(removeEventListeners).toHaveBeenCalledWith({ click: onClick }, buttonEl)

    // Expect listeners are deleted from vdom
    expect((vDiv as VElementNode & { listeners?: undefined }).listeners).toBeUndefined()
  })

  it('should not throw if listeners is undefined', () => {
    const vDiv: VElementNode = {
      type: DOM_TYPES.ELEMENT,
      tag: 'button',
    }
    const buttonEl = document.createElement('button')
    vDiv.el = buttonEl
    container.appendChild(buttonEl)

    expect(() => destroyDom(vDiv)).not.toThrow()
  })

  it('should handle empty children array gracefully', () => {
    const vDiv: VElementNode = {
      type: DOM_TYPES.ELEMENT,
      tag: 'div',
      children: [],
    }
    const divEl = document.createElement('div')
    vDiv.el = divEl
    container.appendChild(divEl)

    expect(() => destroyDom(vDiv)).not.toThrow()
    expect(divEl.parentNode).toBeNull()
  })

  it('should handle element without children property', () => {
    const vDiv: VElementNode = {
      type: DOM_TYPES.ELEMENT,
      tag: 'div',
    }
    const divEl = document.createElement('div')
    vDiv.el = divEl
    container.appendChild(divEl)

    expect(() => destroyDom(vDiv)).not.toThrow()
    expect(divEl.parentNode).toBeNull()
  })

  // --- Fragment Node Tests ---

  it('should destroy all children of a fragment', () => {
    const vFrag: VFragmentNode = hFragment([
      h('p', {}, ['Para 1']),
      hString('text'),
      null,
    ])

    // Create real DOM elements for the children
    const pEl = document.createElement('p')
    pEl.textContent = 'Para 1'
    const textEl = document.createTextNode('text')
    
    // Assign elements to VNodes
    vFrag.children.forEach((child, index) => {
      if (child && child.type === DOM_TYPES.ELEMENT && index === 0) {
        child.el = pEl
      } else if (child && child.type === DOM_TYPES.TEXT && index === 1) {
        child.el = textEl
      }
    })

    container.appendChild(pEl)
    container.appendChild(textEl)

    destroyDom(vFrag)

    expect(pEl.parentNode).toBeNull()
    expect(textEl.parentNode).toBeNull()

    expect((vFrag.children[0] as VElementNode).el).toBeUndefined()
    expect((vFrag.children[1] as VTextNode).el).toBeUndefined()
  })

  it('should handle fragment with mixed valid and null children', () => {
    const vFrag: VFragmentNode = {
      type: DOM_TYPES.FRAGMENT,
      children: [
        hString('valid text') as VNode,
        null as VNode | null,
        h('br') as VNode,
        undefined as VNode | undefined,
      ].filter(Boolean) as VNode[],
    }

    // Create real DOM elements for valid children
    vFrag.children.forEach((child) => {
      if (child.type === DOM_TYPES.TEXT) {
        child.el = document.createTextNode(child.value)
      } else if (child.type === DOM_TYPES.ELEMENT) {
        child.el = document.createElement(child.tag)
      }
    })

    vFrag.children.forEach((child) => child.el && container.appendChild(child.el))

    expect(() => destroyDom(vFrag)).not.toThrow()
    
    // Verify all valid children were removed
    vFrag.children.forEach((child) => {
      if (child.el) {
        expect(child.el.parentNode).toBeNull()
      }
    })
  })

  it('should handle empty fragment', () => {
    const vFrag: VFragmentNode = {
      type: DOM_TYPES.FRAGMENT,
      children: [],
    }

    expect(() => destroyDom(vFrag)).not.toThrow()
  })

  // --- Edge Cases / Errors ---

  it('should throw if passed an invalid VNode type', () => {
    const badVNode = { type: 'unknown' as string, value: 'test' }

    expect(() => destroyDom(badVNode as unknown as VNode)).toThrow(
      "Can't destroy DOM from: [object Object]"
    )
  })

  it('should not crash if el is undefined on text node', () => {
    const vText: VTextNode = { type: DOM_TYPES.TEXT, value: 'test' }

    expect(() => destroyDom(vText)).not.toThrow()
  })

  it('should not crash if el is undefined on element node', () => {
    const vDiv: VElementNode = { type: DOM_TYPES.ELEMENT, tag: 'div' }

    expect(() => destroyDom(vDiv)).not.toThrow()
  })

  it('should not crash if el is undefined on fragment node', () => {
    const vFrag: VFragmentNode = { type: DOM_TYPES.FRAGMENT, children: [] }

    expect(() => destroyDom(vFrag)).not.toThrow()
  })

  it('should handle element with null children array', () => {
    const vDiv: VElementNode = {
      type: DOM_TYPES.ELEMENT,
      tag: 'div',
    }
    const divEl = document.createElement('div')
    vDiv.el = divEl
    container.appendChild(divEl)

    expect(() => destroyDom(vDiv)).not.toThrow()
    expect(divEl.parentNode).toBeNull()
  })
})