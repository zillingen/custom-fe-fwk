import { destroyDom } from './destroy-dom'
import { Dispatcher } from './dispatcher'
import type { VNode } from './h.types'
import { mountDom } from './mount-dom'

export type State = Record<string, unknown>
export type Reducer = (state: State, payload: unknown) => State

export interface App {
  state: State
  view: (state: State, emit: EmitFunction) => VNode
  reducers?: Record<string, Reducer>
}

export interface AppInstance {
  mount(parentEl: HTMLElement): void
  unmount(): void
}

export type EmitFunction = (eventName: string, payload?: unknown) => void

export function createApp({ state, view, reducers = {} }: App): AppInstance {
  let parentEl: HTMLElement | null = null
  let vdom: VNode | null = null

  const dispatcher = new Dispatcher()
  const subscriptions = [dispatcher.afterEveryCommand(renderApp)]

  function emit(eventName: string, payload?: unknown) {
    dispatcher.dispatch(eventName, payload)
  }

  for (const actionName in reducers) {
    const reducer = reducers[actionName]

    if (!reducer) continue

    const subs = dispatcher.subscribe(actionName, (payload) => {
      state = reducer(state, payload)
    })
    subscriptions.push(subs)
  }

  function renderApp() {
    if (!parentEl || !(parentEl instanceof HTMLElement)) {
      throw new Error('Invalid parent element provided to renderApp()')
    }

    if (vdom) destroyDom(vdom)

    vdom = view(state, emit)
    mountDom(vdom, parentEl)
  }

  return {
    mount(_parentEl: HTMLElement) {
      if (parentEl) {
       throw new Error('App is already mounted')
      }
      parentEl = _parentEl
      renderApp()
    },

    unmount() {
      if (vdom) {
        destroyDom(vdom)
        vdom = null
      }

      subscriptions.forEach((unsubscribe) => unsubscribe())
      subscriptions.length = 0
    }
  }
}