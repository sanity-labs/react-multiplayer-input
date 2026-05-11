import {DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT, makeDiff} from '@sanity/diff-match-patch'

type SelectionDirection = 'forward' | 'backward' | 'none'

/**
 * Patches `element.value` from its current value to `nextValue` by computing a
 * character-level diff and applying each op via `setRangeText`.
 *
 * `setRangeText` is an edit operation rather than a value replacement, so the
 * browser keeps scroll position intact. We don't rely on `setRangeText`'s
 * built-in selectMode for selection preservation because it (a) clobbers
 * `selectionDirection` to `'none'` and (b) extends selections that start
 * exactly at an insert position rather than shifting them. We track and
 * restore selection state explicitly instead.
 *
 * Safe to call when `element.value === nextValue` (the diff is empty and the
 * loop is inert), but the wrapper short-circuits in that case to avoid an
 * unnecessary setSelectionRange call.
 */
export function applyDiff(
  element: HTMLInputElement | HTMLTextAreaElement,
  nextValue: string,
): void {
  const selectionStartBefore = element.selectionStart ?? 0
  const selectionEndBefore = element.selectionEnd ?? 0
  const directionBefore = (element.selectionDirection ?? 'none') as SelectionDirection

  const diff = makeDiff(element.value, nextValue)

  let opOffset = 0
  let nextSelStart = selectionStartBefore
  let nextSelEnd = selectionEndBefore

  for (const [op, text] of diff) {
    if (op === DIFF_EQUAL) {
      opOffset += text.length
    } else if (op === DIFF_INSERT) {
      element.setRangeText(text, opOffset, opOffset, 'end')
      nextSelStart = adjustForInsert(nextSelStart, opOffset, text.length)
      nextSelEnd = adjustForInsert(nextSelEnd, opOffset, text.length)
      opOffset += text.length
    } else if (op === DIFF_DELETE) {
      element.setRangeText('', opOffset, opOffset + text.length, 'end')
      nextSelStart = adjustForDelete(nextSelStart, opOffset, text.length)
      nextSelEnd = adjustForDelete(nextSelEnd, opOffset, text.length)
    }
  }

  // Restore selection state. Skip the call when nothing needs restoring —
  // Firefox schedules a deferred ScrollSelectionIntoView pass on every
  // setSelectionRange against a focused text control, so a redundant call
  // would yank the viewport for no reason. With selectMode 'end' above,
  // setRangeText collapses the selection on each op, so this branch fires
  // whenever the diff had any insert or delete (i.e., whenever there was
  // a real change to apply).
  if (element.selectionStart !== nextSelStart || element.selectionEnd !== nextSelEnd) {
    element.setSelectionRange(nextSelStart, nextSelEnd, directionBefore)
  }
}

/**
 * Returns the new offset after inserting `length` characters at `insertAt`.
 * A selection boundary that sits at the insert point is shifted right rather
 * than extended; this differs from `setRangeText`'s `'preserve'` selectMode.
 */
function adjustForInsert(offset: number, insertAt: number, length: number): number {
  return offset >= insertAt ? offset + length : offset
}

/**
 * Returns the new offset after deleting `length` characters at `deleteAt`.
 * Offsets that fell inside the deleted range collapse to the deletion point.
 */
function adjustForDelete(offset: number, deleteAt: number, length: number): number {
  if (offset <= deleteAt) return offset
  if (offset >= deleteAt + length) return offset - length
  return deleteAt
}
