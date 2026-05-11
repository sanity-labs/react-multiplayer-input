# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`react-multiplayer-input` is a drop-in replacement for native `<input>` / `<textarea>` (and compatible React components) that preserves cursor position and scroll state when `value` is updated by a remote source — for collaborative/multiplayer editing scenarios.

Published as an ESM + CJS dual package via `@sanity/pkg-utils`. Built against React 19. Package is currently marked `private` in `package.json`.

## Commands

This is a pnpm workspace (root + `docs/`). Use pnpm.

- `pnpm build` — build the package (`pkg build --strict --check --clean`)
- `pnpm dev` — watch-mode build (`pkg watch --strict`)
- `pnpm test` — `vitest run --typecheck` (runs both runtime tests and `*.test-d.tsx` type-level tests)
- `pnpm test:watch` — vitest watch with typecheck enabled
- `pnpm test:ui` — vitest UI
- Run a single test file: `pnpm vitest run --typecheck src/__test__/types.test-d.tsx`
- `pnpm typecheck` — typecheck against `tsconfig.dist.json` (the publishable surface)
- `pnpm typecheck:docs` — typecheck the docs workspace
- `pnpm lint` — eslint over the repo
- `pnpm check` — typecheck + build + test (use before pushing)
- `pnpm docs` — run the docs/demo Vite app (`pnpm --filter docs run dev`)

Releases are automated via `release-please` (see `.github/workflows/release-please.yml`); do not bump versions manually.

## Architecture

The core idea: native inputs lose cursor/selection state when their `value` prop is replaced wholesale (as happens in a CRDT/OT collaborative session). This library wraps an input so that on every value change it (a) captures a fingerprint of the cursor's surrounding text *before* React commits the update, then (b) re-locates that fingerprint in the new text and restores selection + scroll *after* commit.

### Key files

- `src/createMultiplayerInput.tsx` — the factory. Returns a `forwardRef`-wrapped class component. **It must remain a class component** because cursor capture relies on `getSnapshotBeforeUpdate` — React function components have no equivalent hook (see the comment in the file). The wrapper:
  - Tracks a `#selectionAnchor` updated on `mousedown` → `selectionchange` → `mouseup`, used to determine selection direction (`forward` / `backward` / `none`).
  - In `getSnapshotBeforeUpdate`, calls `captureCursor` when `value` changes.
  - In `componentDidUpdate`, calls `restoreCursor` with the captured snapshot.
  - `forwardRef` is used so consumers can still pass a ref to the underlying DOM element; the ref is forwarded via an internal `elementRef` prop because class components can't receive forwarded refs directly.

- `src/utils/cursor.ts` — `captureCursor` / `restoreCursor`. Algorithm is ported from Google MobWrite (see the linked Neil Fraser article at the top of the file). It records `padLength=16` characters of prefix+suffix around each selection endpoint as a fingerprint, then uses `@sanity/diff-match-patch`'s `match` + `makeDiff` + `xIndex` to relocate the cursor in the new text with fuzzy matching (`matchDistance: 1000`, `matchThreshold: 0.8`). `padLength` of 16 is half of `MAX_BITS` in diff-match-patch's patch constants — don't raise it past that without checking the upstream constant.

- `src/MultiplayerInput.tsx` / `src/MultiplayerTextArea.tsx` — pre-built specializations: `createMultiplayerInput('input')` and `createMultiplayerInput('textarea')`.

- `src/index.ts` — public surface: the factory plus the two pre-built specializations.

### Type generics

`createMultiplayerInput<C>` accepts `'input'`, `'textarea'`, or any `ComponentType`. The returned props type is conditionally narrowed (`ReturnedComponentProps`):
- For `'input'`: props are `ComponentProps<'input'>` but `type` is restricted to text-like inputs (`text | search | tel | url | password | email`) — only inputs whose `selectionStart` / `setSelectionRange` are valid per the MDN spec.
- For `'textarea'`: full `ComponentProps<'textarea'>`.
- For a custom component: original props but `value` is forced to `string`.

Type-level tests live in `src/__test__/types.test-d.tsx` and are executed by vitest's `--typecheck` flag (configured via `tsconfig.dist.json` in `vitest.config.ts`). When changing the generic, update those `@ts-expect-error` cases.

## Known caveats (from README)

- Text cursor blinking resets on each `value` update; high-frequency updates make the caret appear static.
- The browser's native undo history is wiped when `value` is replaced — no undo support.

## Code style

- ESLint config is flat (`eslint.config.mjs`): `simple-import-sort` enforces import ordering, `consistent-type-imports` requires inline `type` imports, `no-console: error`.
- Prettier config is `@sanity/prettier-config`.
- The `docs/` workspace is a separate Vite app demoing the components with a `BroadcastChannel`-based store to simulate multiplayer edits across browser tabs.
