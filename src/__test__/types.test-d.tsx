import {TextInput} from '@sanity/ui'
import {useState} from 'react'
import {describe, test} from 'vitest'

import {createMultiplayerInput} from '../createMultiplayerInput'

const MultiplayerTextarea = createMultiplayerInput('textarea')
const MultiplayerInput = createMultiplayerInput('input')
const UITextInput = createMultiplayerInput(TextInput)

function MyCustom() {
  const [state, setState] = useState('')
  return <textarea value={state} onChange={(e) => setState(e.currentTarget.value)}></textarea>
}

const Custom2 = createMultiplayerInput(MyCustom)

describe('component types', () => {
  test('textarea', () => {
    const component = <MultiplayerTextarea rows={10} cols={10} value="hello" />
    // @ts-expect-error - type="text" is not valid
    const component2 = <MultiplayerTextarea type="text" rows={10} cols={10} value="hello" />
  })
  test('input', () => {
    // @ts-expect-error - rows and cols are not valid
    const component = <MultiplayerInput type="text" value="hello" rows={10} cols={10} />
  })
  test('custom', () => {
    const ti = <TextInput suffix="suff" value="hello" rows={10} cols={10} />
    const component = <UITextInput suffix="suff" type="text" value="hello" rows={10} cols={10} />
  })
  test('custom2', () => {
    // @ts-expect-error - rows and cols are not valid
    const component = <Custom2 value="hello" rows={10} cols={10} />
  })
  test('error if button, etc.', () => {
    // @ts-expect-error - type="button" is not valud
    const component = <MultiplayerInput type="button" value="hello" />
  })
})
