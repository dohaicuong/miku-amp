```scope
FullPlayer
asset
```

# Full Player

The fullscreen now-playing surface. Hero-cover layout tuned for the M500's portrait viewport — top collapse bar, square cover, title / artist / album block, secondary-action row (lyrics; volume / EQ / filters will join later), scrubber, transport row. Pure presentational; orchestrating the mini ↔ full transition and the action panels is the parent's job.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(125);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="World Is Mine"
        artist="supercell feat. Hatsune Miku"
        album="World Is Mine"
        coverUrl={asset("wallpaper.png")}
        playing={playing}
        progressSec={progressSec}
        durationSec={248}
        quality="FLAC · 16/44.1"
        shuffle={shuffle}
        repeat={repeat}
        onPlayPause={() => setPlaying((p) => !p)}
        onSeek={setProgressSec}
        onCollapse={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() => {
          setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
        }}
        onOpenLyrics={() => {}}
      />
    </div>
  );
};
```

## Examples

### M500 viewport

The intended target: 360 × 640 portrait. Cover sits ~280 px square; title/artist/album, the action row, scrubber, and transport stack below.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(72);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="Tell Your World"
        artist="livetune feat. Hatsune Miku"
        album="Re:Dial"
        coverUrl={asset("wallpaper.png")}
        playing={playing}
        progressSec={progressSec}
        durationSec={265}
        quality="FLAC · 24/96"
        onPlayPause={() => setPlaying((p) => !p)}
        onSeek={setProgressSec}
        onCollapse={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onOpenLyrics={() => {}}
      />
    </div>
  );
};
```

### Desktop hero (wide container)

When the FullPlayer's own container is `@3xl` (≥48 rem) wide the layout flips to a side-by-side hero — cover on the left (~30 rem max), title/artist/quality + scrubber + transport on the right, both columns vertically centred inside `max-w-5xl`. Reads as a real desktop player rather than a stretched portrait. The switch is a container query, not a viewport breakpoint, so a narrow FullPlayer dropped into a wide page (e.g. a 360 px preview frame on a desktop monitor) still gets the portrait layout. The portrait layout in narrower containers stays exactly as the previous examples show.

The preview below pins the FullPlayer at 52 rem and lets the doc frame scroll horizontally if the article isn't wide enough to fit it inline.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(72);
  return (
    <div className="-mx-6 px-6 overflow-x-auto scroll-style">
      <div className="border border-border rounded-md overflow-hidden w-[52rem] h-[640px]">
        <FullPlayer
          title="Tell Your World"
          artist="livetune feat. Hatsune Miku"
          album="Re:Dial"
          coverUrl={asset("wallpaper.png")}
          playing={playing}
          progressSec={progressSec}
          durationSec={265}
          quality="FLAC · 24/96"
          onPlayPause={() => setPlaying((p) => !p)}
          onSeek={setProgressSec}
          onCollapse={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onOpenLyrics={() => {}}
        />
      </div>
    </div>
  );
};
```

### Shuffle + repeat states

Active shuffle / repeat read as `text-accent` (cyan) on the trailing icons; off-state stays muted so the mode-on signal is colour alone.

```tsx preview
() => {
  const [shuffle, setShuffle] = useState(true);
  const [repeat, setRepeat] = useState("one");
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="Romeo and Cinderella"
        artist="doriko feat. Hatsune Miku"
        album="kiss"
        coverUrl={asset("wallpaper.png")}
        playing
        progressSec={210}
        durationSec={325}
        quality="MP3 · 320 kbps"
        shuffle={shuffle}
        repeat={repeat}
        onPlayPause={() => {}}
        onSeek={() => {}}
        onCollapse={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() => {
          setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
        }}
      />
    </div>
  );
};
```

### Without optional metadata

`album`, `quality`, `shuffle`, and `repeat` are all optional. Without them, the corresponding lines and toggles disappear and the layout reflows.

```tsx preview
() => {
  const [playing, setPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(8);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="Untitled rip — track 03"
        artist="(unknown artist)"
        playing={playing}
        progressSec={progressSec}
        durationSec={180}
        onPlayPause={() => setPlaying((p) => !p)}
        onSeek={setProgressSec}
        onCollapse={() => {}}
      />
    </div>
  );
};
```

## Props

### FullPlayer

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Track title. Renders as section-title text, clamped to two lines."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Track artist. Renders as a lead-style line directly under the title."
  },
  {
    "prop": "album",
    "type": "string",
    "default": "—",
    "description": "Optional album label. When set, surfaces as a tertiary caption in the top bar."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover image URL. Falls back to the CoverArt placeholder at the same square footprint."
  },
  {
    "prop": "playing",
    "type": "boolean",
    "default": "—",
    "description": "Whether playback is active. Drives the play/pause icon swap."
  },
  {
    "prop": "progressSec",
    "type": "number",
    "default": "—",
    "description": "Current playback position in seconds. Drives the scrubber + elapsed time."
  },
  {
    "prop": "durationSec",
    "type": "number",
    "default": "—",
    "description": "Total track length in seconds. Drives the scrubber max + remaining time."
  },
  {
    "prop": "onPlayPause",
    "type": "() => void",
    "default": "—",
    "description": "Required. Fires when the big play/pause button is tapped."
  },
  {
    "prop": "onPrev",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the previous-track button is tapped."
  },
  {
    "prop": "onNext",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the next-track button is tapped."
  },
  {
    "prop": "onSeek",
    "type": "(seconds: number) => void",
    "default": "—",
    "description": "Fires when the user releases the scrubber thumb at a new position. Called via Slider's `onValueCommitted`, not on every drag-frame, to avoid thrashing the audio engine."
  },
  {
    "prop": "onCollapse",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the collapse chevron is tapped. Wire to whatever returns to MiniPlayer."
  },
  {
    "prop": "shuffle",
    "type": "boolean",
    "default": "false",
    "description": "Active shuffle state. When true, the shuffle icon tints to `text-accent`."
  },
  {
    "prop": "onToggleShuffle",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the shuffle button is tapped."
  },
  {
    "prop": "repeat",
    "type": "\"off\" | \"all\" | \"one\"",
    "default": "\"off\"",
    "description": "Repeat mode. `all` and `one` tint the icon to `text-accent`; `one` swaps the glyph to the per-track repeat variant."
  },
  {
    "prop": "onCycleRepeat",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the repeat button is tapped. Parent advances `off` → `all` → `one` → `off`."
  },
  {
    "prop": "quality",
    "type": "string",
    "default": "—",
    "description": "Optional tech-spec line under album (e.g. \"FLAC · 24/96\", \"MP3 · 320 kbps\"). Tabular-nums for clean digit rhythm."
  },
  {
    "prop": "onOpenLyrics",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the lyrics action button is tapped. Wire to whatever surfaces the LyricView (full-screen modal on portrait; right-column swap on the @3xl hero). Button is hidden when omitted."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer flex column. Use for layout overrides at the AppShell level."
  }
]
```

## Accessibility

- The scrubber is a real `Slider` with `aria-label="Seek track position"` and a min/max/value range, so screen-reader users hear the position and can step through with arrow keys.
- All transport controls are IconButtons with explicit `aria-label`s — Play / Pause label swaps based on `playing`.
- Shuffle and repeat carry `aria-pressed` (toggle semantics) so AT users hear the active state without needing the colour cue.
- The big play/pause button is sized `h-14 w-14 rounded-full` to be the visually dominant affordance — matches the muscle memory most users bring from native player apps.
