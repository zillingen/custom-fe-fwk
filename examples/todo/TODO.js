import { createApp, h, hFragment } from '../../packages/runtime/dist/fe-fwk.js'

const MIN_TODO_LENGTH = 3

const REDUCER_TYPES = Object.freeze({
  UPDATE_CURRENT_TODO: 'update-current-todo',
  ADD_TODO: 'add-todo',
  START_EDITING_TODO: 'start-editing-todo',
  EDIT_TODO: 'edit-todo',
  SAVE_EDITED_TODO: 'save-edited-todo',
  CANCEL_EDITING_TODO: 'cancel-editing-todo',
  REMOVE_TODO: 'remove-todo',
})

const state = {
  currentTodo: '',
  edit: {
    idx: null,
    original: null,
    edited: null
  },
  TODO: ['Walk the dog', 'Water the plants']
}

const reducers = {
  [REDUCER_TYPES.UPDATE_CURRENT_TODO]: (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),

  [REDUCER_TYPES.ADD_TODO]: (state) => ({
    ...state,
    currentTodo: '',
    TODO: [...state.TODO, state.currentTodo.trim()],
  }),

  [REDUCER_TYPES.START_EDITING_TODO]: (state, idx) => ({
    ...state,
    edit: {
      idx,
      original: state.TODO[idx],
      edited: state.TODO[idx],
    }
  }),

  [REDUCER_TYPES.EDIT_TODO]: (state, edited) => ({
    ...state,
    edit: {
      ...state.edit, edited,
    },
  }),

  [REDUCER_TYPES.SAVE_EDITED_TODO]: (state) => {
    const trimmed = state.edit.edited.trim()
    if (trimmed.length === 0) {
      return {
        ...state,
        edit: { idx: null, original: null, edited: null },
      }
    }
    const TODO = [...state.TODO]
    TODO[state.edit.idx] = trimmed

    return {
      ...state,
      edit: { idx: null, original: null, edited: null },
      TODO
    }
  },

  [REDUCER_TYPES.CANCEL_EDITING_TODO]: (state) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),

  [REDUCER_TYPES.REMOVE_TODO]: (state, idx) => ({
    ...state,
    TODO: state.TODO.filter((_, i) => i !== idx),
  }),
}

function App(state, emit) {
  return hFragment([
    h('h1', {}, ['My TODO']),
    CreateTodo(state, emit),
    TodoList(state, emit),
  ])
}

function CreateTodo({ currentTodo }, emit) {
  const isValid = currentTodo.trim().length >= MIN_TODO_LENGTH
  return h('div', {}, [
    h('label', { for: 'todo-input' }, ['New TODO']),
    h(
      'input', 
      {
        type: 'text',
        id: 'todo-input',
        value: currentTodo,
        on: {
          input: ({ target }) => emit(REDUCER_TYPES.UPDATE_CURRENT_TODO, target.value),
          keydown: ({ key }) => {
            if (key === 'Enter' && isValid) {
              emit(REDUCER_TYPES.ADD_TODO)
            }
          },
        },
      }
    ),
    h(
      'button', 
      {
        on: {
          click: () => emit(REDUCER_TYPES.ADD_TODO),
        },
        ...(isValid ? {} : { disabled: '' }),
      }, 
      ['Add']
    )
  ])
}

function TodoList({ TODO, edit }, emit) {
  return h(
    'ul', 
    {},
    TODO.map((todo, i) => TodoItem({ todo, i, edit }, emit)) 
  )
}

function TodoItem({ todo, i, edit }, emit) {
  const isEditing = edit.idx === i

  return isEditing
    ? h('li', { key: i }, [
        h(
          'input', 
          {
            value: edit.edited,
            on: {
              input: ({ target }) => emit(REDUCER_TYPES.EDIT_TODO, target.value),
            }
          }
        ),
        h(
          'button', 
          {
            on: { 
              click: () => emit(REDUCER_TYPES.SAVE_EDITED_TODO)
            },
          },
          ['Save']
        ),
        h(
          'button', 
          { 
            on: { 
              click: () => emit(REDUCER_TYPES.CANCEL_EDITING_TODO) 
            }
          }, 
          ['Cancel']
        )
      ])
    : h('li', { key: i }, [
        h(
          'span', {
            on: { 
              dblclick: () => emit(REDUCER_TYPES.START_EDITING_TODO, i) 
            }
          }, 
          [todo]
        ),
        h(
          'button',
          {
            on: {
              click: () => emit(REDUCER_TYPES.REMOVE_TODO, i),
            },
          },
          ['Done']
        )
      ])
}

createApp({ state, reducers, view: App}).mount(document.body)
