# Wrapping a custom component

If you already have a styled input or are using a component from a UI library, wrap it with `createMultiplayerInput`. The wrapped component must accept a `ref` that resolves to an `HTMLInputElement` or `HTMLTextAreaElement`, and must accept `defaultValue` and `onChange` props (the wrapper renders the underlying component as uncontrolled internally; see [How the wrapper avoids React's caret-snap](#how-the-wrapper-avoids-react-s-caret-snap) below).

```tsx
import {createMultiplayerInput} from 'react-multiplayer-input'
import {TextInput} from '@sanity/ui'

const MultiplayerTextInput = createMultiplayerInput(TextInput)
```

The returned component forwards refs to the underlying DOM element, so you can still grab a reference to the input or textarea from your application code:

```tsx
const ref = useRef<HTMLInputElement>(null)

<MultiplayerTextInput ref={ref} value={value} onChange={…} />
```

## How the wrapper avoids React's caret-snap

A controlled input writes `element.value = newValue` on every render, which resets the caret. The wrapper renders the underlying input/textarea as **uncontrolled** internally. It passes `defaultValue`, not `value`, so React never writes back to the DOM. When `value` changes from the outside, a `useLayoutEffect` diffs it against the live DOM value and patches via `setRangeText`, which the browser treats as an edit (caret and selection adjust around the change).

The consumer-facing API is still `value` + `onChange`. The wrapper suppresses the change events its own `setRangeText` calls synthesize, so the consumer only hears about real user input.

Two implications for wrapping a custom component:

- The wrapped component must accept `defaultValue`. The wrapper uses that slot to seed the initial value.
- The wrapped component must call its `onChange` prop on real user input. The wrapper's filter relies on receiving those events to forward them to the consumer.
