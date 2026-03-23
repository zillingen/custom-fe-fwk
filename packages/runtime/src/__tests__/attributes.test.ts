import { expect, describe, it, beforeEach } from 'vitest'
import { setAttributes } from '../attributes'

describe('setAttributes', () => {
  let el: HTMLElement

  beforeEach(() => {
    el = document.createElement('button')
  })

  describe('ID attribute', () => {
    it('sets id attribute correctly', () => {
      setAttributes(el, { id: 'submit_button' })
      expect(el.getAttribute('id')).toBe('submit_button')
    })

    it('deletes id attribute when set to null', () => {
      setAttributes(el, { id: 'submit_button' })
      expect(el.hasAttribute('id')).toBe(true)
      
      setAttributes(el, { id: null })
      expect(el.hasAttribute('id')).toBe(false)
    })
  })

  describe('Class attributes', () => {
    it('sets single class correctly', () => {
      setAttributes(el, { class: 'button-1' })
      expect(Object.values(el.classList)).toEqual(['button-1'])
    })

    it('sets multiple classes correctly', () => {
      setAttributes(el, { class: ['button-1', 'button--primary'] })
      expect(Object.values(el.classList)).toEqual(['button-1', 'button--primary'])
    })

    it('replaces existing classes when setting new ones', () => {
      el.className = 'existing-class'
      setAttributes(el, { class: 'new-class' })
      expect(Object.values(el.classList)).toEqual(['new-class'])
    })

    it('clears classes when set to empty array', () => {
      el.className = 'existing-class'
      setAttributes(el, { class: [] })
      expect(el.className).toBe('')
    })
  })

  describe('Style attributes', () => {
    it('sets inline styles correctly', () => {
      setAttributes(el, { style: { 'font-weight': 'bold' } })
      expect(el.style.fontWeight).toBe('bold')
    })

    it('sets multiple styles correctly', () => {
      setAttributes(el, { 
        style: { 
          'font-weight': 'bold',
          'color': 'red',
          'font-size': '16px'
        } 
      })
      expect(el.style.fontWeight).toBe('bold')
      expect(el.style.color).toBe('red')
      expect(el.style.fontSize).toBe('16px')
    })

    it('removes style properties when set to null', () => {
      el.style.color = 'red'
      setAttributes(el, { style: { 'color': null } })
      expect(el.style.color).toBe('')
    })
  })

  describe('Other attributes', () => {
    it('sets name attribute correctly', () => {
      setAttributes(el, { name: 'submit_button' })
      expect(el.getAttribute('name')).toBe('submit_button')
    })

    it('deletes attribute when set to null', () => {
      setAttributes(el, { name: 'submit_button' })
      expect(el.hasAttribute('name')).toBe(true)
      
      setAttributes(el, { name: null })
      expect(el.hasAttribute('name')).toBe(false)
    })

    it('sets boolean attributes correctly', () => {
      setAttributes(el, { disabled: true })
      expect(el.hasAttribute('disabled')).toBe(true)
      expect(el.getAttribute('disabled')).toBe('true')
    })

    it('removes boolean attributes when set to null', () => {
      el.setAttribute('disabled', 'true')
      setAttributes(el, { disabled: null })
      expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('sets numeric attributes correctly', () => {
      setAttributes(el, { tabindex: 0 })
      expect(el.getAttribute('tabindex')).toBe('0')
    })
  })

  describe('Edge cases', () => {
    it('handles empty attributes object', () => {
      expect(() => setAttributes(el, {})).not.toThrow()
      expect(el.getAttribute('id')).toBeNull()
    })

    it('handles undefined values gracefully', () => {
      setAttributes(el, { id: undefined })
      expect(el.getAttribute('id')).toBe('undefined')
    })

    it('handles zero values correctly', () => {
      setAttributes(el, { tabindex: 0 })
      expect(el.getAttribute('tabindex')).toBe('0')
    })

    it('handles empty string values correctly', () => {
      setAttributes(el, { id: '' })
      expect(el.getAttribute('id')).toBe('')
    })
  })
})
