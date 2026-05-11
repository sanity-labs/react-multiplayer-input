import {useEffect, useRef, useState} from 'react'
import {MultiplayerTextArea} from 'react-multiplayer-input'

import {createBroadcastStore, useBroadcastValue} from './createBroadcastStore'
import {startTyping} from './textTyper'

const SAMPLE_TEXT = `Programmatically changing the value of a text input or a textsrea\b\b\b\barea makes the text cursor jump to the end. This results in a poor user experience, effectively making textareas and text inputs unsuitable for collaborative editing.

This library solves the problem by applying the cursor preservation technique described by Neil Fraser in his 2009 article (link below *).

This is a live demo. You're looking at a multiplayer textarea (left) side-by-side with a native textarea (right). Try typing or selecting in either side while the auto-typer is running — notice how only the multiplayer textarea keeps your cursor where you left it.

Open this page in another browser tab to see the value sync across tabs via BroadcastChannel.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit risus turpis, nec fermentum purus pretium sit amet. Duis vitae erat et nisi porttitor ultrices. Phasellus ut facilisis odio. Pellentesque rhoncus ex non elit scelerisque, in ullamcorper arcu posuere. Pellentesque interdum blandit odio, at sollicitudin orci fringilla in. Curabitur pulvinar, sem sit amet convallis mattis, ex odio vulputate sapien, ac aliquam arcu magna at enim.

Aenean egestas scelerisque arcu, vel euismod purus faucibus in. Pellentesque non leo pharetra, cursus arcu sit amet, scelerisque mi. Fusce mattis sodales quam, nec pulvinar lacus. Nulla eu blandit quam, ut euismod ipsum.

Praesent nec vehicula odio. Maecenas eu iaculis lacus. Cras luctus, sem quis sodales accumsan, libero ipsum feugiat lectus, at blandit sapien lacus vehicula orci.

`

const store = createBroadcastStore<string>('react-multiplayer-input:demo', SAMPLE_TEXT)

export function DemoApp() {
  const [value, setValue] = useBroadcastValue(store)
  const [typing, setTyping] = useState(false)
  const mirrorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!typing || !mirrorRef.current) return
    return startTyping(
      mirrorRef.current,
      SAMPLE_TEXT,
      () => Math.random() * 20 + Math.random() * 100,
      () => setTyping(false),
    )
  }, [typing])

  return (
    <div className="rmi-demo">
      <div className="rmi-demo__toolbar">
        <button
          type="button"
          className="rmi-demo__button"
          onClick={() => setTyping((v) => !v)}
        >
          {typing ? 'Pause auto-typer' : 'Start auto-typer'}
        </button>
        <button
          type="button"
          className="rmi-demo__button"
          onClick={() => {
            setTyping(false)
            setValue(SAMPLE_TEXT)
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="rmi-demo__button"
          onClick={() => {
            setTyping(false)
            setValue('')
          }}
        >
          Clear
        </button>
      </div>
      <div className="rmi-demo__panes">
        <div className="rmi-demo__pane">
          <div className="rmi-demo__pane-label">MultiplayerTextArea</div>
          <MultiplayerTextArea
            className="rmi-demo__textarea"
            rows={22}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </div>
        <div className="rmi-demo__pane">
          <div className="rmi-demo__pane-label">Native &lt;textarea&gt;</div>
          <textarea
            className="rmi-demo__textarea"
            rows={22}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </div>
      </div>
      <p className="rmi-demo__hint">
        *){' '}
        <a href="https://neil.fraser.name/writing/cursor/" target="_blank" rel="noreferrer">
          Cursors in Collaborative Documents — Neil Fraser
        </a>
      </p>
      <textarea
        ref={mirrorRef}
        style={{display: 'none'}}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        readOnly
      />
    </div>
  )
}
