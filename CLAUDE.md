# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`react-multiplayer-input` is a drop-in replacement for native `<input>` / `<textarea>` (and compatible React components) that preserves caret, selection, and scroll position when `value` is updated by a remote source — for collaborative/multiplayer editing scenarios.

Published as an ESM + CJS dual package via `@sanity/pkg-utils`. Built against React 19. Peer-depends on `react ^19`.

## Commands

This is a pnpm workspace (root + `docs/`). Use pnpm.

- `pnpm build` — build the package (`pkg build --strict --check --clean`)
- `pnpm dev` — watch-mode build (`pkg watch --strict`)
- `pnpm test` — jsdom unit tests + type-level tests (the `unit` vitest project)
- `pnpm test:browser` — browser tests (the `browser` vitest project, runs against Chromium, Firefox, and WebKit via Playwright)
- `pnpm test:browser --browser=chromium` — run browser tests against a single engine (also `firefox`, `webkit`)
- `pnpm test:all` — both projects
- `pnpm test:watch` — vitest watch on the unit project
- `pnpm test:ui` — vitest UI
- Run a single test file: `pnpm vitest run src/utils/applyDiff.test.ts`
- `pnpm typecheck` — typecheck against `tsconfig.dist.json` (the publishable surface)
- `pnpm typecheck:docs` — typecheck the docs workspace
- `pnpm lint` — eslint over the repo
- `pnpm check` — typecheck + build + unit tests (use before pushing). Browser tests are *not* in `check` — run `pnpm test:browser` separately if you have Playwright installed.
- `pnpm docs` — run the local VitePress site

Releases are automated via `release-please` (see `.github/workflows/release-please.yml`); do not bump versions manually.

## Architecture

The core idea: native inputs lose caret/selection state when their `value` prop is replaced wholesale (as happens in a CRDT/OT collaborative session). This library wraps an input so that on every `value` change it patches the DOM with character-level ops via `HTMLInputElement.setRangeText(text, start, end, 'preserve')` — *before* React's controlled-input commit runs. The browser preserves caret, selection, and scroll per the `'preserve'` selectMode contract. React skips its own `element.value = nextValue` write because the DOM already matches.

### Key files

- `src/createMultiplayerInput.tsx` — the factory. Returns a function component that:
  - Renders the underlying input/textarea as **uncontrolled** (`defaultValue`, not `value`), so React never writes `el.value = X` and never snaps the caret. The initial value is captured once via `useRef`.
  - Has a `useLayoutEffect` keyed on `value`: when the prop differs from the DOM value, calls `applyDiff(element, nextValue)` to patch the DOM.
  - Wraps the consumer's `onChange` so events fired by our own `applyDiff` (via `setRangeText`'s `input` event) are filtered out via an `applyingRef` flag — the consumer only hears about genuine user input.
  - From the outside, the API still looks fully controlled (`value` + `onChange`). Internally, the DOM is the source of truth.

- `src/utils/applyDiff.ts` — single function `applyDiff(element, nextValue)`. Computes `makeDiff(element.value, nextValue)` from `@sanity/diff-match-patch`, walks the diff, applies each insert/delete via `setRangeText(text, start, end, 'preserve')`. Track `offset` across ops: advance on EQUAL and INSERT, don't advance on DELETE (the DOM has shrunk under you).

- `src/MultiplayerInput.tsx` / `src/MultiplayerTextArea.tsx` — pre-built specializations: `createMultiplayerInput('input')` and `createMultiplayerInput('textarea')`.

- `src/index.ts` — public surface: the factory plus the two pre-built specializations.

### Type generics

`createMultiplayerInput<C>` accepts `'input'`, `'textarea'`, or any `ComponentType`. The returned props type is conditionally narrowed (`ReturnedComponentProps`):
- For `'input'`: props are `ComponentProps<'input'>` but `type` is restricted to text-like inputs (`text | search | tel | url | password | email`) — only inputs whose `selectionStart` / `setSelectionRange` are valid per the MDN spec.
- For `'textarea'`: full `ComponentProps<'textarea'>`.
- For a custom component: original props but `value` is forced to `string`.

Type-level tests live in `src/__test__/types.test-d.tsx` and are executed by vitest's `--typecheck` (configured via `tsconfig.dist.json` in `vitest.config.ts`). When changing the generic, update those `@ts-expect-error` cases.

### Tests

- `src/utils/applyDiff.test.ts` — jsdom unit tests for `applyDiff`. jsdom 29 implements `setRangeText` with correct `'preserve'` semantics.
- `src/__test__/browser/*.test.tsx` — `vitest-browser-react` + Playwright. Cover caret preservation, range selection preservation, scroll preservation, ref forwarding, selection direction across remote updates, and native undo behavior. Runs against Chromium, Firefox, and WebKit. CI runs them per-engine via `.github/workflows/browser-tests.yml`. Local Firefox/WebKit may fail to launch under macOS sandboxing (e.g. agent-safehouse only has a Chromium profile); use `--browser=chromium` to filter.

## Constraints worth knowing

- The consumer-facing API is **controlled** (`value` + `onChange`), but the underlying DOM input is rendered uncontrolled internally. Consumers can't pass `defaultValue` — that slot belongs to the wrapper for capturing the initial value.
- The text cursor's blink animation resets on each `value` update. Under very high update frequency the caret can appear static.
- Native undo: a user can undo their own keystrokes, but can't undo a remote peer's edit (the `setRangeText` calls used to apply remote updates don't push undo entries). In Chromium, a remote update also seems to invalidate the user's existing undo entries.

## Code style

- ESLint config is flat (`eslint.config.mjs`): `simple-import-sort` enforces import ordering, `consistent-type-imports` requires inline `type` imports, `no-console: error`. The `unused-imports/no-unused-vars` rule ignores `_`-prefixed names.
- Prettier config is `@sanity/prettier-config`.
- The `docs/` workspace is a VitePress site at `docs/index.md` + `docs/guide/` + `docs/api/`. The live demo at the bottom of the home page uses a `BroadcastChannel`-based store to simulate multiplayer edits across browser tabs.
