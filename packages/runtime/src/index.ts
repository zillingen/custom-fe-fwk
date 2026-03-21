import { destroyDom } from './destroy-dom';
import { h, hFragment } from './h';
import { mountDom } from './mount-dom';
import { lipsum } from './utils/text';

console.log('This will soon be a frontend framework!');

const vdom = h('form', { class: 'login_form', action: 'login', children: [
  h('input', { type: 'text', name: 'user' }),
  h('input', { type: 'password', name: 'pass' }),
  h('button', { on: { click: () => console.log('login') } }, ['Login'])
] })

const exVdom = hFragment([
  h('h1', { class: 'title' }, ['My counter']),
  h('div', { class: 'container' }, [
    h('button', {}, ['Decrement']),
    h('span', {}, ['0']),
    h('button', {}, ['Increment']),
  ])
])

console.log('vdom:', vdom)
console.log('exVdom:', exVdom)

const newAbz = hFragment([
    h('h1', { class: 'abz-title abz-title--main', 'data-testid': 'abz_title' }),
    h('p', { class: 'article article--main' }, [
        hFragment([
            ...lipsum(3),
            h('p', {}, [
                'LINK PARAGRAPH',
                h('a', { class: 'wiki-link', href: 'http://localhost/winikilne1', target: '_blank' }, ['Wini link'])
            ])
        ])
    ])
]);
// const newAbzWrapped = h('div', { class: 'new-aBz--wrapper' }, [newAbz])

const el = document.querySelector<HTMLElement>('.IssueViewer-module__mainContainer--PhquW')

if (!el) {
  throw new Error('Posts container not found')
}
console.log('remove Childs')
el.childNodes.forEach((child) => child.remove())
console.log('mount Blog')
mountDom(newAbz, el);
console.log('vDOM mounted', JSON.stringify(newAbz, null, 2))

// ------ destroy DOM -----------
destroyDom(newAbz)