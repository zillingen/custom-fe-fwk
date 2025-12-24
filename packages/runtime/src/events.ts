import type { EventHandlers, EventHandler, EventName } from './h.types'

export const addEventListeners = (listeners: EventHandlers = {}, el: HTMLElement): EventHandlers => {
  const addedListeners: EventHandlers = {}

  Object.entries(listeners).forEach(([eventName, handler]) => {
    if (handler) {
      const listener = addEventListener(eventName, handler, el)
      addedListeners[eventName] = listener
    }
  })

  return addedListeners
}

const addEventListener = (eventName: EventName, handler: EventHandler, el: HTMLElement) => {
  el.addEventListener(eventName, handler)

  return handler
}