import type { EventHandlers, EventHandler, EventName } from './h.types'
import { entries } from './utils/objects'

export const addEventListeners = (listeners: EventHandlers = {}, el: Element): EventHandlers => {
  const addedListeners: EventHandlers = {}

  entries(listeners).forEach(([eventName, handler]) => {
    if (handler && el) {
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

export const removeEventListeners = (listeners: EventHandlers = {}, el: HTMLElement): void => {
  entries(listeners).forEach(([eventName, listener]) => {
    if (listener) {
      el.removeEventListener(eventName, listener)
    }
  })
}