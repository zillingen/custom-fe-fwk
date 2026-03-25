import { Dispatcher } from './dispatcher';

console.log('This will soon be a frontend framework!');

const dispatcher = new Dispatcher()
dispatcher.subscribe('greet', (name) => {
  console.log('Hello', name)
})

dispatcher.dispatch('greet', 'John')