import { expect, test } from 'vitest'
import { withoutNulls } from '../arrays'

test('Test withoutNulls func', () => {
  const sampleArray = [1, null, 3, 4, undefined, 5]
  expect(withoutNulls(sampleArray)).toEqual([1,3,4,5])
})