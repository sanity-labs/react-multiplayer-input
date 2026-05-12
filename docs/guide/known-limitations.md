# Known limitations

## Scroll position can be yanked to the caret on Firefox

In Chromium and Safari, when a remote update lands, the textarea's scroll position stays where the user left it. The caret can be far above or below the visible viewport without disturbing what the user is reading. Firefox doesn't behave this way: any remote update yanks the textarea to scroll the caret back into view, even when the user has deliberately scrolled away.

Gecko appears to run a scroll-into-view pass after `setSelectionRange` on a focused textarea. We haven't found a DOM-level way to suppress it without compromising selection-direction tracking or IME input.

The browser test suite reproduces this in headless Firefox via Playwright and asserts the drift actively, so if a future engine change neutralizes the yank, the test will go red and prompt removing the workaround.

Workarounds at the application layer:
- Debounce remote updates so the user has time to interact between updates.
- For long fields where scroll matters, consider a richer editor (e.g. CodeMirror, ProseMirror) that owns scroll management.

## Backward mouse-drag selection during remote updates

If a remote update arrives while the user is **mouse-dragging a selection backward** (right-to-left), the drag will degrade or collapse. Each `setRangeText` call from a remote update silently shifts the drag's internal anchor onto the focus, so subsequent mouse movement no longer extends the selection from the original click point. It just moves a caret around.

Forward drags (left-to-right) survive remote updates correctly, as does keyboard-driven selection (<kbd>Shift</kbd>+arrow), double/triple-click word/line selection, and any selection set before a drag starts.

This appears to be a browser-engine constraint. `setRangeText` is the only DOM API that lets us mutate the value without snapping the caret to the end, but it doesn't preserve the drag-session anchor, and there's no API to set or query that anchor. The library can't work around this without queueing updates during drags, which would introduce a visible value lag.

In practice this matters mainly when updates arrive at high frequency (multiple per second). For typical collaborative editing with debounced updates, a backward drag usually completes between updates.

## `defaultValue` is reserved

The consumer-facing API takes `value` and `onChange` (controlled-input shape), but internally the wrapper renders the underlying input as **uncontrolled** and uses `defaultValue` to seed its initial value. Passing `defaultValue` to a wrapped component has no effect.

## Performance on very large fields

The wrapper computes a character-level diff on every `value` change via `@sanity/diff-match-patch`'s Myers diff, which is `O(n·m)`. For typical input/textarea content (a few thousand characters at most) and typical remote update frequency (debounced to a few per second), this is fast enough to be invisible. For very large fields (>10k characters) under heavy update frequency, the diff cost can become noticeable; consider a richer editor (CodeMirror, ProseMirror) for that scale.

## Caret blink resets on every update

The text cursor's blink animation resets each time `value` changes. Under very high update frequency the caret can appear to stop blinking. There's no API to keep the blink running across value replacements; the only workaround is to keep update frequency reasonable.

## Remote updates aren't undoable

A user pressing <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> can undo their own keystrokes, but not a remote peer's edit. The `setRangeText` calls the wrapper uses for remote updates don't push entries onto the browser's undo stack. In Chromium, a remote update also appears to invalidate the user's existing undo entries for typing they did before that update arrived.

Implement undo at the application layer. Native undo doesn't understand a shared document model, so a per-user undo built on top of your CRDT/OT history is usually what you want.
