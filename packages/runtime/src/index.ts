import { Dispatcher } from './dispatcher';

console.log('This will soon be a frontend framework!');

const dispatcher = new Dispatcher()
dispatcher.subscribe('greet', (name: unknown) => {
  console.log('Hello', name)
})

dispatcher.dispatch('greet', 'John')