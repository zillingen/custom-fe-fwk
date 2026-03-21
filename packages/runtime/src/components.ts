import { h } from './h';
import type { VNode } from './h.types';

type MessageType = 'info' | 'warning' | 'error'

export const MessageComponent = (message: string, type: MessageType): VNode =>
  h('div', { class: ['message', `message--${type}`] }, [
    h('p', {}, [message])
  ])

