import { createApp, h, hFragment } from '../../packages/runtime/dist/fe-fwk.js'

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
  'update-current-todo': (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),

  'add-todo': (state) => ({
    ...state,
    currentTodo: '',
    TODO: [...state.TODO, state.currentTodo],
  }),

  'start-editing-todo': (state, idx) => ({
    ...state,
    edit: {
      idx,
      original: state.TODO[idx],
      edited: state.TODO[idx],
    }
  }),

  'edit-todo': (state, edited) => ({
    ...state,
    edit: {
      ...state.edit, edited,
    },
  }),

  'save-edited-todo': (state) => {
    const TODO = [...state.TODO]
    TODO[state.edit.idx] = state.edit.edited

    return {
      ...state,
      edit: { idx: null, original: null, edited: null },
      TODO
    }
  },

  'cancel-editing-todo': (state) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),

  'remove-todo': (state, idx) => ({
    ...state,
    TODO: TODO.filter((_, i) => i !== idx),
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
  return h('div', {}, [
    h('label', { for: 'todo-input' }, ['New TODO']),
    h(
      'input', 
      {
        type: 'text',
        id: 'todo-input',
        value: currentTodo,
        on: {
          input: ({ target }) => emit('update-current-todo', target.value),
          keydown: ({ key }) => {
            if (key === 'Enter' && currentTodo.length >= 3) {
              emit('add-todo')
            }
          },
        },
      }
    ),
    h(
      'button', 
      {
        disabled: currentTodo.length < 3,
        on: {
          click: () => emit('add-todo'),
        },
      }, 
      ['Add']
    )
  ])
}

function TodoList({ TODO, edit }, emit) {
  h(
    'ul', 
    {},
    TODO.map((todo, i) => TodoItem({ todo, i, edit }, emit)) 
  )
}

function TodoItem({ todo, i, edit }, emit) {
  const isEditing = edit.idx === i

  return isEditing
    ? h('li', {}, [ // todo in edit mode
      h(
        'input', 
        {
          value: edit.edited,
          on: {
            input: ({ target }) => emit('edit-todo', target.value),
          }
        }
      ),
      h(
        'button', 
        {
          on: { 
            click: () => emit('save-edited-todo')
          },
        },
        ['Save']
      ),
      h(
        'button', 
        { 
          on: { 
            click: () => emit('cancel-editing-todo') 
          }
        }, 
        ['Cancel']
      )
    ])
    :
    h('li', {}, [ // todo in view mode
      h(
        'span', {
          on: { 
            dblclick: () => emit('start-editing-todo', i) 
          }
        }, 
        [todo]
      ),
      h(
        'button',
        {
          click: () => emit('remove-todo', i),
        },
        ['Done']
      )
    ])
}

createApp({ state, reducers, view: App}).mount(document.body)
