# Getting started

`react-multiplayer-input` is a drop-in replacement for native `<input>` and `<textarea>` that preserves cursor, selection, and scroll position during collaborative editing.

## The problem

When a text input's `value` is replaced wholesale — as happens when a remote peer's edit arrives in a CRDT or OT session — the browser snaps the caret to the end of the field and resets the scroll position. The user loses their place mid-keystroke, mid-selection, mid-scroll.

This library wraps an input so that on every `value` change it captures a fingerprint of the text around the caret, lets React commit the update, then locates that fingerprint in the new text and restores the selection and scroll position. The technique is the one described in Neil Fraser's [Cursors in Collaborative Documents](https://neil.fraser.name/writing/cursor/) and originally implemented in Google MobWrite. Fuzzy matching is delegated to [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch).

## Install

::: code-group

```sh [npm]
npm install react-multiplayer-input
```

```sh [pnpm]
pnpm add react-multiplayer-input
```

```sh [yarn]
yarn add react-multiplayer-input
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
