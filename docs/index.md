---
layout: home

hero:
  name: React Multiplayer Input
  tagline: A React drop-in for native &lt;input&gt; and &lt;textarea&gt; that preserves caret, selection, and scroll when the value prop is updated from a remote source.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/sanity-labs/react-multiplayer-input

features:
  - title: Caret-preserving
    details: A remote value update leaves the caret and selection where the user had them.
  - title: Scroll-preserving
    details: Scroll position is unchanged when a remote update lands on Chromium and Safari.
  - title: Drop-in
    details: Wraps &lt;input&gt;, &lt;textarea&gt;, or a styled custom component.
---

<div style="max-width: 960px; margin: 3rem auto; padding: 0 1.5rem;">

<p>
  <a href="https://npmx.dev/package/react-multiplayer-input"><img alt="Open on npmx.dev" src="https://npmx.dev/api/registry/badge/name/react-multiplayer-input" /></a>
  <a href="https://npmx.dev/package/react-multiplayer-input"><img alt="Open on npmx.dev" src="https://npmx.dev/api/registry/badge/version/react-multiplayer-input" /></a>
  <a href="https://npmx.dev/package/react-multiplayer-input"><img alt="Open on npmx.dev" src="https://npmx.dev/api/registry/badge/updated/react-multiplayer-input" /></a>
</p>

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

Peer dependency: `react` ^19. See the [getting started guide](/guide/getting-started) for usage.

## Live demo

The multiplayer textarea on the left and a native textarea on the right share the same value via `BroadcastChannel`. Open this page in another tab to see the value sync. Start the auto-typer to compare cursor behavior.

<Demo />

## Known issues

- The caret's blink animation resets on every remote update. Frequent updates make the caret look static.
- Native undo (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd>) doesn't undo remote edits.
- Mouse-drag selection right-to-left can collapse if a remote update lands mid-drag.
- Firefox scrolls the textarea toward the caret on every remote update, even when the user has scrolled away.

See [Known limitations](/guide/known-limitations) for context on each.

</div>
