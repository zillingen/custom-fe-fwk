import { createApp, h, hString } from '../../packages/runtime/dist/fe-fwk.js'

const initialState = {
  count: 0,
}

const reducers = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),
}

const view = (state, emit) =>
  h('div', { class: 'counter' }, [
    h('h1', { class: 'counter__value' }, [hString(`${state.count}`)]),
    h('div', { class: 'counter__controls' }, [
      h('button', {
        class: 'counter__btn counter__btn--decrement',
        on: { click: () => emit('decrement') },
      }, [hString('-')]),
      h('button', {
        class: 'counter__btn counter__btn--increment',
        on: { click: () => emit('increment') },
      }, [hString('+')]),
    ]),
  ])

createApp({ state: initialState, view, reducers }).mount(
  document.getElementById('app')
)
