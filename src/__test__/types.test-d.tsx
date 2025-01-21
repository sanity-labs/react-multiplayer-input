import {TextInput} from '@sanity/ui'
import {useState} from 'react'
import {describe, test} from 'vitest'

import {createMultiplayerInput} from '../createMultiplayerInput'

const MultiplayerTextarea = createMultiplayerInput('textarea')
const MultiplayerInput = createMultiplayerInput('input')
const UITextInput = createMultiplayerInput(TextInput)

function MyCustom(props: {customProp: number; value: string}) {
  const [state, setState] = useState('')
  return <textarea value={state} onChange={(e) => setState(e.currentTarget.value)}></textarea>
}

const Custom2 = createMultiplayerInput(MyCustom)

describe('component types', () => {
  test('textarea', () => {
    ;<MultiplayerTextarea rows={10} cols={10} value="hello" />
    // @ts-expect-error - type="text" is not valid
    ;<MultiplayerTextarea type="text" rows={10} cols={10} value="hello" />
  })
  test('input', () => {
    // @ts-expect-error - rows and cols are not valid
    ;<MultiplayerInput type="text" value="hello" rows={10} cols={10} />
  })
  test('custom', () => {
    const ti = <TextInput suffix="suff" value="hello" rows={10} cols={10} />
    ;<UITextInput suffix="suff" type="text" value="hello" rows={10} cols={10} />
  })
  test('custom2', () => {
    // @ts-expect-error - rows and cols are not valid
    ;<Custom2 value="hello" rows={10} cols={10} />
  })
  test('invalid input types', () => {
    ;<MultiplayerInput type="text" value="hello" />
    ;<MultiplayerInput type="search" />
    ;<MultiplayerInput type="tel" />
    ;<MultiplayerInput type="url" />
    ;<MultiplayerInput type="password" />
    ;<MultiplayerInput type="email" />
  })
  test('invalid input types', () => {
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="button" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="number" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="checkbox" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="color" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="date" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="datetime-local" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="file" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="hidden" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="image" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="number" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="radio" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="range" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="submit" value="hello" />
    // @ts-expect-error - invalid
    ;<MultiplayerInput type="time" value="hello" />
  })
})
