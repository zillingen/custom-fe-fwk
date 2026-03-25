export type Handler = (payload?: unknown) => void | undefined

export class Dispatcher {
  #subs = new Map<string, Handler[]>()
  #afterHandlers: Handler[] = []

  subscribe(commandName: string, handler: Handler): () => void {
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, [])
    }

    const handlers = this.#subs.get(commandName)!
    if (handlers.includes(handler)) {
      return () => {}
    }

    handlers.push(handler)

    return () => {
      const idx = handlers.indexOf(handler)

      handlers?.splice(idx, 1)
    }
  }

  afterEveryCommand(handler: Handler): () => void {
    this.#afterHandlers.push(handler)

    return () => {
      const idx = this.#afterHandlers.indexOf(handler)
      if (idx !== -1) {
        this.#afterHandlers.splice(idx, 1)
      }
    }
  }

  dispatch(commandName: string, payload: unknown): boolean {
    const handlers = this.#subs.get(commandName)

    if (handlers?.length) {
      handlers.forEach((handler) => handler(payload))
    } else {
      console.warn(`No handlers for command: ${commandName}`)
      return false
    }

    this.#afterHandlers.forEach((handler) => handler())
    return true
  }

  hasSubscribers(commandName: string): boolean {
    return this.#subs.has(commandName) && this.#subs.get(commandName)!.length > 0
  }

  getSubscriberCount(commandName: string): number {
    return this.#subs.get(commandName)?.length ?? 0
  }

  clear(): void {
    this.#subs.clear()
    this.#afterHandlers.length = 0
  }
}