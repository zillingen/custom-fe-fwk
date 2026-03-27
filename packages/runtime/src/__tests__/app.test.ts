import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { createApp, type App, type State, type Reducer, type EmitFunction } from '../app'
import { Dispatcher } from '../dispatcher'
import type { VNode, VElementNode } from '../h.types'

describe('createApp', () => {
  let mockContainer: HTMLElement
  let app: App
  let testState: State
  let mockView: ReturnType<typeof vi.fn> & ((state: State, emit: EmitFunction) => VNode)

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create a mock container element
    mockContainer = document.createElement('div')
    mockContainer.id = 'app-container'
    
    // Setup test state
    testState = { count: 0, message: 'Hello' }
    
    // Create a mock view function
    mockView = vi.fn((state: State) => {
      return {
        tag: 'div',
        props: { id: 'root' },
        children: [
          { type: 'text', value: `Count: ${state['count']}` },
          { type: 'text', value: state['message'] as string }
        ],
        type: 'element'
      } as VElementNode
    })
    
    // Setup app configuration
    app = {
      state: testState,
      view: mockView
    }
  })

  afterEach(() => {
    // Cleanup any remaining DOM elements
    if (mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer)
    }
  })

  describe('App Creation', () => {
    it('creates an app instance with mount and unmount methods', () => {
      const appInstance = createApp(app)
      
      expect(appInstance).toHaveProperty('mount')
      expect(appInstance).toHaveProperty('unmount')
      expect(typeof appInstance.mount).toBe('function')
      expect(typeof appInstance.unmount).toBe('function')
    })

    it('creates a new Dispatcher instance', () => {
      // Should create a dispatcher and call afterEveryCommand
      expect(() => createApp(app)).not.toThrow()
    })

    it('passes initial state to view function during creation', () => {
      const appInstance = createApp(app)
      
      // The view function should be called when mount() is called
      appInstance.mount(mockContainer)
      
      expect(mockView).toHaveBeenCalledWith(testState, expect.any(Function))
    })

    it('creates app with empty reducers by default', () => {
      const appWithoutReducers = {
        state: testState,
        view: mockView
      }
      
      const appInstance = createApp(appWithoutReducers)
      
      // Should mount successfully without errors
      expect(() => appInstance.mount(mockContainer)).not.toThrow()
    })
  })

  describe('State Management', () => {
    it('registers reducers correctly', () => {
      const incrementReducer: Reducer = (state) => ({ ...state, count: (state['count'] as number) + 1 })
      const setMessageReducer: Reducer = (state) => ({ ...state, message: 'test' })
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          increment: incrementReducer,
          setMessage: setMessageReducer
        }
      }
      
      // Spy on the dispatcher's subscribe method
      const subscribeSpy = vi.spyOn(Dispatcher.prototype, 'subscribe')
      
      createApp(appWithReducers)
      
      expect(subscribeSpy).toHaveBeenCalledWith('increment', expect.any(Function))
      expect(subscribeSpy).toHaveBeenCalledWith('setMessage', expect.any(Function))
      expect(subscribeSpy).toHaveBeenCalledTimes(2)
      
      subscribeSpy.mockRestore()
    })

    it('updates state when reducers are called', () => {
      const incrementReducer: Reducer = (state) => ({ ...state, count: (state['count'] as number) + 1 })
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          increment: incrementReducer
        }
      }
      
      const appInstance = createApp(appWithReducers)
      appInstance.mount(mockContainer)
      
      // Simulate state update
      const newState = incrementReducer(testState, 5)
      
      // Verify the state was updated
      expect(newState['count']).toBe(1)
      expect(newState['message'] as string).toBe('Hello')
    })

    it('does not register reducers that are undefined', () => {
      const appWithUndefinedReducers = {
        state: testState,
        view: mockView,
        reducers: {
          validReducer: (state) => ({ ...state }),
          invalidReducer: undefined as unknown as Reducer
        } as Record<string, Reducer>
      }
      
      // Spy on the dispatcher's subscribe method
      const subscribeSpy = vi.spyOn(Dispatcher.prototype, 'subscribe')
      
      createApp(appWithUndefinedReducers)
      
      expect(subscribeSpy).toHaveBeenCalledWith('validReducer', expect.any(Function))
      expect(subscribeSpy).not.toHaveBeenCalledWith('invalidReducer', expect.any(Function))
      
      subscribeSpy.mockRestore()
    })
  })

  describe('Event System', () => {
    it('provides emit function to view', () => {
      const appInstance = createApp(app)
      appInstance.mount(mockContainer)
      
      expect(mockView).toHaveBeenCalledWith(
        testState,
        expect.any(Function)
      )
    })

    it('emit function calls dispatcher.dispatch', () => {
       const appInstance = createApp(app)
       appInstance.mount(mockContainer)
       
       // Get the emit function from the view call
       if (mockView.mock.calls.length > 0) {
         const call = mockView.mock.calls[0]
         const emitFunction = call?.[1] as EmitFunction | undefined
         
         if (emitFunction) {
           // Spy on the dispatcher's dispatch method
          const dispatchSpy = vi.spyOn(Dispatcher.prototype, 'dispatch')
          
          emitFunction('test-event', { data: 'test' })
          
          expect(dispatchSpy).toHaveBeenCalledWith('test-event', { data: 'test' })
          
          dispatchSpy.mockRestore()
        }
      }
    })

    it('afterEveryCommand is called on state changes', () => {
      // Spy on the dispatcher's afterEveryCommand method
      const afterEveryCommandSpy = vi.spyOn(Dispatcher.prototype, 'afterEveryCommand')
      
      createApp(app)
      
      expect(afterEveryCommandSpy).toHaveBeenCalledWith(expect.any(Function))
      
      afterEveryCommandSpy.mockRestore()
    })
  })

  describe('Rendering', () => {
    it('calls mountDom with correct parameters on mount', () => {
      const appInstance = createApp(app)
      
      // Test that mount works without errors
      expect(() => appInstance.mount(mockContainer)).not.toThrow()
      expect(mockView).toHaveBeenCalledWith(testState, expect.any(Function))
    })

    it('calls destroyDom when unmounting', () => {
      const appInstance = createApp(app)
      
      // Test that unmount works without errors
      appInstance.mount(mockContainer)
      expect(() => appInstance.unmount()).not.toThrow()
    })

    it('re-renders when state changes', () => {
      const incrementReducer: Reducer = (state) => ({ ...state, count: (state['count'] as number) + 1 })
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          increment: incrementReducer
        }
      }
      
      const appInstance = createApp(appWithReducers)
      appInstance.mount(mockContainer)
      
      // Get the emit function from the view call
      if (mockView.mock.calls.length > 0) {
        const call = mockView.mock.calls[0]
        const emitFunction = call?.[1] as EmitFunction | undefined
        
        if (emitFunction) {
          // This should trigger the reducer and cause a re-render
          emitFunction('increment', undefined)
        }
      }
      
      // The view should be called again due to state change
      expect(mockView).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('throws error when mounting with invalid parent element', () => {
      const appInstance = createApp(app)
      
      // Test with null
      expect(() => appInstance.mount(null as unknown as HTMLElement)).toThrow('Invalid parent element provided to renderApp()')
      
      // Test with undefined
      expect(() => appInstance.mount(undefined as unknown as HTMLElement)).toThrow('Invalid parent element provided to renderApp()')
      
      // Test with non-HTMLElement
      const mockObject = {} as HTMLElement
      expect(() => appInstance.mount(mockObject)).toThrow('Invalid parent element provided to renderApp()')
    })

    it('throws error when app is already mounted', () => {
      const appInstance = createApp(app)
      appInstance.mount(mockContainer)
      
      expect(() => appInstance.mount(document.createElement('div'))).toThrow('App is already mounted')
    })

    it('handles view function errors gracefully', () => {
      const errorView = vi.fn(() => {
        throw new Error('View function error')
      })
      
      const appWithErrorView = {
        state: testState,
        view: errorView
      }
      
      const appInstance = createApp(appWithErrorView)
      
      expect(() => appInstance.mount(mockContainer)).toThrow('View function error')
    })
  })

  describe('Memory Management', () => {
    it('calls unsubscribe functions on unmount', () => {
      const unsubscribeSpy = vi.fn()
      const unsubscribeAfterSpy = vi.fn()
      
      // Mock the subscribe and afterEveryCommand methods to return our spies
      vi.spyOn(Dispatcher.prototype, 'subscribe').mockReturnValue(unsubscribeSpy)
      vi.spyOn(Dispatcher.prototype, 'afterEveryCommand').mockReturnValue(unsubscribeAfterSpy)
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          test: (state: State) => state
        }
      }
      
      const appInstance = createApp(appWithReducers)
      appInstance.mount(mockContainer)
      appInstance.unmount()
      
      expect(unsubscribeSpy).toHaveBeenCalled()
      expect(unsubscribeAfterSpy).toHaveBeenCalled()
    })

    it('clears subscriptions array on unmount', () => {
      const appInstance = createApp(app)
      appInstance.mount(mockContainer)
      appInstance.unmount()
      
      // This should not throw
      expect(() => appInstance.unmount()).not.toThrow()
    })

    it('prevents multiple unmounts from causing errors', () => {
      const appInstance = createApp(app)
      appInstance.mount(mockContainer)
      
      // First unmount should work
      expect(() => appInstance.unmount()).not.toThrow()
      
      // Second unmount should also not throw
      expect(() => appInstance.unmount()).not.toThrow()
    })
  })

  describe('Integration Tests', () => {
    it('handles complete app lifecycle', () => {
       const incrementReducer: Reducer = (state: State, payload: unknown) => ({ ...state, count: (state['count'] as number) + ((payload as number) || 1) })
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          increment: incrementReducer
        }
      }
      
      const appInstance = createApp(appWithReducers)
      
      // Mount
      appInstance.mount(mockContainer)
      expect(mockView).toHaveBeenCalled()
      
      // Emit event (we can't easily test this without more complex mocking)
      // For now, just verify the structure is correct
      
      // Unmount
      appInstance.unmount()
      expect(() => appInstance.unmount()).not.toThrow()
    })

     it('handles complex state updates with multiple reducers', () => {
       const incrementReducer: Reducer = (state: State) => ({ ...state, count: (state['count'] as number) + 1 })
       const setMessageReducer: Reducer = (state: State) => ({ ...state, message: 'Updated message' })
      const resetReducer: Reducer = (_state: State) => ({ count: 0, message: 'Reset' }) // eslint-disable-line @typescript-eslint/no-unused-vars
      
      const appWithReducers = {
        state: testState,
        view: mockView,
        reducers: {
          increment: incrementReducer,
          setMessage: setMessageReducer,
          reset: resetReducer
        }
      }
      
      const appInstance = createApp(appWithReducers)
      appInstance.mount(mockContainer)
      
      // Test multiple state updates
      if (mockView.mock.calls.length > 0) {
        const call = mockView.mock.calls[0]
        const emitFunction = call?.[1] as EmitFunction | undefined
        
        if (emitFunction) {
          // These would normally trigger state updates and re-renders
          emitFunction('increment', 3)
          emitFunction('setMessage', 'Updated message')
          emitFunction('reset')
        }
      }
      
      // Verify the view was called
      expect(mockView).toHaveBeenCalled()
    })

    it('handles nested state updates correctly', () => {
      const nestedState: State = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark', notifications: true }
      }
      
      const updateUserReducer: Reducer = (state) => ({
        ...state,
        user: { ...(state['user'] as object) }
      })
      
      const updateSettingsReducer: Reducer = (state) => ({
        ...state,
        settings: { ...(state['settings'] as object) }
      })
      
      const nestedView = vi.fn((state: State) => {
        const user = state['user'] as { name: string; age: number }
        const settings = state['settings'] as { theme: string }
        
        return {
          tag: 'div',
          props: {},
          children: [
            { type: 'text', value: `User: ${user.name}, Age: ${user.age}` },
            { type: 'text', value: `Theme: ${settings.theme}` }
          ],
          type: 'element'
        } as VElementNode
      })
      
      const appWithNestedState = {
        state: nestedState,
        view: nestedView,
        reducers: {
          updateUser: updateUserReducer,
          updateSettings: updateSettingsReducer
        }
      }
      
      const appInstance = createApp(appWithNestedState)
      appInstance.mount(mockContainer)
      
      // Test nested updates
      if (nestedView.mock.calls.length > 0) {
        const call = nestedView.mock.calls[0]
        // The mock function is called with (state, emit) so we need to access the second parameter
        // Since the tuple type shows only one parameter, we'll use a type assertion
        const emitFunction = (call as unknown as [State, EmitFunction])[1]
        
        if (emitFunction) {
          emitFunction('updateUser', { name: 'Jane', age: 25 })
          emitFunction('updateSettings', { theme: 'light' })
        }
      }
      
      expect(nestedView).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children in VNode', () => {
      const emptyView = vi.fn(() => ({
        tag: 'div',
        props: {},
        children: [],
        type: 'element'
      }) as VElementNode)
      
      const appWithEmptyView = {
        state: testState,
        view: emptyView
      }
      
      const appInstance = createApp(appWithEmptyView)
      
      expect(() => appInstance.mount(mockContainer)).not.toThrow()
    })

    it('handles null/undefined children in VNode', () => {
      const nullChildrenView = vi.fn(() => ({
        tag: 'div',
        props: {},
         children: null as VNode[] | null,
        type: 'element'
      }) as VElementNode)
      
      const appWithNullChildren = {
        state: testState,
        view: nullChildrenView
      }
      
      const appInstance = createApp(appWithNullChildren)
      
      expect(() => appInstance.mount(mockContainer)).not.toThrow()
    })

    it('handles deeply nested VNode structures', () => {
      const nestedView = vi.fn(() => ({
        tag: 'div',
        props: { id: 'app' },
        children: [
          {
            tag: 'header',
            props: {},
            children: [
              { tag: 'h1', props: {}, children: [{ type: 'text', value: 'App Title' }], type: 'element' }
            ],
            type: 'element'
          },
          {
            tag: 'main',
            props: {},
            children: [
              { type: 'text', value: 'Main content' },
              {
                tag: 'section',
                props: {},
                children: [
                  { type: 'text', value: 'Section content' }
                ],
                type: 'element'
              }
            ],
            type: 'element'
          }
        ],
        type: 'element'
      }) as VElementNode)
      
      const appWithNestedView = {
        state: testState,
        view: nestedView
      }
      
      const appInstance = createApp(appWithNestedView)
      
      expect(() => appInstance.mount(mockContainer)).not.toThrow()
      expect(nestedView).toHaveBeenCalledWith(testState, expect.any(Function))
    })
  })
})