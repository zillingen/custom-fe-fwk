import { hString } from  '../h'
import type { VTextNode } from '../h.types'

const lipsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Curabitur mauris purus, ornare ut ullamcorper ut, suscipit et erat. 
  Mauris vulputate metus lobortis pulvinar mollis. 
  Vestibulum vel convallis lacus. Maecenas porta.`

export const lipsum = (len: number = 1): VTextNode[] =>
  Array.from<VTextNode>({ length: len }).fill(hString(lipsumText))