import type { VNodeProps } from './h.types'

export const setAttributes = (el: HTMLElement, attrs: Omit<VNodeProps, 'on'>): void => {
  const { class: className, style, ...otherAttrs } = attrs

  if (className) {
    setClass(el, className)
  }

  if (style) {
    Object.entries((style)).forEach(([prop, value]) => {
      setStyle(el, prop, value)
    })
  }

  for (const [name, value] of Object.entries(otherAttrs)) {
    setAttribute(el, name, value)
  }

  // ...
}

const setClass = (el: HTMLElement, className: unknown) => {
  el.className = ''

  if (typeof className === 'string') {
    el.className = className
  }

  if (Array.isArray(className)) {
    el.classList.add(...className)
  }
}

const setStyle = (el: HTMLElement, name: string, value: string | null) => {
  el.style.setProperty(name, value)
}

/*
const removeStyle = (el: HTMLElement, name: string) => {
  el.style.setProperty(name, null)
}
  */

const setAttribute = (el: HTMLElement, name: string, value: unknown) => {
  if (value === null) {
    removeAttribute(el, name)
  } else {
    el.setAttribute(name, String(value))
  }
}

const removeAttribute = (el: HTMLElement, name: string) => {
  el.removeAttribute(name)
}