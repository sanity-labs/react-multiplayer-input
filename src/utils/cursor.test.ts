import {beforeEach, describe, expect, test} from 'vitest'

import {captureCursor, restoreCursor} from './cursor'

const padLength = 16
const restoreOptions = {padLength, matchDistance: 1000, matchThreshold: 0.8}

let textarea: HTMLTextAreaElement

beforeEach(() => {
  textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
})

describe('captureCursor', () => {
  test('records a fingerprint around a collapsed caret', () => {
    textarea.value = 'The quick brown fox jumps over the lazy dog'
    textarea.setSelectionRange(10, 10) // caret right before "brown"

    const cursor = captureCursor(textarea, {padLength, anchor: 10})

    expect(cursor).toBeDefined()
    expect(cursor!.collapsed).toBe(true)
    expect(cursor!.startOffset).toBe(10)
    expect(cursor!.startPrefix).toBe('The quick ')
    expect(cursor!.startSuffix).toBe('brown fox jumps ')
    expect(cursor!.direction).toBe('none')
    expect(cursor!.endOffset).toBeUndefined()
  })

  test('records both endpoints for a range selection', () => {
    textarea.value = 'The quick brown fox jumps over the lazy dog'
    textarea.setSelectionRange(10, 19) // selects "brown fox"

    const cursor = captureCursor(textarea, {padLength, anchor: 10})

    expect(cursor!.collapsed).toBe(false)
    expect(cursor!.startOffset).toBe(10)
    expect(cursor!.endOffset).toBe(19)
    expect(cursor!.startPrefix).toBe('The quick ')
    expect(cursor!.endSuffix).toBe(' jumps over the ')
  })

  test('reports forward direction when anchor matches selectionStart', () => {
    textarea.value = 'hello world'
    textarea.setSelectionRange(0, 5)

    const cursor = captureCursor(textarea, {padLength, anchor: 0})

    expect(cursor!.direction).toBe('forward')
  })

  test('reports backward direction when anchor matches selectionEnd', () => {
    textarea.value = 'hello world'
    textarea.setSelectionRange(0, 5)

    const cursor = captureCursor(textarea, {padLength, anchor: 5})

    expect(cursor!.direction).toBe('backward')
  })
})

describe('restoreCursor', () => {
  test('keeps caret anchored to the same logical position after an upstream insert', () => {
    // Before: caret right before "brown"
    textarea.value = 'The quick brown fox'
    textarea.setSelectionRange(10, 10)
    const cursor = captureCursor(textarea, {padLength, anchor: 10})!

    // A remote peer inserts "very " before "quick"
    textarea.value = 'The very quick brown fox'

    restoreCursor(textarea, cursor, restoreOptions)

    // Caret should now sit right before "brown" again, at index 15
    expect(textarea.selectionStart).toBe(15)
    expect(textarea.selectionEnd).toBe(15)
  })

  test('keeps caret anchored when an insert happens AFTER it', () => {
    textarea.value = 'The quick brown fox'
    textarea.setSelectionRange(10, 10) // before "brown"
    const cursor = captureCursor(textarea, {padLength, anchor: 10})!

    // Remote peer appends to the end
    textarea.value = 'The quick brown fox jumps over'

    restoreCursor(textarea, cursor, restoreOptions)

    // Caret should not have moved
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
  })

  test('restores a range selection across an upstream insert', () => {
    textarea.value = 'The quick brown fox jumps over the lazy dog'
    textarea.setSelectionRange(10, 19) // "brown fox"
    const cursor = captureCursor(textarea, {padLength, anchor: 10})!

    textarea.value = 'The very quick brown fox jumps over the lazy dog'

    restoreCursor(textarea, cursor, restoreOptions)

    expect(textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)).toBe('brown fox')
  })
})
