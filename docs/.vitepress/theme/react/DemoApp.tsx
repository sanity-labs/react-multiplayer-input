import {useEffect, useRef, useState} from 'react'
import {MultiplayerTextArea} from 'react-multiplayer-input'

import {createBroadcastStore, useBroadcastValue} from './createBroadcastStore'
import {startTyping} from './textTyper'

const SAMPLE_TEXT = `Programatically\b\b\b\b\b\b\b\b\bmmatically changing the value of a text input or a textsrea\b\b\b\barea makes the text cursor jump to teh\b\bhe end. This results in a poor user experience, effectively making textareas and text inputs unsuitabel\b\ble for collaborative editing.

This library solves the problem by patching the DOM via setRangeText('preserve') before React's controlled-input commmit\b\b\b\bmit runs — the browser keeps the caret where it is.

This is a live demo. You're looking at a multiplayer textarea (left) side-by-side with a native textarea (right). Try typing or selecting in either side while the auto-typer is runnning\b\b\b\bing — notice how only the multiplayer textarea keeps your cursor where you left it.

Open this page in another browser tab to see the value sync across tabs via BoradcastChannel\b\b\b\b\b\b\b\b\b\b\b\b\b\b\broadcastChannel.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit risus turpis, nec fermentum purus pretium sit amet. Duis vitae erat et nisi porttitor ultrices. Phasellus ut facilisis odio. Pellentesque rhoncus ex non elit scelerisque, in ullamcorper arcu posuere. Pellentesque interdum blandit odio, at sollicitudin orci fringilla in. Curabitur pulvinar, sem sit amet convallis mattis, ex odio vulputate sapien, ac aliquam arcu magna at enim.

Aenean egestas scelerisque arcu, vel euismod purus faucibus in. Pellentesque non leo pharetra, cursus arcu sit amet, scelerisque mi. Fusce mattis sodales quam, nec pulvinar lacus. Nulla eu blandit quam, ut euismod ipsum.

Praesent nec vehicula odio. Maecenas eu iaculis lacus. Cras luctus, sem quis sodales accumsan, libero ipsum feugiat lectus, at blandit sapien lacus vehicula orci.

`

const store = createBroadcastStore<string>('react-multiplayer-input:demo', '')

/**
 * Per-character delay that approximates human typing cadence. Returns the
 * delay (ms) to wait *after* typing `char` before the next keystroke.
 */
function humanLikeDelay(char: string): number {
  // Base: 50-120ms, triangle-like distribution (two summed uniforms)
  let ms = 30 + Math.random() * 40 + Math.random() * 50

  if (char === '.' || char === '!' || char === '?') {
    ms += 300 + Math.random() * 400 // end-of-sentence pause
  } else if (char === ',' || char === ';' || char === ':') {
    ms += 150 + Math.random() * 150 // mid-sentence breath
  } else if (char === '\n') {
    ms += 200 + Math.random() * 300 // line break
  } else if (char === ' ') {
    ms += 20 + Math.random() * 30 // tiny pause between words
  } else if (char === '\b') {
    ms = 40 + Math.random() * 40 // backspaces are fast
  }

  // Occasional thinking pause
  if (Math.random() < 0.02) {
    ms += 400 + Math.random() * 500
  }

  return ms
}

export function DemoApp() {
  const [value, setValue] = useBroadcastValue(store)
  const [typing, setTyping] = useState(false)
  const mirrorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!typing || !mirrorRef.current) return
    return startTyping(mirrorRef.current, SAMPLE_TEXT, humanLikeDelay, () => setTyping(false))
  }, [typing])

  return (
    <div className="rmi-demo">
      <div className="rmi-demo__toolbar">
        <button
          type="button"
          className="rmi-demo__button"
          onClick={() => {
            if (!typing) setValue('')
            setTyping((v) => !v)
          }}
        >
          {typing ? 'Pause auto-typer' : 'Start auto-typer'}
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
        Read more about{' '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText"
          target="_blank"
          rel="noreferrer"
        >
          HTMLInputElement.setRangeText()
        </a>{' '}
        on MDN.
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
