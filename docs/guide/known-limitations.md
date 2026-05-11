# Known limitations

## Caret blink resets on every update

The text cursor's blink animation resets each time `value` changes. Under very high update frequency the caret can appear to stop blinking. There's no API to keep the blink running across value replacements — the only workaround is to keep update frequency reasonable.

## Native undo history is wiped

Replacing `value` wholesale wipes the browser's native undo stack for that field, so <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> won't undo individual edits. You'll need to implement undo at the application layer — for collaborative editing this is generally what you want anyway, since native undo doesn't understand a shared document model.

## Fuzzy matching can fail on heavy edits

The cursor is relocated by matching a 16-character fingerprint around the caret in the new text. If the surrounding text changes drastically between the fingerprint capture and the commit, the match can fall back to the closest approximation or fail entirely. In practice this is rare during normal collaborative editing but can happen with bulk replace operations.
