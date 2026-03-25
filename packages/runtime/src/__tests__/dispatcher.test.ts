import { expect, describe, it, beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { Dispatcher, type Handler } from '../dispatcher'

describe('Dispatcher', () => {
  let dispatcher: Dispatcher
  let handler1: Handler
  let handler2: Handler
  let afterHandler: Handler

  beforeEach(() => {
    dispatcher = new Dispatcher()
    handler1 = vi.fn()
    handler2 = vi.fn()
    afterHandler = vi.fn()
  })

  afterEach(() => {
    dispatcher.clear()
  })

  describe('subscribe', () => {
    describe('Basic Subscription', () => {
      it('subscribes a handler to a command', () => {
        const unsubscribe = dispatcher.subscribe('test-command', handler1)
        
        expect(dispatcher.hasSubscribers('test-command')).toBe(true)
        expect(dispatcher.getSubscriberCount('test-command')).toBe(1)
        
        unsubscribe()
        expect(dispatcher.hasSubscribers('test-command')).toBe(false)
        expect(dispatcher.getSubscriberCount('test-command')).toBe(0)
      })

      it('subscribes multiple handlers to the same command', () => {
        dispatcher.subscribe('test-command', handler1)
        dispatcher.subscribe('test-command', handler2)
        
        expect(dispatcher.hasSubscribers('test-command')).toBe(true)
        expect(dispatcher.getSubscriberCount('test-command')).toBe(2)
      })

      it('prevents duplicate handlers for the same command', () => {
        dispatcher.subscribe('test-command', handler1)
        dispatcher.subscribe('test-command', handler1)
        
        expect(dispatcher.getSubscriberCount('test-command')).toBe(1)
      })

      it('subscribes handlers to different commands', () => {
        dispatcher.subscribe('command1', handler1)
        dispatcher.subscribe('command2', handler2)
        
        expect(dispatcher.hasSubscribers('command1')).toBe(true)
        expect(dispatcher.hasSubscribers('command2')).toBe(true)
        expect(dispatcher.getSubscriberCount('command1')).toBe(1)
        expect(dispatcher.getSubscriberCount('command2')).toBe(1)
      })

      it('returns unsubscribe function that removes handler', () => {
        const unsubscribe = dispatcher.subscribe('test-command', handler1)
        
        dispatcher.dispatch('test-command', 'payload1')
        expect(handler1).toHaveBeenCalledWith('payload1')
        
        unsubscribe()
        
        dispatcher.dispatch('test-command', 'payload2')
        expect(handler1).toHaveBeenCalledTimes(1)
      })

      it('calling unsubscribe multiple times does not cause errors', () => {
        const unsubscribe = dispatcher.subscribe('test-command', handler1)
        
        unsubscribe()
        expect(() => unsubscribe()).not.toThrow()
      })
    })

    describe('Memory Leak Prevention', () => {
      it('prevents memory leaks when unsubscribing handlers multiple times', () => {
        const handler = vi.fn()
        const unsubscribe = dispatcher.subscribe('test-command', handler)
        
        // Unsubscribe multiple times
        unsubscribe()
        unsubscribe()
        unsubscribe()
        
        dispatcher.dispatch('test-command', 'payload')
        expect(handler).not.toHaveBeenCalled()
      })

      it('handles unsubscribe during dispatch gracefully', () => {
        const unsubscribe = dispatcher.subscribe('test-command', () => {
          // Unsubscribe during execution
          unsubscribe()
          handler1('payload')
        })

        dispatcher.dispatch('test-command', 'payload')
        expect(handler1).toHaveBeenCalledWith('payload')
      })
    })
  })

  describe('Handler Execution Behavior', () => {
    describe('Execution Order', () => {
      it('executes handlers in subscription order (FIFO)', () => {
        const order: string[] = []
        const orderedHandler1 = vi.fn(() => { order.push('first'); return undefined })
        const orderedHandler2 = vi.fn(() => { order.push('second'); return undefined })
        const orderedHandler3 = vi.fn(() => { order.push('third'); return undefined })

        dispatcher.subscribe('test-command', orderedHandler1)
        dispatcher.subscribe('test-command', orderedHandler2)
        dispatcher.subscribe('test-command', orderedHandler3)

        dispatcher.dispatch('test-command', 'payload')

        expect(order).toEqual(['first', 'second', 'third'])
      })
    })

    describe('Error Handling', () => {
      it('continues executing other handlers when one throws an error', () => {
        const handler1 = vi.fn()
        const erroringHandler = vi.fn(() => {
          throw new Error('Handler error')
        })
        const handler3 = vi.fn()

        dispatcher.subscribe('test-command', handler1)
        dispatcher.subscribe('test-command', erroringHandler)
        dispatcher.subscribe('test-command', handler3)

        expect(() => dispatcher.dispatch('test-command', 'payload')).toThrow('Handler error')
        
        expect(handler1).toHaveBeenCalledWith('payload')
        expect(handler3).toHaveBeenCalledWith('payload') // Should still execute
      })

      it('handles errors in after handlers gracefully', () => {
        const commandHandler = vi.fn()
        const erroringAfterHandler = vi.fn(() => {
          throw new Error('After handler error')
        })

        dispatcher.subscribe('test-command', commandHandler)
        dispatcher.afterEveryCommand(erroringAfterHandler)

        // Command should still execute successfully despite after handler error
        const result = dispatcher.dispatch('test-command', 'payload')
        expect(result).toBe(true)
        expect(commandHandler).toHaveBeenCalledWith('payload')
      })
    })
  })

  describe('afterEveryCommand', () => {
    it('subscribes an after handler', () => {
      const unsubscribe = dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.dispatch('test-command', 'payload')
      
      expect(afterHandler).toHaveBeenCalledTimes(1)
      expect(afterHandler).toHaveBeenCalledWith()
      
      unsubscribe()
      
      dispatcher.dispatch('test-command', 'payload2')
      expect(afterHandler).toHaveBeenCalledTimes(1)
    })

    it('subscribes multiple after handlers', () => {
      const unsubscribe1 = dispatcher.afterEveryCommand(afterHandler)
      const unsubscribe2 = dispatcher.afterEveryCommand(handler1)
      
      dispatcher.dispatch('test-command', 'payload')
      
      expect(afterHandler).toHaveBeenCalledWith()
      expect(handler1).toHaveBeenCalledWith()
      
      unsubscribe1()
      unsubscribe2()
    })

    it('returns unsubscribe function that removes after handler', () => {
      const unsubscribe = dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.dispatch('test-command', 'payload1')
      expect(afterHandler).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      
      dispatcher.dispatch('test-command', 'payload2')
      expect(afterHandler).toHaveBeenCalledTimes(1)
    })

    it('executes after handlers even when no command handlers exist', () => {
      dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.dispatch('nonexistent-command', 'payload')
      
      expect(afterHandler).toHaveBeenCalledWith()
    })
  })

  describe('dispatch', () => {
    it('dispatches to subscribed handlers with payload', () => {
      dispatcher.subscribe('test-command', handler1)
      dispatcher.subscribe('test-command', handler2)
      
      const result = dispatcher.dispatch('test-command', 'test-payload')
      
      expect(result).toBe(true)
      expect(handler1).toHaveBeenCalledWith('test-payload')
      expect(handler2).toHaveBeenCalledWith('test-payload')
    })

    it('dispatches without payload', () => {
      dispatcher.subscribe('test-command', handler1)
      
      const result = dispatcher.dispatch('test-command', undefined)
      
      expect(result).toBe(true)
      expect(handler1).toHaveBeenCalledWith(undefined)
    })

    it('returns false when no handlers are subscribed', () => {
      // Mock console.warn to capture the call
      const originalWarn = console.warn
      const mockWarn = vi.fn()
      console.warn = mockWarn
      
      const result = dispatcher.dispatch('nonexistent-command', 'payload')
      
      expect(result).toBe(false)
      expect(mockWarn).toHaveBeenCalledWith('No handlers for command: nonexistent-command')
      
      // Restore console.warn
      console.warn = originalWarn
    })

    it('executes after handlers after command handlers', () => {
      dispatcher.subscribe('test-command', handler1)
      dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.dispatch('test-command', 'payload')
      
      expect(handler1).toHaveBeenCalledWith('payload')
      expect(afterHandler).toHaveBeenCalledWith()
    })

    it('executes after handlers even when command handlers throw', () => {
      const erroringHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      
      dispatcher.subscribe('test-command', erroringHandler)
      dispatcher.afterEveryCommand(afterHandler)
      
      expect(() => dispatcher.dispatch('test-command', 'payload')).toThrow('Handler error')
      expect(afterHandler).toHaveBeenCalledWith()
    })
  })

  describe('hasSubscribers', () => {
    it('returns true when command has subscribers', () => {
      dispatcher.subscribe('test-command', handler1)
      
      expect(dispatcher.hasSubscribers('test-command')).toBe(true)
    })

    it('returns false when command has no subscribers', () => {
      expect(dispatcher.hasSubscribers('nonexistent-command')).toBe(false)
    })

    it('returns false when all subscribers are unsubscribed', () => {
      const unsubscribe = dispatcher.subscribe('test-command', handler1)
      unsubscribe()
      
      expect(dispatcher.hasSubscribers('test-command')).toBe(false)
    })
  })

  describe('getSubscriberCount', () => {
    it('returns correct count for command with subscribers', () => {
      dispatcher.subscribe('test-command', handler1)
      dispatcher.subscribe('test-command', handler2)
      
      expect(dispatcher.getSubscriberCount('test-command')).toBe(2)
    })

    it('returns 0 for command with no subscribers', () => {
      expect(dispatcher.getSubscriberCount('nonexistent-command')).toBe(0)
    })

    it('returns 0 after all subscribers are unsubscribed', () => {
      const unsubscribe1 = dispatcher.subscribe('test-command', handler1)
      const unsubscribe2 = dispatcher.subscribe('test-command', handler2)
      
      unsubscribe1()
      unsubscribe2()
      
      expect(dispatcher.getSubscriberCount('test-command')).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all subscribers and after handlers', () => {
      dispatcher.subscribe('command1', handler1)
      dispatcher.subscribe('command2', handler2)
      dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.clear()
      
      expect(dispatcher.hasSubscribers('command1')).toBe(false)
      expect(dispatcher.hasSubscribers('command2')).toBe(false)
      expect(dispatcher.getSubscriberCount('command1')).toBe(0)
      expect(dispatcher.getSubscriberCount('command2')).toBe(0)
      
      dispatcher.dispatch('command1', 'payload')
      dispatcher.dispatch('command2', 'payload')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(afterHandler).not.toHaveBeenCalled()
    })

    it('does not affect previously returned unsubscribe functions', () => {
      const unsubscribe1 = dispatcher.subscribe('command1', handler1)
      const unsubscribe2 = dispatcher.subscribe('command2', handler2)
      
      dispatcher.clear()
      
      expect(() => unsubscribe1()).not.toThrow()
      expect(() => unsubscribe2()).not.toThrow()
    })
  })

  describe('multiple dispatches', () => {
    it('handles multiple dispatches to same command', () => {
      dispatcher.subscribe('test-command', handler1)
      
      dispatcher.dispatch('test-command', 'payload1')
      dispatcher.dispatch('test-command', 'payload2')
      dispatcher.dispatch('test-command', 'payload3')
      
      expect(handler1).toHaveBeenCalledTimes(3)
      expect(handler1).toHaveBeenNthCalledWith(1, 'payload1')
      expect(handler1).toHaveBeenNthCalledWith(2, 'payload2')
      expect(handler1).toHaveBeenNthCalledWith(3, 'payload3')
    })

    it('handles multiple dispatches with after handlers', () => {
      dispatcher.subscribe('test-command', handler1)
      dispatcher.afterEveryCommand(afterHandler)
      
      dispatcher.dispatch('test-command', 'payload1')
      dispatcher.dispatch('test-command', 'payload2')
      
      expect(handler1).toHaveBeenCalledTimes(2)
      expect(afterHandler).toHaveBeenCalledTimes(2)
    })
  })

  describe('handler return values', () => {
    it('handlers can return values (ignored by dispatcher)', () => {
      const returningHandler = vi.fn((): void => {
        return 'return-value' as unknown as void
      })
      
      dispatcher.subscribe('test-command', returningHandler)
      dispatcher.dispatch('test-command', 'payload')
      
      expect(returningHandler).toHaveBeenCalledWith('payload')
    })

    it('handlers can return undefined', () => {
      const undefinedHandler = vi.fn((): void => {
        return undefined
      })
      
      dispatcher.subscribe('test-command', undefinedHandler)
      dispatcher.dispatch('test-command', 'payload')
      
      expect(undefinedHandler).toHaveBeenCalledWith('payload')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles many handlers efficiently', () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn())
      
      handlers.forEach(handler => {
        dispatcher.subscribe('bulk-command', handler)
      })

      const start = performance.now()
      dispatcher.dispatch('bulk-command', 'payload')
      const end = performance.now()

      expect(handlers.every(h => h.mock.calls.length === 1)).toBe(true)
      expect(end - start).toBeLessThan(100) // Should complete within 100ms
    })

    it('handles subscription changes during dispatch', () => {
      const handler1 = vi.fn(() => {
        // Subscribe a new handler during execution
        dispatcher.subscribe('test-command', handler2)
      })

      dispatcher.subscribe('test-command', handler1)
      dispatcher.dispatch('test-command', 'payload')

      expect(handler1).toHaveBeenCalledWith('payload')
      // handler2 was subscribed during dispatch, so shouldn't execute this time
      expect(handler2).not.toHaveBeenCalled()
    })

    it('handles unsubscription during dispatch', () => {
      // eslint-disable-next-line prefer-const
      let unsubscribe: () => void
      
      const handler1 = vi.fn(() => {
        // Unsubscribe during execution
        unsubscribe()
      })

      unsubscribe = dispatcher.subscribe('test-command', handler1)
      dispatcher.subscribe('test-command', handler2)

      dispatcher.dispatch('test-command', 'payload')

      expect(handler1).toHaveBeenCalledWith('payload')
      expect(handler2).toHaveBeenCalledWith('payload') // Should still execute
    })
  })

  describe('Integration Tests', () => {
    it('supports realistic application workflow', () => {
      // Setup application commands
      const logHandler = vi.fn()
      const errorHandler = vi.fn()
      const cleanupHandler = vi.fn()

      // Subscribe to various commands
      dispatcher.subscribe('user:login', (user) => logHandler(`User ${user} logged in`))
      dispatcher.subscribe('user:logout', (user) => logHandler(`User ${user} logged out`))
      dispatcher.subscribe('app:error', errorHandler)
      
      // Add cleanup on every command
      dispatcher.afterEveryCommand(cleanupHandler)

      // Execute workflow
      dispatcher.dispatch('user:login', 'alice')
      dispatcher.dispatch('user:logout', 'alice')

      expect(logHandler).toHaveBeenCalledTimes(2)
      expect(logHandler).toHaveBeenNthCalledWith(1, 'User alice logged in')
      expect(logHandler).toHaveBeenNthCalledWith(2, 'User alice logged out')
      expect(cleanupHandler).toHaveBeenCalledTimes(2)
    })

    it('handles complex command routing with multiple handlers per command', () => {
      const auditHandler = vi.fn()
      const notificationHandler = vi.fn()
      const analyticsHandler = vi.fn()

      // Subscribe different systems to the same commands
      dispatcher.subscribe('transaction:create', auditHandler)
      dispatcher.subscribe('transaction:create', notificationHandler)
      dispatcher.subscribe('transaction:create', analyticsHandler)
      
      dispatcher.subscribe('transaction:complete', auditHandler)
      dispatcher.subscribe('transaction:complete', analyticsHandler)

      // Dispatch commands
      dispatcher.dispatch('transaction:create', { id: 1, amount: 100 })
      dispatcher.dispatch('transaction:complete', { id: 1, status: 'completed' })

      // Verify all handlers were called appropriately
      expect(auditHandler).toHaveBeenCalledTimes(2)
      expect(notificationHandler).toHaveBeenCalledTimes(1)
      expect(analyticsHandler).toHaveBeenCalledTimes(2)
    })
  })
})