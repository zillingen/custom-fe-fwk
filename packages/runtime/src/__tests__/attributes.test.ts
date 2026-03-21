import { expect, describe, it } from 'vitest'
import { setAttributes } from '../attributes'

describe('Test setAttributes func', () => {
  const el = document.createElement('button')

  it('sets id attribute correctly', () => {
    setAttributes(el, { id: 'submit_button' })
    expect(el.getAttribute('id')).eq('submit_button')
  })

  it('sets class list correctly', () => {
    setAttributes(el,  { class: 'button-1' })
    expect(Object.values(el.classList)).toEqual(['button-1'])
  })

  it('sets many classes correctly', () => {
    setAttributes(el,  { class: ['button-1', 'button--primary'] })
    expect(Object.values(el.classList)).toEqual(['button-1', 'button--primary'])
  })

  it('sets inline styles correctly', () => {
    setAttributes(el, { style: { 'font-weight': 'bold' } })
    expect(el.style.fontWeight).eq('bold')
  })

  it('deletes attribute correctly', () => {
    setAttributes(el, { 'name': 'submit_button' })
    expect(el.getAttribute('name')).eq('submit_button')
    setAttributes(el, { 'name': null })
    expect(el.hasAttribute('name')).eq(false)
  })
})
