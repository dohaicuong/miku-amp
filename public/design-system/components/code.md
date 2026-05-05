```scope
Code
```

# Code

Renders code text — inline by default, multi-line block via the `block` prop. Block code horizontally scrolls long lines with the design system's themed scrollbar (`scroll-style`); inline code wraps in a small chip.

```tsx preview
<p className="text-style-body text-fg">
  Call <Code>play(song)</Code> to load a track into the dock.
</p>
```

## Anatomy

A thin wrapper over `<code>` (and `<pre>` when `block`). No syntax highlighting — the design system intentionally keeps code monochrome to match the surrounding prose density. Reach for a syntax-highlighted block component if a doc surface ever needs it.

```tsx
import { Code } from "@/components/primitives/code";

<Code>track.title</Code>          // inline chip
<Code block>{multilineString}</Code>  // bordered scrollable block
```

## Examples

### Inline

Use inside body copy to mark identifiers, file paths, prop names. Sized as a chip so it doesn't break the line height.

```tsx preview
<div className="flex flex-col gap-2 text-style-body text-fg">
  <p>
    The audio dock subscribes to <Code>useAudio()</Code> and renders whenever{" "}
    <Code>currentSong</Code> changes.
  </p>
  <p>
    Files live under <Code>public/novels/{"<slug>"}/chapters/</Code>.
  </p>
</div>
```

### Block

`block` swaps the rendering for `<pre><code>…</code></pre>` inside a bordered surface. Long lines scroll horizontally with the themed scrollbar; the surface uses `bg-surface` to lift it from the page.

```tsx preview
<Code block>{`import { useAudio } from "@/lib/audio";

const { play, currentSong, close } = useAudio();

play(songs["world-is-mine"]);`}</Code>
```

### Long-line overflow

Long lines stay on one line and the block scrolls horizontally — no soft-wrapping that would break a code structure visually.

```tsx preview
<Code
  block
>{`const veryLongLineThatWillOverflowToShowOffTheHorizontalScroll = "this string is intentionally long so the block has to scroll sideways to reveal it";`}</Code>
```

## Props

### Code

```json props
[
  {
    "prop": "block",
    "type": "boolean",
    "default": "false",
    "description": "Render as a multi-line `<pre><code>` block (bordered, scrollable) instead of an inline chip."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer element (the `<div>` shell for blocks, the `<code>` element for inline)."
  },
  {
    "prop": "...rest",
    "type": "HTMLAttributes<HTMLElement>",
    "default": "—",
    "description": "All standard `<code>` attributes pass through."
  }
]
```

## Accessibility

- Renders semantic `<code>` (and `<pre>` for blocks), so screen readers announce the content as code.
- The block surface itself isn't focusable — content inside scrolls via wheel / touch / keyboard arrows when the wrapper has focus from a click. If a code block needs to be a primary interactive surface (copy-to-clipboard, line numbers), wrap it in a labelled region externally rather than rebuilding the primitive.
