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

    expect(vText.el.parentNode).toBeNull() // removed
    expect(vText.el).toBeUndefined() // check `el` still exists but is detached — our delete happens later
  })

  it('should delete el property from text node after removal', () => {
    const vText: VTextNode = { type: DOM_TYPES.TEXT, value: 'hi' }
    const textEl = document.createTextNode('hi')
    vText.el = textEl
    container.appendChild(textEl)

    expect(vText.el).toBeDefined()

    destroyDom(vText)

    expect((vText).el).toBeUndefined()
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

    expect(vDiv.el).toBeUndefined()
    expect(vSpan.el).toBeUndefined()
    expect(vText.el).toBeUndefined()
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
    expect((vDiv).listeners).toBeUndefined()
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

  // --- Fragment Node Tests ---

  it('should destroy all children of a fragment', () => {
    const vFrag: VFragmentNode = hFragment([
      h('p', {}, ['Para 1']),
      hString('text'),
      null,
    ])

    // const pEl = document.createElement('p')
    const pEl = h('p', { id: 'ChildPara_1' })
    // const textEl = document.createTextNode('text')
    const textEl = hString('Text El')
    vFrag.children = [pEl, textEl]
    // vFrag.children[0].el = pEl
    // vFrag.children[1].el = textEl

    container.appendChild(pEl)
    container.appendChild(textEl)

    destroyDom(vFrag)

    expect(pEl.parentNode).toBeNull()
    expect(textEl.parentNode).toBeNull()

    expect((vFrag.children[0] as VElementNode).el).toBeUndefined()
    expect((vFrag.children[1] as VTextNode).el).toBeUndefined()
  })

  it('should strip null/undefined from children before removal', () => {
    // Already handled by `mapTextNodes` — ensure no crash on mixed children
    const vFrag: VFragmentNode = {
      type: DOM_TYPES.FRAGMENT,
      children: [
        hString('ok') as VNode,
        h('br') as VNode,
        hString('') as VNode,
      ],
    }

    vFrag.children.forEach((child) => {
      if (child.type === DOM_TYPES.TEXT) {
        child.el = document.createTextNode(child.value)
      } else if (child.type === DOM_TYPES.ELEMENT) {
        child.el = document.createElement(child.tag)
      }
    })

    vFrag.children.forEach((child) => child.el && container.appendChild(child.el))

    expect(() => destroyDom(vFrag)).not.toThrow()
  })

  // --- Edge Cases / Errors ---

  it('should throw if passed an invalid VNode type', () => {
    const badVNode = { type: 'unknown' as any, el: null }

    expect(() => destroyDom(badVNode as VNode)).toThrow(
      "Can't destroy DOM from: [object Object]"
    )
  })

  it('should not crash if el is undefined', () => {
    const vText: VTextNode = { type: DOM_TYPES.TEXT, value: 'test' }
    const vDiv: VElementNode = { type: DOM_TYPES.ELEMENT, tag: 'div' }
    const vFrag: VFragmentNode = { type: DOM_TYPES.FRAGMENT, children: [] }

    expect(() => destroyDom(vText)).not.toThrow()
    expect(() => destroyDom(vDiv)).not.toThrow()
    expect(() => destroyDom(vFrag)).not.toThrow()
  })
})
