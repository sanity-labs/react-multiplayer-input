import {useImperativeHandle, useRef, useState} from 'react'
import {describe, expect, test} from 'vitest'
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

  test('preserves scroll position across a value swap', async () => {
    const longText = Array.from({length: 200}, (_, i) => `line ${i}`).join('\n')
    const handle = await mountHarness(longText)
    const el = handle.element!
    el.style.height = '120px'
    el.scrollTop = 400
    const scrollBefore = el.scrollTop
    expect(scrollBefore).toBeGreaterThan(0)

    handle.setValue(longText + '\nextra')
    await expect.poll(() => el.value.endsWith('extra')).toBe(true)

    // Scroll is restored proportionally, so it should be close but not necessarily identical
    expect(Math.abs(el.scrollTop - scrollBefore)).toBeLessThan(20)
  })

  test('forwards ref to the underlying textarea element', async () => {
    const handle = await mountHarness('hello')
    expect(handle.element).toBeInstanceOf(HTMLTextAreaElement)
    expect(handle.element!.value).toBe('hello')
  })
})
