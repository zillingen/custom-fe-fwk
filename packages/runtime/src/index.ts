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

const blog = h('div', { class: 'blog-vdom blog--v0.0.1', 'data-testid': 'blog-wrapper' }, [
  h('h1', { class: 'title title-s1' }, ['My news blog']),
  h('section', { class: 'blog-list-section', 'data-testid': 'blog-list' }, [
    h('p', { class: 'post' }, [lipsum(1).at(0)])
  ])
])

const el = document.querySelector('.ContentWrapper-module__contentContainer--AGolz')

if (el) {
  mountDom(blog, el as HTMLElement)
}