import { destroyDom } from './destroy-dom'
import { Dispatcher } from './dispatcher'
import type { VNode } from './h.types'
import { mountDom } from './mount-dom'

export type State = Record<string, unknown>
export type Reducer = (state: State, payload: unknown) => State

export interface App {
  state: State
  view: (state: Record<string, unknown>) => VNode
  reducers: Record<string, Reducer>
}

export function createApp({ state, view, reducers = {} }: App) {
  let parentEl: HTMLElement | null = null
  let vdom: VNode | null = null

  const dispatcher = new Dispatcher()
  const subscriptions = [dispatcher.afterEveryCommand(renderApp)]

  function emit(eventName: string, payload: unknown) {
    dispatcher.dispatch(eventName, payload)
  }

  for (const actionName in reducers) {
    const reducer = reducers[actionName]

    const subs = dispatcher.subscribe(actionName, (payload) => {
      state = reducer(state, payload)
    })
    subscriptions.push(subs)
  }

  function renderApp() {
    if (vdom) {
      destroyDom(vdom)
    }

    vdom = view(state, emit)
    mountDom(vdom, parentEl)
  }

  return {
    mount(_parentEl) {
      parentEl = _parentEl
      renderApp()
    },

    unmount() {
      destroyDom(vdom)
      vdom = null
      subscriptions.forEach((unsubscribe) => unsubscribe())
    }
  }
}