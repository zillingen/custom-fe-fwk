import { expect, test } from 'vitest'
import { lipsum } from '../text'

test('Test lipsum func', () => {
  expect(lipsum(5).filter((paragraph) => !!paragraph).length).eq(5)
})
