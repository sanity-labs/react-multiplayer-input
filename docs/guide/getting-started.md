# Getting started

`react-multiplayer-input` is a drop-in replacement for native `<input>` and `<textarea>` that preserves cursor, selection, and scroll position during collaborative editing.

## Why?

When a text input's `value` is replaced wholesale (as happens when a remote peer's edit arrives in a CRDT or OT session), the browser snaps the caret to the end of the field and resets the scroll position. The user loses their place.

This library wraps an input so that when `value` changes, the DOM is patched via `setRangeText('preserve')` (an edit, not a full replacement) before React's controlled-input commit runs. The browser preserves the caret, selection, and scroll position per the W3C `'preserve'` selectMode contract. The character-level diff between the old and new value is computed with [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch).

## Install

::: code-group

```sh [pnpm]
pnpm add react-multiplayer-input
```

```sh [npm]
npm install react-multiplayer-input
```

```sh [yarn]
yarn add react-multiplayer-input
```

```sh [bun]
bun add react-multiplayer-input
```

:::

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
