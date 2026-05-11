---
layout: home

hero:
  name: React Multiplayer Input
  tagline: Drop-in replacement for native <input> and <textarea> that preserves cursor, selection, and scroll position during collaborative editing.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/sanity-io/react-multiplayer-input

features:
  - title: Caret-preserving
    details: Selection survives remote value updates. No more cursor jumping to the end when a peer types.
  - title: Scroll-preserving
    details: Scroll position is captured before each commit and restored after, so the user stays where they were reading.
  - title: Drop-in
    details: Replace native <input> or <textarea>, or wrap your own styled component. Same props, same refs.
---

<div style="max-width: 960px; margin: 3rem auto; padding: 0 1.5rem;">

## Live demo

The multiplayer textarea on the left and a native textarea on the right share the same value via `BroadcastChannel`. Open this page in another tab to see the value sync across tabs. Start the auto-typer to see how the multiplayer version keeps your cursor in place while remote edits stream in.

<Demo />

</div>
