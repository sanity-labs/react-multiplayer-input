import {useState} from 'react'
import {describe, expect, test} from 'vitest'
import {userEvent} from 'vitest/browser'
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

describe('native undo', () => {
  test('the user can undo their own keystrokes', async () => {
    const {element: el} = await mount('hello')
    el.focus()
    el.setSelectionRange(5, 5)

    await userEvent.type(el, '!')
    await expect.poll(() => el.value).toBe('hello!')

    await userEvent.keyboard('{Meta>}z{/Meta}')

    // Native undo of typing should at minimum remove the last character.
    // (Browsers group typing into larger undo transactions, but a single
    // character undo is the most conservative assertion.)
    expect(el.value).toBe('hello')
  })

  test('a remote update is NOT undoable on its own', async () => {
    const {setValue, element: el} = await mount('hello')
    el.focus()

    setValue('hello world')
    await expect.poll(() => el.value).toBe('hello world')

    await userEvent.keyboard('{Meta>}z{/Meta}')

    // setRangeText edits don't push undo entries, so Cmd+Z is a no-op here.
    // If this assertion ever fails (i.e. el.value becomes 'hello'), it means
    // the browser started recording setRangeText edits in the undo stack —
    // good news, and the known-limitations doc should be revisited.
    expect(el.value).toBe('hello world')
  })
})
