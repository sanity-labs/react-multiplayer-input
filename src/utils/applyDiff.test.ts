import {beforeEach, describe, expect, test} from 'vitest'

import {applyDiff} from './applyDiff'

let textarea: HTMLTextAreaElement

beforeEach(() => {
  textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
})

describe('applyDiff', () => {
  test('inserting text upstream of the caret shifts the caret forward', () => {
    textarea.value = 'The quick brown fox'
    textarea.setSelectionRange(10, 10) // before "brown"

    applyDiff(textarea, 'The very quick brown fox')

    expect(textarea.value).toBe('The very quick brown fox')
    expect(textarea.selectionStart).toBe(15)
    expect(textarea.selectionEnd).toBe(15)
  })

  test('inserting text after the caret leaves the caret alone', () => {
    textarea.value = 'The quick brown fox'
    textarea.setSelectionRange(10, 10) // before "brown"

    applyDiff(textarea, 'The quick brown fox jumps over')

    expect(textarea.value).toBe('The quick brown fox jumps over')
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
  })

  test('deleting text upstream of the caret shifts the caret backward', () => {
    textarea.value = 'The very quick brown fox'
    textarea.setSelectionRange(15, 15) // before "brown"

    applyDiff(textarea, 'The quick brown fox')

    expect(textarea.value).toBe('The quick brown fox')
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
  })

  test('range selections are preserved across an upstream insert', () => {
    textarea.value = 'The quick brown fox jumps over the lazy dog'
    textarea.setSelectionRange(10, 19) // "brown fox"

    applyDiff(textarea, 'The very quick brown fox jumps over the lazy dog')

    expect(textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)).toBe('brown fox')
  })

  test('range selections are preserved across a downstream insert', () => {
    textarea.value = 'The quick brown fox'
    textarea.setSelectionRange(4, 9) // "quick"

    applyDiff(textarea, 'The quick brown fox jumps')

    expect(textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)).toBe('quick')
  })

  test('caret at position 0 stays at 0 when nothing changes before it', () => {
    textarea.value = 'hello'
    textarea.setSelectionRange(0, 0)

    applyDiff(textarea, 'hello world')

    expect(textarea.selectionStart).toBe(0)
    expect(textarea.selectionEnd).toBe(0)
  })

  test('caret at the end of input follows appended text to the new end', () => {
    textarea.value = 'hello'
    textarea.setSelectionRange(5, 5)

    applyDiff(textarea, 'hello world')

    // A boundary-case insert at the caret position is treated as happening
    // before the caret, so the caret moves to the new end. This matches user
    // expectation for collaborative editing: if the user is typing at the end
    // and a remote insert lands, they want to keep typing at the (new) end.
    expect(textarea.selectionStart).toBe(11)
  })

  test('handles shrinking text where the caret lands past the new length', () => {
    textarea.value = 'hello world'
    textarea.setSelectionRange(10, 10) // before "d"

    applyDiff(textarea, 'hi')

    expect(textarea.value).toBe('hi')
    // setRangeText 'preserve' clamps the caret to the new value length
    expect(textarea.selectionStart).toBeLessThanOrEqual(2)
  })

  test('no-op when nextValue equals current value (the wrapper guards this, but defensive)', () => {
    textarea.value = 'hello'
    textarea.setSelectionRange(3, 3)

    applyDiff(textarea, 'hello')

    expect(textarea.value).toBe('hello')
    expect(textarea.selectionStart).toBe(3)
  })

  test('handles complete replacement of the value', () => {
    textarea.value = 'one two three'
    textarea.setSelectionRange(5, 5)

    applyDiff(textarea, 'totally different content')

    expect(textarea.value).toBe('totally different content')
  })

  test('works on an <input> element, not just <textarea>', () => {
    const input = document.createElement('input')
    input.type = 'text'
    document.body.appendChild(input)
    input.value = 'hello'
    input.setSelectionRange(3, 3)

    applyDiff(input, 'hellish')

    expect(input.value).toBe('hellish')
  })
})
