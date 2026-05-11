import {useState} from 'react'
import {describe, expect, test} from 'vitest'
import {render} from 'vitest-browser-react'

import {MultiplayerTextArea} from '../../MultiplayerTextArea'

type Mount = {setValue: (v: string) => void; element: HTMLTextAreaElement}

function Harness({initialValue, onMount}: {initialValue: string; onMount: (m: Mount) => void}) {
  const [value, setValue] = useState(initialValue)
  return (
    <MultiplayerTextArea
      ref={(el) => {
        if (el) onMount({setValue, element: el})
      }}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  )
}

async function mount(initialValue: string): Promise<Mount> {
  const m: {current: Mount | null} = {current: null}
  render(<Harness initialValue={initialValue} onMount={(x) => (m.current = x)} />)
  await expect.poll(() => m.current?.element).toBeInstanceOf(HTMLTextAreaElement)
  return m.current!
}

describe('selection direction is preserved across remote updates', () => {
  test('forward selection survives an upstream insert', async () => {
    const {setValue, element: el} = await mount('hello world')
    el.focus()
    el.setSelectionRange(0, 5, 'forward')

    setValue('Say hello world')
    await expect.poll(() => el.value).toBe('Say hello world')

    expect(el.value.slice(el.selectionStart, el.selectionEnd)).toBe('hello')
    expect(el.selectionDirection).toBe('forward')
  })

  test('backward selection survives an upstream insert', async () => {
    const {setValue, element: el} = await mount('hello world')
    el.focus()
    el.setSelectionRange(0, 5, 'backward')

    setValue('Say hello world')
    await expect.poll(() => el.value).toBe('Say hello world')

    expect(el.value.slice(el.selectionStart, el.selectionEnd)).toBe('hello')
    expect(el.selectionDirection).toBe('backward')
  })

  test('selection shifts (not extends) when an insert lands at the selection start', async () => {
    // setRangeText('preserve') would extend the selection to include the
    // inserted text. applyDiff treats the selection boundary as "to the
    // right of" the insert point, so the selection shifts as a whole instead.
    const {setValue, element: el} = await mount('hello world')
    el.focus()
    el.setSelectionRange(0, 5, 'forward')

    setValue('Hey hello world')
    await expect.poll(() => el.value).toBe('Hey hello world')

    expect(el.value.slice(el.selectionStart, el.selectionEnd)).toBe('hello')
  })
})
