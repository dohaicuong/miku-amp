# Scroll Style

Utility class that themes native browser scrollbars to match the design system. Drop `scroll-style` on any element that scrolls — applies to WebKit (Chrome / Edge / Safari, including Android Chrome) and Firefox. Body already has it via `@apply` in the base layer; nested overflow containers opt in.

```tsx preview
<div className="h-32 w-full max-w-md overflow-y-auto scroll-style border border-border rounded-md p-4 bg-surface">
  <div className="flex flex-col gap-2 text-style-body text-fg">
    <p>Scroll inside this box to see the styled scrollbar.</p>
    <p>
      The thumb sits at <code>var(--border)</code> by default and brightens to{" "}
      <code>var(--fg-muted)</code> on hover.
    </p>
    <p>Track is transparent so it disappears against any surface.</p>
    <p>On Android Chrome the scrollbar auto-hides; on desktop it stays visible.</p>
    <p>Width is 8 px — slim enough not to crowd narrow columns, wide enough to grab.</p>
    <p>Fully rounded thumb (border-radius: 9999px) reads as friendly rather than clinical.</p>
    <p>This sentence is mostly here to make the box overflow.</p>
    <p>And so is this one.</p>
  </div>
</div>
```

## When to use

Anywhere an element has its own `overflow` other than the page itself. The body already inherits `scroll-style` via `@apply` in `@layer base`, so page-level scrolling is themed without per-route opt-in.

Pair it with the overflow utility:

```tsx
<div className="h-64 overflow-y-auto scroll-style">…</div>
<div className="overflow-x-auto scroll-style">…</div>
```

Surfaces in the music player that will use this:

- The track list inside `/library/tracks`
- The album / artist grids
- Drawer contents (settings, queue)
- Long modal/dialog bodies
- Inline horizontal scroll for "recently played" rows
- Code blocks in this very docs system (already wired)

## Cross-browser

| Browser                                           | Implementation                                                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WebKit** (Chrome, Edge, Safari, Android Chrome) | `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track` pseudo-elements                                                               |
| **Firefox**                                       | `scrollbar-width: thin` and `scrollbar-color: var(--border) transparent`                                                                                      |
| **Mobile**                                        | Android Chrome / iOS Safari auto-hide scrollbars during idle and reveal them during scroll. The `scroll-style` thumb colour applies during the visible window |

## Tokens

```json props
[
  {
    "prop": "thumb",
    "type": "var(--border)",
    "default": "—",
    "description": "Default thumb fill colour. Subtle against surfaces — visible enough to grab without competing with content."
  },
  {
    "prop": "thumb (hover)",
    "type": "var(--fg-muted)",
    "default": "—",
    "description": "Thumb fill on cursor hover. Step up in contrast so the user sees the affordance respond."
  },
  {
    "prop": "track",
    "type": "transparent",
    "default": "—",
    "description": "Track is invisible — keeps the scrollbar from drawing a visible channel that competes with the surface it's on."
  },
  {
    "prop": "width",
    "type": "8px",
    "default": "—",
    "description": "Both vertical and horizontal. Slim enough not to crowd narrow columns, thick enough to grab on touch."
  }
]
```
