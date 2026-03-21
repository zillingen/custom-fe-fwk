import { expect, test } from 'vitest'
import { entries } from '../objects'

test('Test entries func', () => {
  const sampleObj = {
    name: 'User1',
    age: 30,
    active: true
  }

  expect(entries(sampleObj)).toEqual(Object.entries(sampleObj))
})
