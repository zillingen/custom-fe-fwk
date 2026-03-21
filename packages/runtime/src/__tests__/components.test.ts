import { expect, describe, it } from 'vitest'
import { MessageComponent } from '../components'
import { h } from '../h'

describe('MessageComponent', () => {
  it('returns message VNode', () => {
    const vnode = MessageComponent('Message text', 'info')

    expect(vnode).toEqual(h('div', { class: ['message', 'message--info'] }, [
      h('p', {}, ['Message text'])
    ]))
  })
})