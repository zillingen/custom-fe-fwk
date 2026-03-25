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

      if (idx !== -1) {
        handlers.splice(idx, 1)
      }
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
      let hasError = false
      let error: unknown
      
      // Execute all handlers, catching errors but continuing
      // Use a copy of the array to handle cases where handlers unsubscribe during execution
      const handlersCopy = [...handlers]
      handlersCopy.forEach((handler) => {
        try {
          handler(payload)
        } catch (e) {
          hasError = true
          error = e
        }
      })
      
      // Always execute after handlers
      this.#afterHandlers.forEach((handler) => {
        try {
          handler()
        } catch {
          // After handler errors should not prevent other after handlers from running
          // but should be logged or handled appropriately
        }
      })
      
      // Re-throw the first error if any occurred
      if (hasError) {
        throw error
      }
    } else {
      console.warn(`No handlers for command: ${commandName}`)
      
      // Still execute after handlers even when no command handlers exist
      this.#afterHandlers.forEach((handler) => {
        try {
          handler()
        } catch {
          // After handler errors should not prevent other after handlers from running
          // but should be logged or handled appropriately
        }
      })
    }

    return Boolean(handlers?.length)
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