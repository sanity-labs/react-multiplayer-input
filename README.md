# react-multiplayer-input

React drop-in for `<input>` and `<textarea>` that preserves cursor and scroll state during collaborative editing.

## The problem

When a text input's `value` is replaced wholesale (as happens when a remote peer's edit arrives in a CRDT/OT session), the browser snaps the caret to the end of the field and resets the scroll position. The user loses their place mid-keystroke, mid-selection, mid-scroll.

This library wraps an input so that on every `value` change it captures a fingerprint of the text around the caret, lets React commit the update, then locates that fingerprint in the new text and restores the selection and scroll position. The technique is the one described in Neil Fraser's [Cursors in Collaborative Documents](https://neil.fraser.name/writing/cursor/) and originally implemented in Google MobWrite. Fuzzy matching is delegated to [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch).

## Install

```sh
npm install react-multiplayer-input
```

Peer dependency: `react` ^19.

## Usage

### Textarea

```tsx
import {MultiplayerTextArea} from 'react-multiplayer-input'

function Editor({value, onChange}: {value: string; onChange: (v: string) => void}) {
  return (
    <MultiplayerTextArea
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  )
}
```

### Input

```tsx
import {MultiplayerInput} from 'react-multiplayer-input'

<MultiplayerInput
  type="text"
  value={value}
  onChange={(e) => onChange(e.currentTarget.value)}
/>
```

Only text-like input types are accepted: `text`, `search`, `tel`, `url`, `password`, `email`. Other types don't support `selectionStart` / `setSelectionRange` and will be rejected by the type system.

### Wrapping a custom component

If you already have a styled input or are using a component from a UI library, wrap it with `createMultiplayerInput`. The wrapped component must accept a `ref` that resolves to an `HTMLInputElement` or `HTMLTextAreaElement`, and must accept a `value: string` prop.

```tsx
import {createMultiplayerInput} from 'react-multiplayer-input'
import {TextInput} from '@sanity/ui'

const MultiplayerTextInput = createMultiplayerInput(TextInput)
```

## API

```ts
import {
  createMultiplayerInput,
  MultiplayerInput,
  MultiplayerTextArea,
} from 'react-multiplayer-input'
```

- **`MultiplayerInput`** — wrapped `<input>`. Restricted to text-like `type` values.
- **`MultiplayerTextArea`** — wrapped `<textarea>`.
- **`createMultiplayerInput(Component)`** — factory that wraps `'input'`, `'textarea'`, or any React component whose props include `value: string` and which forwards refs to an underlying input or textarea element.

All three forward refs to the underlying DOM element.

## Known limitations

- The text cursor's blink animation resets on every `value` update. Under very high update frequency the caret can appear to stop blinking.
- Replacing `value` wipes the browser's native undo history for that field, so the built-in undo/redo doesn't work. You'll need to implement undo at the application layer.

## Development

This repo is a pnpm workspace. The package lives at the root; a Vite demo lives in `docs/`.

```sh
pnpm install
pnpm test          # vitest, including type-level tests
pnpm typecheck
pnpm lint
pnpm build
pnpm docs          # run the local demo
```

## Credits

Cursor preservation algorithm by Neil Fraser (Google MobWrite). Diff and fuzzy match via [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch).

## License

MIT
