import type { EventHandler } from './h.types'

export class Dispatcher {
  #subs = new Map<string, EventHandler[]>()
  #afterHandlers: EventHandler[] = []

  subscribe(commandName: string, handler: EventHandler): () => void {
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, [])
    }

    const handlers = this.#subs.get(commandName)
    if (handlers!.includes(handler)) {
      return () => {}
    }

    handlers!.push(handler)

    return () => {
      const idx = handlers!.indexOf(handler)

      handlers?.splice(idx, 1)
    }
  }

  afterEveryCommand(handler: EventHandler): () => void {
    this.#afterHandlers.push(handler)

    return () => {
      const idx = this.#afterHandlers.indexOf(handler)
      this.#afterHandlers.splice(idx, 1)
    }
  }

  dispatch(commandName: string, payload: unknown): void {
    if (this.#subs.has(commandName)) {
      this.#subs.get(commandName)?.forEach((handler) => handler(payload))
    } else {
      console.warn(`No handlers for command: ${commandName}`)
    }

    this.#afterHandlers.forEach((handler) => handler())
  }
}