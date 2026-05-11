# API reference

```ts
import {
  createMultiplayerInput,
  MultiplayerInput,
  MultiplayerTextArea,
} from 'react-multiplayer-input'
```

## `MultiplayerInput`

Wrapped `<input>`. Restricted to text-like `type` values: `text`, `search`, `tel`, `url`, `password`, `email`. Forwards refs to the underlying `HTMLInputElement`.

```tsx
<MultiplayerInput type="text" value={value} onChange={…} />
```

## `MultiplayerTextArea`

Wrapped `<textarea>`. Forwards refs to the underlying `HTMLTextAreaElement`.

```tsx
<MultiplayerTextArea value={value} onChange={…} />
```

## `createMultiplayerInput(Component)`

Factory that wraps `'input'`, `'textarea'`, or any React component whose props include `value: string` and which forwards refs to an underlying input or textarea element.

```ts
function createMultiplayerInput<C extends 'input' | 'textarea' | ComponentType<any>>(
  Component: C,
): ComponentType<ReturnedComponentProps<C>>
```

The return type is conditionally narrowed:

- For `'input'`: props are `ComponentProps<'input'>` but `type` is restricted to the text-like values listed above.
- For `'textarea'`: full `ComponentProps<'textarea'>`.
- For a custom component: original props but `value` is forced to `string`.

### Example

```tsx
import {createMultiplayerInput} from 'react-multiplayer-input'
import {TextInput} from '@sanity/ui'

const MultiplayerTextInput = createMultiplayerInput(TextInput)
```

See [Wrapping a custom component](/guide/wrapping-a-component) for details and constraints.
