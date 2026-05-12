# react-multiplayer-input

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/name/react-multiplayer-input)](https://npmx.dev/package/react-multiplayer-input)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/react-multiplayer-input)](https://npmx.dev/package/react-multiplayer-input)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/updated/react-multiplayer-input)](https://npmx.dev/package/react-multiplayer-input)

React drop-in for `<input>` and `<textarea>` that preserves caret, selection, and scroll state during collaborative editing.

## Why?

When a text input's `value` prop is replaced with a new string, the browser moves the caret to the end of the field and resets the scroll position. In a collaborative editing session, every remote peer's edit triggers this, so the user can't comfortably type while peers are also typing.

This library wraps an input so that on a `value` change, the DOM is patched via `setRangeText` (an edit, not a replacement) rather than a wholesale assignment. The browser keeps the caret and selection attached to the surrounding text, and scroll position is preserved on Chromium and Safari. See [Known limitations](https://github.com/sanity-labs/react-multiplayer-input/blob/main/docs/guide/known-limitations.md) for Firefox-specific behavior.

## Install

```sh
pnpm add react-multiplayer-input
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

If you already have a styled input or are using a component from a UI library, wrap it with `createMultiplayerInput`. The wrapped component must accept a `ref` that resolves to an `HTMLInputElement` or `HTMLTextAreaElement`, and must accept `defaultValue` and `onChange` props (the wrapper renders the underlying component as uncontrolled internally; see [How it works](#how-it-works)).

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

- **`MultiplayerInput`**: wrapped `<input>`. Restricted to text-like `type` values.
- **`MultiplayerTextArea`**: wrapped `<textarea>`.
- **`createMultiplayerInput(Component)`**: factory that wraps `'input'`, `'textarea'`, or any React component whose props include `value: string` and which forwards refs to an underlying input or textarea element.

All three forward refs to the underlying DOM element.

## How it works

The wrapper passes `defaultValue` to the underlying input instead of `value`. React then never writes `element.value = X` during a commit, which is what would snap the caret. The consumer-facing API still takes `value` and `onChange`.

A `useLayoutEffect` runs when the `value` prop changes:

1. Diffs the current DOM value against the incoming prop ([`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch)).
2. Applies each diff op via [`element.setRangeText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText), which the browser handles as an edit.
3. Filters out the `input`/`change` events that `setRangeText` synthesizes so they don't reach the consumer's `onChange`.

User keystrokes still reach the consumer's `onChange` normally.

## Known limitations

- The caret's blink animation resets on every remote update. Frequent updates make the caret look static.
- Native undo (`Cmd`/`Ctrl`+`Z`) doesn't undo remote edits. Implement undo at the application layer.
- Mouse-drag selection (right-to-left) can collapse if a remote update lands mid-drag.
- Firefox scrolls the textarea toward the caret on every remote update, even when the user has scrolled away.
- Large fields (>10k characters) under heavy update frequency can chug; consider a richer editor.

See the [known limitations guide](https://github.com/sanity-labs/react-multiplayer-input/blob/main/docs/guide/known-limitations.md) for context.

## Development

This repo is a pnpm workspace. The package lives at the root; a VitePress documentation site lives in `docs/`.

```sh
pnpm install
pnpm test          # jsdom unit tests + type-level tests
pnpm test:browser  # Playwright/Chromium browser tests (requires Playwright install)
pnpm test:all      # both
pnpm typecheck
pnpm lint
pnpm build
pnpm docs          # run the local VitePress site
```

## Credits

Diff computation via [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch). Caret preservation via the browser's `setRangeText('preserve')` per the [W3C HTML spec](https://html.spec.whatwg.org/multipage/input.html#dom-textarea/input-setrangetext).

## License

MIT
