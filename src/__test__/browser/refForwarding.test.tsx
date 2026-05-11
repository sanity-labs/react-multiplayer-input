import {forwardRef, useRef} from 'react'
import {describe, expect, test} from 'vitest'
import {render} from 'vitest-browser-react'

import {createMultiplayerInput} from '../../createMultiplayerInput'
import {MultiplayerInput} from '../../MultiplayerInput'
import {MultiplayerTextArea} from '../../MultiplayerTextArea'

describe('ref forwarding', () => {
  test('MultiplayerInput exposes the underlying <input>', async () => {
    let captured: HTMLInputElement | null = null
    function App() {
      const ref = useRef<HTMLInputElement>(null)
      return (
        <MultiplayerInput
          ref={(el) => {
            ref.current = el
            captured = el
          }}
          type="text"
          value="hi"
          onChange={() => {}}
        />
      )
    }
    render(<App />)
    await expect.poll(() => captured).toBeInstanceOf(HTMLInputElement)
  })

  test('MultiplayerTextArea exposes the underlying <textarea>', async () => {
    let captured: HTMLTextAreaElement | null = null
    function App() {
      return (
        <MultiplayerTextArea
          ref={(el) => {
            captured = el
          }}
          value="hi"
          onChange={() => {}}
        />
      )
    }
    render(<App />)
    await expect.poll(() => captured).toBeInstanceOf(HTMLTextAreaElement)
  })

  test('createMultiplayerInput(CustomComponent) forwards refs through the custom wrapper', async () => {
    const CustomTextarea = forwardRef<HTMLTextAreaElement, {value: string; className?: string}>(
      function CustomTextarea({value, className}, ref) {
        return <textarea ref={ref} value={value} className={className} readOnly />
      },
    )
    const Wrapped = createMultiplayerInput(CustomTextarea)

    let captured: HTMLTextAreaElement | null = null
    render(
      <Wrapped
        ref={(el: HTMLTextAreaElement | null) => {
          captured = el
        }}
        value="hi"
        className="x"
      />,
    )
    await expect.poll(() => captured).toBeInstanceOf(HTMLTextAreaElement)
    expect(captured!.value).toBe('hi')
  })
})
