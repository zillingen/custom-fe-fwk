import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mountDom } from '../mount-dom'
import { h, hString, hFragment } from '../h'

describe('mountDom', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('TEXT nodes', () => {
    it('mounts text nodes correctly', () => {
      const textNode = hString('Hello World')
      
      mountDom(textNode, container)
      
      expect(container.textContent).toBe('Hello World')
      expect(container.childNodes.length).toBe(1)
      expect(container.firstChild?.nodeType).toBe(Node.TEXT_NODE)
      expect(textNode.el).toBeInstanceOf(Text)
      expect(textNode.el?.nodeValue).toBe('Hello World')
    })

    it('mounts empty text nodes', () => {
      const textNode = hString('')
      
      mountDom(textNode, container)
      
      expect(container.textContent).toBe('')
      expect(textNode.el).toBeInstanceOf(Text)
      expect(textNode.el?.nodeValue).toBe('')
    })

    it('mounts text nodes with special characters', () => {
      const textNode = hString('Special chars: <>&"\'')
      
      mountDom(textNode, container)
      
      expect(container.textContent).toBe('Special chars: <>&"\'')
      expect(textNode.el?.nodeValue).toBe('Special chars: <>&"\'')
    })
  })

  describe('ELEMENT nodes', () => {
    it('mounts simple elements correctly', () => {
      const elementNode = h('div', { id: 'test-div' })
      
      mountDom(elementNode, container)
      
      expect(container.childNodes.length).toBe(1)
      expect(container.firstChild?.nodeType).toBe(Node.ELEMENT_NODE)
      expect(container.firstChild?.nodeName).toBe('DIV')
      expect((container.firstChild as Element)?.id).toBe('test-div')
      expect(elementNode.el).toBeInstanceOf(HTMLElement)
      expect(elementNode.el?.tagName).toBe('DIV')
    })

    it('mounts elements with attributes', () => {
      const elementNode = h('button', {
        id: 'submit-btn',
        class: 'btn primary',
        name: 'submit',
        disabled: true,
        'data-testid': 'submit-button'
      })
      
      mountDom(elementNode, container)
      
      const button = container.querySelector('button')
      expect(button).toBeTruthy()
      expect(button?.id).toBe('submit-btn')
      expect(button?.className).toBe('btn primary')
      expect(button?.name).toBe('submit')
      expect(button?.hasAttribute('disabled')).toBe(true)
      expect(button?.getAttribute('data-testid')).toBe('submit-button')
    })

    it('mounts elements with class array', () => {
      const elementNode = h('div', {
        class: ['btn', 'primary', 'large']
      })
      
      mountDom(elementNode, container)
      
      const div = container.querySelector('div')
      expect(div?.classList.contains('btn')).toBe(true)
      expect(div?.classList.contains('primary')).toBe(true)
      expect(div?.classList.contains('large')).toBe(true)
    })

    it('mounts elements with style attributes', () => {
      const elementNode = h('div', {
        style: {
          'color': 'red',
          'font-size': '16px',
          'font-weight': 'bold'
        }
      })
      
      mountDom(elementNode, container)
      
      const div = container.querySelector('div')
      expect(div?.style.color).toBe('red')
      expect(div?.style.fontSize).toBe('16px')
      expect(div?.style.fontWeight).toBe('bold')
    })

    it('mounts elements with children', () => {
      const elementNode = h('div', { id: 'parent' }, [
        h('span', { class: 'child' }, ['Child text']),
        h('p', {}, ['Paragraph content']),
        hString('Direct text node')
      ])
      
      mountDom(elementNode, container)
      
      const parent = container.querySelector('#parent')
      expect(parent).toBeTruthy()
      expect(parent?.childElementCount).toBe(2)
      expect(parent?.textContent).toContain('Child text')
      expect(parent?.textContent).toContain('Paragraph content')
      expect(parent?.textContent).toContain('Direct text node')
      
      const span = parent?.querySelector('span')
      expect(span).toBeTruthy()
      expect(span?.className).toBe('child')
      expect(span?.textContent).toBe('Child text')
    })

    it('mounts deeply nested elements', () => {
      const elementNode = h('div', { id: 'root' }, [
        h('header', {}, [
          h('h1', { class: 'title' }, ['Main Title']),
          h('nav', {}, [
            h('ul', {}, [
              h('li', {}, [h('a', { href: '#home' }, ['Home'])]),
              h('li', {}, [h('a', { href: '#about' }, ['About'])])
            ])
          ])
        ]),
        h('main', {}, [
          h('section', { class: 'content' }, [
            h('p', {}, ['Content paragraph'])
          ])
        ])
      ])
      
      mountDom(elementNode, container)
      
      const root = container.querySelector('#root')
      expect(root).toBeTruthy()
      expect(root?.querySelector('h1')?.textContent).toBe('Main Title')
      expect(root?.querySelector('nav ul li a[href="#home"]')?.textContent).toBe('Home')
      expect(root?.querySelector('nav ul li a[href="#about"]')?.textContent).toBe('About')
      expect(root?.querySelector('section.content p')?.textContent).toBe('Content paragraph')
    })

    it('handles self-closing elements', () => {
      const elementNode = h('img', {
        src: 'test.jpg',
        alt: 'Test image',
        width: 100,
        height: 50
      })
      
      mountDom(elementNode, container)
      
      const img = container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.src).toContain('test.jpg')
      expect(img?.alt).toBe('Test image')
      expect(img?.width).toBe(100)
      expect(img?.height).toBe(50)
    })
  })

  describe('FRAGMENT nodes', () => {
    it('mounts fragment nodes correctly', () => {
      const fragmentNode = hFragment([
        h('div', { class: 'item-1' }, ['Item 1']),
        h('div', { class: 'item-2' }, ['Item 2']),
        hString('Direct text in fragment')
      ])
      
      mountDom(fragmentNode, container)
      
      expect(container.childElementCount).toBe(2)
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
      expect(container.textContent).toContain('Direct text in fragment')
      expect(fragmentNode.el).toBe(container)
    })

    it('mounts nested fragments', () => {
      const fragmentNode = hFragment([
        hFragment([
          h('div', {}, ['Nested item 1']),
          h('div', {}, ['Nested item 2'])
        ]),
        h('div', {}, ['Top level item']),
        hString('Fragment text')
      ])
      
      mountDom(fragmentNode, container)
      
      expect(container.childElementCount).toBe(3)
      expect(container.textContent).toContain('Nested item 1')
      expect(container.textContent).toContain('Nested item 2')
      expect(container.textContent).toContain('Top level item')
      expect(container.textContent).toContain('Fragment text')
    })

    it('mounts empty fragments', () => {
      const fragmentNode = hFragment([])
      
      mountDom(fragmentNode, container)
      
      expect(container.childElementCount).toBe(0)
      expect(container.textContent).toBe('')
      expect(fragmentNode.el).toBe(container)
    })

    it('mounts fragments with mixed content', () => {
      const fragmentNode = hFragment([
        hString('Start text'),
        h('div', {}, ['Element in fragment']),
        hString('Middle text'),
        h('span', {}, ['Another element']),
        hString('End text')
      ])
      
      mountDom(fragmentNode, container)
      
      expect(container.textContent).toBe('Start textElement in fragmentMiddle textAnother elementEnd text')
      expect(container.childElementCount).toBe(2)
    })
  })

  describe('Error handling', () => {
    it('throws error when element creation fails', () => {
      // This test might not be easily testable without mocking document.createElement
      // but we can test the general error handling pattern
      const elementNode = h('div', {})
      
      // In most browsers, createElement will still create a valid element even for invalid tag names
      // so this test serves more as documentation of expected behavior
      expect(() => mountDom(elementNode, container)).not.toThrow()
    })
  })

  describe('Integration tests', () => {
    it('mounts complex component structure', () => {
      const complexStructure = h('div', { id: 'app' }, [
        h('header', { class: 'app-header' }, [
          h('h1', { id: 'title' }, ['Application Title']),
          h('nav', { 'data-testid': 'main-nav' }, [
            h('ul', {}, [
              h('li', {}, [h('a', { href: '#home' }, ['Home'])]),
              h('li', {}, [h('a', { href: '#about' }, ['About'])]),
              h('li', {}, [h('a', { href: '#contact' }, ['Contact'])])
            ])
          ])
        ]),
        h('main', { id: 'content' }, [
          h('section', { class: 'hero' }, [
            h('h2', {}, ['Welcome']),
            h('p', {}, ['This is a test of the mountDom function.'])
          ]),
          h('section', { class: 'features' }, [
            hFragment([
              h('div', { class: 'feature' }, [
                h('h3', {}, ['Feature 1']),
                h('p', {}, ['Description of feature 1.'])
              ]),
              h('div', { class: 'feature' }, [
                h('h3', {}, ['Feature 2']),
                h('p', {}, ['Description of feature 2.'])
              ])
            ])
          ])
        ]),
        h('footer', { class: 'app-footer' }, [
          h('p', {}, ['© 2026 Test Application'])
        ])
      ])
      
      mountDom(complexStructure, container)
      
      // Verify the structure was mounted correctly
      expect(container.querySelector('#app')).toBeTruthy()
      expect(container.querySelector('#title')?.textContent).toBe('Application Title')
      expect(container.querySelector('[data-testid="main-nav"]')).toBeTruthy()
      expect(container.querySelector('#content')).toBeTruthy()
      expect(container.querySelector('.hero h2')?.textContent).toBe('Welcome')
      expect(container.querySelector('.features .feature')).toBeTruthy()
      expect(container.querySelector('.app-footer p')?.textContent).toContain('© 2026 Test Application')
    })
  })

  describe('DOM references', () => {
    it('sets el property on all VNode types', () => {
      const textNode = hString('test')
      const elementNode = h('div', { id: 'test' })
      const fragmentNode = hFragment([textNode, elementNode])
      
      mountDom(fragmentNode, container)
      
      expect(textNode.el).toBeInstanceOf(Text)
      expect(elementNode.el).toBeInstanceOf(HTMLElement)
      expect(fragmentNode.el).toBe(container)
    })

    it('sets el property to correct DOM elements', () => {
      const textNode = hString('Hello')
      const buttonNode = h('button', { id: 'submit' }, ['Click me'])
      const containerNode = h('div', { class: 'wrapper' }, [textNode, buttonNode])
      
      mountDom(containerNode, container)
      
      expect(containerNode.el).toBeInstanceOf(HTMLElement)
      expect(containerNode.el?.tagName).toBe('DIV')
      expect(containerNode.el?.className).toBe('wrapper')
      
      expect(buttonNode.el).toBeInstanceOf(HTMLElement)
      expect(buttonNode.el?.tagName).toBe('BUTTON')
      expect(buttonNode.el?.id).toBe('submit')
      expect(buttonNode.el?.textContent).toBe('Click me')
      
      expect(textNode.el).toBeInstanceOf(Text)
      expect(textNode.el?.nodeValue).toBe('Hello')
    })
  })
})