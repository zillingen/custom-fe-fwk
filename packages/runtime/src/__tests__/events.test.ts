import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'
import { addEventListeners, removeEventListeners } from '../events'
import type { EventHandlers, EventHandler } from '../h.types'

describe('events', () => {
  let el: HTMLElement

  beforeEach(() => {
    el = document.createElement('button')
    document.body.appendChild(el)
  })

  afterEach(() => {
    document.body.removeChild(el)
  })

  describe('addEventListeners', () => {
    it('adds single event listener correctly', () => {
      const clickHandler = vi.fn()
      const listeners = { click: clickHandler }
      
      const addedListeners = addEventListeners(listeners, el)
      
      // Trigger the event
      el.click()
      
      expect(addedListeners).toEqual({ click: clickHandler })
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it('adds multiple event listeners correctly', () => {
      const clickHandler = vi.fn()
      const mouseoverHandler = vi.fn()
      const listeners = { 
        click: clickHandler,
        mouseover: mouseoverHandler 
      }
      
      const addedListeners = addEventListeners(listeners, el)
      
      // Trigger events
      el.click()
      el.dispatchEvent(new MouseEvent('mouseover'))
      
      expect(addedListeners).toEqual({ 
        click: clickHandler,
        mouseover: mouseoverHandler 
      })
      expect(clickHandler).toHaveBeenCalledTimes(1)
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('returns empty object when no listeners provided', () => {
      const addedListeners = addEventListeners({}, el)
      
      expect(addedListeners).toEqual({})
    })

    it('returns empty object when listeners is undefined', () => {
      const addedListeners = addEventListeners(undefined, el)
      
      expect(addedListeners).toEqual({})
    })

    it('handles null handler gracefully', () => {
      const listeners = { click: null }
      
      const addedListeners = addEventListeners(listeners, el)
      
      expect(addedListeners).toEqual({})
    })

    it('handles undefined handler gracefully', () => {
      const listeners = { click: undefined }
      
      const addedListeners = addEventListeners(listeners, el)
      
      expect(addedListeners).toEqual({})
    })

    it('handles null element gracefully', () => {
      const clickHandler = vi.fn()
      const listeners = { click: clickHandler }
      
      const addedListeners = addEventListeners(listeners, null as HTMLElement | null)
      
      expect(addedListeners).toEqual({})
    })

    it('adds custom event listeners correctly', () => {
      const customHandler = vi.fn()
      const listeners = { 'custom-event': customHandler } as EventHandlers
      
      const addedListeners = addEventListeners(listeners, el)
      
      // Trigger custom event
      el.dispatchEvent(new CustomEvent('custom-event'))
      
      expect(addedListeners).toEqual({ 'custom-event': customHandler })
      expect(customHandler).toHaveBeenCalledTimes(1)
    })

    it('adds event listeners with correct this context', () => {
      const thisHandler = function (this: HTMLElement) {
        expect(this).toBe(el)
      }
      
      const listeners = { click: thisHandler as unknown as EventHandler }
      
      addEventListeners(listeners, el)
      el.click()
    })
  })

  describe('removeEventListeners', () => {
    it('removes single event listener correctly', () => {
      const clickHandler = vi.fn()
      const listeners = { click: clickHandler }
      
      addEventListeners(listeners, el)
      removeEventListeners(listeners, el)
      
      // Trigger the event - should not call handler
      el.click()
      
      expect(clickHandler).not.toHaveBeenCalled()
    })

    it('removes multiple event listeners correctly', () => {
      const clickHandler = vi.fn()
      const mouseoverHandler = vi.fn()
      const listeners = { 
        click: clickHandler,
        mouseover: mouseoverHandler 
      }
      
      addEventListeners(listeners, el)
      removeEventListeners(listeners, el)
      
      // Trigger events - should not call handlers
      el.click()
      el.dispatchEvent(new MouseEvent('mouseover'))
      
      expect(clickHandler).not.toHaveBeenCalled()
      expect(mouseoverHandler).not.toHaveBeenCalled()
    })

    it('handles empty listeners object gracefully', () => {
      expect(() => removeEventListeners({}, el)).not.toThrow()
    })

    it('handles undefined listeners gracefully', () => {
      expect(() => removeEventListeners(undefined, el)).not.toThrow()
    })

    it('handles null listener gracefully', () => {
      const listeners = { click: null }
      
      expect(() => removeEventListeners(listeners, el)).not.toThrow()
    })

    it('handles undefined listener gracefully', () => {
      const listeners = { click: undefined }
      
      expect(() => removeEventListeners(listeners, el)).not.toThrow()
    })

    it('handles null element gracefully', () => {
      const clickHandler = vi.fn()
      const listeners = { click: clickHandler }
      
      expect(() => removeEventListeners(listeners, null as HTMLElement | null)).not.toThrow()
    })

    it('removes custom event listeners correctly', () => {
      const customHandler = vi.fn()
      const listeners = { 'custom-event': customHandler } as EventHandlers
      
      addEventListeners(listeners, el)
      removeEventListeners(listeners, el)
      
      // Trigger custom event - should not call handler
      el.dispatchEvent(new CustomEvent('custom-event'))
      
      expect(customHandler).not.toHaveBeenCalled()
    })

    it('removes only specified listeners', () => {
      const clickHandler = vi.fn()
      const mouseoverHandler = vi.fn()
      
      // Add both listeners
      el.addEventListener('click', clickHandler)
      el.addEventListener('mouseover', mouseoverHandler)
      
      // Remove only click listener
      removeEventListeners({ click: clickHandler }, el)
      
      // Only mouseover should still work
      el.click()
      el.dispatchEvent(new MouseEvent('mouseover'))
      
      expect(clickHandler).not.toHaveBeenCalled()
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('works with event listeners added manually', () => {
      const handler = vi.fn()
      
      // Add listener manually
      el.addEventListener('click', handler)
      
      // Remove using removeEventListeners
      removeEventListeners({ click: handler } as EventHandlers, el)
      
      // Should not call handler
      el.click()
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('integration', () => {
    it('adds and removes listeners in sequence correctly', () => {
      const handler = vi.fn()
      
      // Add listener
      const addedListeners = addEventListeners({ click: handler }, el)
      expect(addedListeners).toEqual({ click: handler })
      
      // Trigger event - should work
      el.click()
      expect(handler).toHaveBeenCalledTimes(1)
      
      // Remove listener
      removeEventListeners(addedListeners, el)
      
      // Trigger event again - should not work
      el.click()
      expect(handler).toHaveBeenCalledTimes(1) // Still 1
    })

    it('handles rapid add/remove cycles', () => {
      const handler = vi.fn()
      
      for (let i = 0; i < 3; i++) {
        const addedListeners = addEventListeners({ click: handler }, el)
        el.click()
        removeEventListeners(addedListeners, el)
      }
      
      expect(handler).toHaveBeenCalledTimes(3)
      
      // Final trigger should not work
      el.click()
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('works with different event types on same element', () => {
      const clickHandler = vi.fn()
      const keydownHandler = vi.fn()
      
      // Add different event types
      addEventListeners({ click: clickHandler }, el)
      addEventListeners({ keydown: keydownHandler }, el)
      
      // Trigger both
      el.click()
      el.dispatchEvent(new KeyboardEvent('keydown'))
      
      expect(clickHandler).toHaveBeenCalledTimes(1)
      expect(keydownHandler).toHaveBeenCalledTimes(1)
      
      // Remove only click
      removeEventListeners({ click: clickHandler }, el)
      
      // Only keydown should work
      el.click()
      el.dispatchEvent(new KeyboardEvent('keydown'))
      
      expect(clickHandler).toHaveBeenCalledTimes(1)
      expect(keydownHandler).toHaveBeenCalledTimes(2)
    })
  })
})