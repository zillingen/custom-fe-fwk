// состояние приложения
const TODO = ['Walk the dog', 'Water the plants', 'Sand the chairs']

// ссылки на html элементы
const addToDoInput = document.getElementById('todo-input')
const addToDoButton = document.getElementById('add-todo-btn')
const TODOList = document.getElementById('TODO-list')

// Инициализация представления
for (const todo of TODO) {
  TODOList.append(renderTodoInReadMode(todo))
}

addToDoInput.addEventListener('input', () => {
  addToDoButton.disabled = addToDoInput.value.length < 3
})

addToDoInput.addEventListener('keydown', ({ key }) => {
  if (key === 'Enter' && addToDoInput.value.length >= 3) {
    addTodo()
  }
})

addToDoButton.addEventListener('click', () => {
  addTodo()
})

// функции
function renderTodoInReadMode(todo) {
  const li = document.createElement('li')
  li.classList.add('TODO', 'TODO--read-mode')
  li.classList.remove('TODO--edit-mode')

  const span = document.createElement('span')
  span.textContent = todo
  span.classList.add('TODO-text')
  span.addEventListener('dblclick', () => {
    const idx = TODO.indexOf(todo)

    TODOList.replaceChild(
      renderTodoInEditMode(todo),
      TODOList.childNodes[idx]
    )
  })
  li.append(span)

  const button = document.createElement('button')
  button.textContent = 'Done'
  button.classList.add('Button', 'SubmitButton')
  button.addEventListener('click', ()  => {
    const idx = TODO.indexOf(todo)
    doneTodo(idx)
  })
  li.append(button)

  return li
}

function renderTodoInEditMode(todo) {
  const li = document.createElement('li')
  li.classList.add('TODO', 'TODO--edit-mode')
  li.classList.remove('TODO--read-mode')

  const input = document.createElement('input')
  input.type = 'text'
  input.value = todo
  input.classList.add('Input')
  input.addEventListener('keyup', ({ key }) => {
    if (key == 'Enter') {
      const idx = TODO.indexOf(todo)
      updateTodo(idx, input.value)
    }
  })
  li.append(input)

  const saveBtn = document.createElement('button')
  saveBtn.textContent = 'Save'
  saveBtn.classList.add('Button', 'SubmitButton')
  saveBtn.addEventListener('click', ()  => {
    const idx = TODO.indexOf(todo)
    updateTodo(idx, input.value)
  })
  
  li.append(saveBtn)

  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = 'Cancel'
  cancelBtn.classList.add('Button')
  cancelBtn.addEventListener('click', () => {
    const idx = TODO.indexOf(todo)
    TODOList.replaceChild(
      renderTodoInReadMode(todo),
      TODOList.childNodes[idx]
    )
  })
  li.append(cancelBtn)

  return li
}

/**
 * @deprecated
 */
function removeTodo(index) {
  TODO.splice(index, 1) 
  TODOList.childNodes[index].remove()
}

function doneTodo(index) {
  TODOList.childNodes[index].classList.add('TODO--done')
}

function addTodo() {
  const description = addToDoInput.value

  if (!validateDuplicateTodo(description)) return

  TODO.push(description)
  const todo = renderTodoInReadMode(description)
  TODOList.append(todo)

  addToDoInput.value = ''
  addToDoButton.disabled = true

  speakAllTodos()
}

function updateTodo(index, description) {
  TODO[index] = description
  const todo = renderTodoInReadMode(description)

  TODOList.replaceChild(todo, TODOList.childNodes[index])
}

function validateDuplicateTodo (description) {
  if (TODO.includes(description)) {
    window.alert('TODO already exists!')
    return false
  }

  return true
}

function speakTodo(description) {
  const utterance = new SpeechSynthesisUtterance(description)
  speechSynthesis.speak(utterance)
}

function speakAllTodos() {
  for (const todo of TODO) {
    speakTodo(todo)
  }
}