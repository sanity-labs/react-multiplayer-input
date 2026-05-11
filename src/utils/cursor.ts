// based on mobwrite implementation of cursor restoration found at
// https://code.google.com/archive/p/google-mobwrite/
// See https://neil.fraser.name/writing/cursor/ for an in-depth explanation of how it works
import {makeDiff, match, xIndex} from '@sanity/diff-match-patch'

export interface Cursor {
  startPrefix: string
  startSuffix: string
  startOffset: number
  collapsed: boolean
  direction: 'forward' | 'backward' | 'none'
  endPrefix?: string
  endSuffix?: string

  endOffset?: number
  scrollTop?: number
  scrollLeft?: number
}

export function captureCursor(
  element: HTMLTextAreaElement | HTMLInputElement,
  options: {padLength: number; anchor: number},
) {
  const {padLength, anchor} = options
  const text = element.value

  const selectionStart = element.selectionStart
  const selectionEnd = element.selectionEnd

  if (selectionStart === null || selectionEnd === null) {
    return
  }

  const direction: Cursor['direction'] =
    selectionStart === selectionEnd ? 'none' : selectionStart === anchor ? 'forward' : 'backward'
  const cursor: Cursor = {
    startPrefix: text.substring(selectionStart - padLength, selectionStart) || '',
    startSuffix: text.substring(selectionStart, selectionStart + padLength) || '',
    startOffset: selectionStart,
    collapsed: selectionStart === selectionEnd,
    direction: direction,
  }
  if (!cursor.collapsed) {
    cursor.endPrefix = text.substring(selectionEnd - padLength, selectionEnd) || ''
    cursor.endSuffix = text.substring(selectionEnd, selectionEnd + padLength) || ''
    cursor.endOffset = selectionEnd
  }

  // Record scrollbar locations
  if ('scrollTop' in element) {
    cursor.scrollTop = element.scrollTop / element.scrollHeight
    cursor.scrollLeft = element.scrollLeft / element.scrollWidth
  }

  return cursor
}

export type RestoreCursorOptions = {
  padLength: number
  // Maximum distance to search from expected location.
  matchDistance: number
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose)
  matchThreshold: number
}

export function restoreCursor(
  element: HTMLTextAreaElement | HTMLInputElement,
  cursor: Cursor,
  options: RestoreCursorOptions,
) {
  // Set some constants which tweak the matching behaviour.
  const {padLength, matchDistance, matchThreshold} = options
  const matchOptions = {distance: matchDistance, threshold: matchThreshold}
  const newText = element.value

  // Find the start of the selection in the new text.
  let pattern1 = cursor.startPrefix + cursor.startSuffix
  let pattern2, diff
  let cursorStartPoint = match(newText, pattern1, cursor.startOffset - padLength, matchOptions)
  if (cursorStartPoint !== null) {
    pattern2 = newText.substring(cursorStartPoint, cursorStartPoint + pattern1.length)
    //alert(pattern1 + '\nvs\n' + pattern2);
    // Run a diff to get a framework of equivalent indicies.
    diff = makeDiff(pattern1, pattern2, {checkLines: false})
    cursorStartPoint += xIndex(diff, cursor.startPrefix.length)
  }

  let cursorEndPoint = null
  if (!cursor.collapsed) {
    // Find the end of the selection in the new text.
    pattern1 = cursor.endPrefix! + cursor.endSuffix
    cursorEndPoint = match(newText, pattern1, cursor.endOffset! - padLength, matchOptions)
    if (cursorEndPoint !== null) {
      pattern2 = newText.substring(cursorEndPoint, cursorEndPoint + pattern1.length)
      //alert(pattern1 + '\nvs\n' + pattern2);
      // Run a diff to get a framework of equivalent indicies.
      diff = makeDiff(pattern1, pattern2, {checkLines: false})
      cursorEndPoint += xIndex(diff, cursor.endPrefix!.length)
    }
  }

  // Deal with loose ends
  if (cursorStartPoint === null && cursorEndPoint !== null) {
    // Lost the start point of the selection, but we have the end point.
    // Collapse to end point.
    cursorStartPoint = cursorEndPoint
  } else if (cursorStartPoint === null && cursorEndPoint === null) {
    // Lost both start and end points.
    // Jump to the offset of start.
    cursorStartPoint = cursor.startOffset
  }
  if (cursorEndPoint === null) {
    // End not known, collapse to start.
    cursorEndPoint = cursorStartPoint
  }

  element.setSelectionRange(cursorStartPoint, cursorEndPoint, cursor.direction)

  // Restore scrollbar locations
  if ('scrollTop' in cursor) {
    element.scrollTop = cursor.scrollTop! * element.scrollHeight
    element.scrollLeft = cursor.scrollLeft! * element.scrollWidth
  }
}
