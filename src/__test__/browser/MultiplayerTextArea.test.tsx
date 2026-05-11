import {useImperativeHandle, useRef, useState} from 'react'
import {describe, expect, test} from 'vitest'
import {page, userEvent} from 'vitest/browser'
import {render} from 'vitest-browser-react'

import {MultiplayerTextArea} from '../../MultiplayerTextArea'

type Handle = {setValue: (v: string) => void; element: HTMLTextAreaElement | null}

function Harness({initialValue, ref}: {initialValue: string; ref: React.Ref<Handle>}) {
  const [value, setValue] = useState(initialValue)
  const elementRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => ({
    setValue,
    get element() {
      return elementRef.current
    },
  }))
  return (
    <MultiplayerTextArea
      ref={elementRef}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  )
}

async function mountHarness(initialValue: string): Promise<Handle> {
  const handle: {current: Handle | null} = {current: null}
  render(<Harness initialValue={initialValue} ref={handle} />)
  await expect.poll(() => handle.current?.element).toBeInstanceOf(HTMLTextAreaElement)
  return handle.current!
}

describe('MultiplayerTextArea', () => {
  test('does not call consumer onChange for value applied via remote update', async () => {
    // The wrapper's applyDiff calls setRangeText, which synthesizes an
    // `input` event. If we forwarded that to the consumer, the parent
    // setter would receive the value it just provided — and in a
    // collaborative setup that could re-broadcast back to peers, causing
    // a feedback loop.
    let changeCount = 0

    type SpyHandle = {setValue: (v: string) => void; element: HTMLTextAreaElement | null}
    const spy: {current: SpyHandle | null} = {current: null}
    function SpyHarness({initial, ref}: {initial: string; ref: React.Ref<SpyHandle>}) {
      const [value, setValue] = useState(initial)
      const elementRef = useRef<HTMLTextAreaElement>(null)
      useImperativeHandle(ref, () => ({
        setValue,
        get element() {
          return elementRef.current
        },
      }))
      return (
        <MultiplayerTextArea
          ref={elementRef}
          value={value}
          onChange={(e) => {
            changeCount++
            setValue(e.currentTarget.value)
          }}
        />
      )
    }

    render(<SpyHarness initial="hello" ref={spy} />)
    await expect.poll(() => spy.current?.element).toBeInstanceOf(HTMLTextAreaElement)
    const el = spy.current!.element!

    spy.current!.setValue('hello world')
    // Wait for the layout effect to actually run applyDiff (which mutates
    // the DOM) — observable via the textarea's live value.
    await expect.poll(() => el.value).toBe('hello world')

    expect(changeCount).toBe(0)
  })

  test('preserves the caret when text is inserted upstream of it', async () => {
    const handle = await mountHarness('The quick brown fox')
    const el = handle.element!
    el.focus()
    el.setSelectionRange(10, 10) // caret right before "brown"

    handle.setValue('The very quick brown fox')
    await expect.poll(() => el.value).toBe('The very quick brown fox')

    expect(el.value.slice(0, el.selectionStart)).toMatch(/quick $/)
    expect(el.selectionStart).toBe(el.selectionEnd)
  })

  test('preserves a range selection across an upstream insert', async () => {
    const handle = await mountHarness('The quick brown fox jumps')
    const el = handle.element!
    el.focus()
    el.setSelectionRange(10, 19) // selects "brown fox"

    handle.setValue('The very quick brown fox jumps')
    await expect.poll(() => el.value).toBe('The very quick brown fox jumps')

    expect(el.value.slice(el.selectionStart, el.selectionEnd)).toBe('brown fox')
  })

  const isFirefox = typeof navigator !== 'undefined' && /Firefox/.test(navigator.userAgent)
  // Headless Playwright WebKit on Linux yanks scroll on setRangeText/
  // setSelectionRange, unlike real Safari on macOS (which preserves scroll
  // like Chromium). This is a difference in the playwright-webkit build, not
  // a regression we can fix from userland — skip the engine-level assertion
  // when running there.
  const isLinuxWebKit =
    typeof navigator !== 'undefined' &&
    /AppleWebKit/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent) &&
    /Linux/.test(navigator.userAgent)

  test.skipIf(isLinuxWebKit)(
    'preserves scroll position when the user scrolls away from the caret',
    async () => {
      const longText = Array.from({length: 200}, (_, i) => `line ${i}`).join('\n')
      const handle = await mountHarness(longText)
      const el = handle.element!
      el.style.height = '120px'
      el.focus()
      el.setSelectionRange(0, 0) // caret at the top

      // Scroll via real wheel input. Use a Locator (per the documented API
      // example) and split into multiple smaller ticks; one big delta isn't
      // honored by all engines.
      const locator = page.elementLocator(el)
      await userEvent.hover(locator)
      await userEvent.wheel(locator, {delta: {y: 100}, times: 8})
      const scrollBefore = el.scrollTop
      expect(scrollBefore).toBeGreaterThan(50)

      handle.setValue('NEW: ' + longText)
      await expect.poll(() => el.value.startsWith('NEW: ')).toBe(true)

      // Roughly one line-height worth of slack: less than this is "scroll
      // unchanged from the user's perspective", more than this is "viewport
      // visibly drifted."
      const driftToleranceInPx = 20
      const drift = Math.abs(el.scrollTop - scrollBefore)
      if (isFirefox) {
        // Real Firefox drifts the viewport on every remote update (Gecko
        // does a scroll-into-view pass after our setRangeText /
        // setSelectionRange calls). The direction of drift varies — sometimes
        // toward the caret, sometimes away — but it's always non-trivial.
        // Real Chromium and Safari preserve scroll. Assert the drift actively
        // on Firefox so this test goes red if a future implementation
        // neutralizes the bug.
        expect(drift).toBeGreaterThan(driftToleranceInPx)
      } else {
        expect(drift).toBeLessThan(driftToleranceInPx)
      }
    },
  )

  test('forwards ref to the underlying textarea element', async () => {
    const handle = await mountHarness('hello')
    expect(handle.element).toBeInstanceOf(HTMLTextAreaElement)
    expect(handle.element!.value).toBe('hello')
  })
})
