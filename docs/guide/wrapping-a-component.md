# Wrapping a custom component

If you already have a styled input or are using a component from a UI library, wrap it with `createMultiplayerInput`. The wrapped component must accept a `ref` that resolves to an `HTMLInputElement` or `HTMLTextAreaElement`, and must accept a `value: string` prop.

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

## Why a class component?

Cursor capture has to happen **before** React commits the update — once the new `value` is in the DOM, the browser has already moved the caret to the end. Class components have `getSnapshotBeforeUpdate` for exactly this purpose; function components have no equivalent hook. That's why `createMultiplayerInput` returns a class-based wrapper. From the outside, this is invisible: you still get a regular React component that accepts refs and props.
