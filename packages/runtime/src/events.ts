import type { EventHandlers, EventHandler, EventName } from './h.types'
import { entries } from './utils/objects'

export const addEventListeners = (listeners: EventHandlers = {}, el: Element | null): EventHandlers => {
  const addedListeners: EventHandlers = {}

  if (!el) return addedListeners

  entries(listeners).forEach(([eventName, handler]) => {
    if (handler) {
      const listener = addEventListener(eventName, handler, el)
      addedListeners[eventName] = listener
    }
  })

  return addedListeners
}

const addEventListener = (eventName: EventName, handler: EventHandler, el: Element) => {
  el.addEventListener(eventName, handler)

  return handler
}

export const removeEventListeners = (listeners: EventHandlers = {}, el: HTMLElement | null): void => {
  if (!el) return
  
  entries(listeners).forEach(([eventName, listener]) => {
    if (listener) {
      el.removeEventListener(eventName, listener)
    }
  })
}