```scope
MiniPlayer
asset
```

# Mini Player

The bottom-floating bar — the player's "always there" state. Cover thumb, title + artist, play/pause. Tap the cover/metadata block to expand to `FullPlayer`. A thin pink (highlight) progress strip across the top edge shows where the track is.

**Responsive shape** baked into the component:

- Default (< `md:`, M500 territory) — edge-to-edge bar with a single top border. Reads as the bottom edge of the viewport.
- `md:` and up — rounded card with full border + drop shadow. Reads as a floating panel anchored bottom-right.

The actual fixed positioning lives at the call site via `className` so the docs can render the bar inline. See [Production wrapping](#production-wrapping) below for the AppShell recipe.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="w-full max-w-md">
      <MiniPlayer
        title="World Is Mine"
        artist="supercell"
        coverUrl={asset("wallpaper.jpg")}
        playing={playing}
        progress={0.42}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
    </div>
  );
};
```

## Examples

### With progress

The thin pink strip across the top reads as playback state — not interactive (the real scrubber lives in `FullPlayer`), just a positional hint so a glance at the bar tells you how far through the track you are.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <MiniPlayer
        title="World Is Mine"
        artist="supercell"
        coverUrl={asset("wallpaper.jpg")}
        playing={playing}
        progress={0.12}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
      <MiniPlayer
        title="Tell Your World"
        artist="livetune feat. Hatsune Miku"
        playing={playing}
        progress={0.55}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
      <MiniPlayer
        title="Romeo and Cinderella"
        artist="doriko"
        playing={playing}
        progress={0.94}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
    </div>
  );
};
```

### Without progress

`progress` is optional. Omit it for the moment between track-change and first metadata frame, or for surfaces where progress would be redundant.

```tsx preview
() => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="w-full max-w-md">
      <MiniPlayer
        title="Senbonzakura"
        artist="Kurousa-P feat. Hatsune Miku"
        coverUrl={asset("wallpaper.jpg")}
        playing={playing}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
    </div>
  );
};
```

### Wide viewport — prev / next visible

`onPrev` and `onNext` are optional handlers. When provided, the corresponding IconButtons render only on `sm:` and up — the M500's narrow portrait keeps the bar uncluttered with just play/pause; widen the viewport (≥ 640 px) and prev/next appear.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="w-full max-w-2xl">
      <MiniPlayer
        title="The Disappearance of Hatsune Miku"
        artist="cosMo @BousouP"
        coverUrl={asset("wallpaper.jpg")}
        playing={playing}
        progress={0.31}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </div>
  );
};
```

### Production wrapping

The component is presentation-only — give it positioning via `className`. The AppShell recipe is `fixed inset-x-0 bottom-0` on mobile (full-bleed), then `md:` overrides anchor it bottom-right with breathing room. `md:max-w-sm` caps the card width so it doesn't span an absurd amount of the desktop viewport.

```tsx
<MiniPlayer
  className={cn(
    "fixed inset-x-0 bottom-0 z-40",
    "md:inset-x-auto md:left-auto md:right-4 md:bottom-4 md:max-w-sm",
  )}
  …
/>
```

Mobile: `inset-x-0 bottom-0` makes the bar span the bottom edge. Desktop: `md:inset-x-auto md:left-auto md:right-4 md:bottom-4` releases the left edge and pins to the bottom-right with 16 px margin; `md:max-w-sm` (24 rem / 384 px) caps the card.

The component-level styling (rounded corners + border + shadow) kicks in automatically at `md:` so the floating-card shape comes for free — the `className` only carries position.

### Fallback artwork

Missing `coverUrl` falls back to the music-note placeholder at the same 48 px footprint, so the bar height stays stable while artwork loads (or doesn't).

```tsx preview
() => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="w-full max-w-md">
      <MiniPlayer
        title="Untitled rip — track 03"
        artist="(unknown artist)"
        playing={playing}
        progress={0.18}
        onPlayPause={() => setPlaying((p) => !p)}
        onExpand={() => {}}
      />
    </div>
  );
};
```

## Props

### MiniPlayer

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Track title. Truncates to one line."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Track artist. Truncates to one line."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover thumbnail URL. Falls back to the CoverArt placeholder at 48 px."
  },
  {
    "prop": "playing",
    "type": "boolean",
    "default": "—",
    "description": "Whether playback is active. Drives the play/pause icon swap."
  },
  {
    "prop": "progress",
    "type": "number",
    "default": "—",
    "description": "0–1 fraction. Drives the thin highlight (pink) strip across the top of the bar. Hidden when omitted."
  },
  {
    "prop": "onPlayPause",
    "type": "() => void",
    "default": "—",
    "description": "Required. Fires when the play/pause button is tapped."
  },
  {
    "prop": "onExpand",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the cover/metadata block is tapped. Wire to whatever opens FullPlayer (state flip, sheet open, etc.)."
  },
  {
    "prop": "onPrev",
    "type": "() => void",
    "default": "—",
    "description": "Optional. When provided, a prev IconButton renders on `sm:` and up."
  },
  {
    "prop": "onNext",
    "type": "() => void",
    "default": "—",
    "description": "Optional. When provided, a next IconButton renders on `sm:` and up."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer row. Use for fixed-bottom positioning (`fixed bottom-0 inset-x-0`) when mounting in the AppShell."
  }
]
```

## Accessibility

- The cover/metadata block is a `<button>` with `aria-label="Expand player"`. Single tab stop for the expand action.
- Each transport control is its own IconButton with explicit `aria-label` ("Play" / "Pause" / "Previous track" / "Next track"). Their click handlers don't bubble to the expand button — they're sibling nodes, not nested inside.
- The progress strip is `aria-hidden`. Non-interactive visual indicator only; the real scrubber lives in `FullPlayer` with proper ARIA range semantics.
