```scope
TrackRow
asset
```

# Track Row

Compact horizontal list-row for the library track lists, queue, and search results. Three-line metadata stack — title, artist (or `<artist> · <album>`), and a tertiary tech-specs line joining duration · format · bitrate · bitDepth. The whole row is one button; track-action UX (play / queue / more-options) lives elsewhere — the row stays compact for narrow viewports.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <TrackRow
    title="World Is Mine"
    artist="supercell"
    album="World Is Mine"
    duration="4:08"
    format="FLAC"
    bitrate="1411 kbps"
    bitDepth="16-bit"
    coverUrl={asset("wallpaper.png")}
  />
  <TrackRow
    title="Tell Your World"
    artist="livetune"
    album="Re:Dial"
    duration="4:25"
    format="FLAC"
    bitrate="3072 kbps"
    bitDepth="24-bit"
  />
  <TrackRow
    title="Romeo and Cinderella"
    artist="doriko"
    album="kiss"
    duration="5:25"
    format="MP3"
    bitrate="320 kbps"
  />
  <TrackRow
    title="The Disappearance of Hatsune Miku"
    artist="cosMo @BousouP"
    duration="3:34"
    format="FLAC"
    bitrate="4608 kbps"
    bitDepth="24-bit"
  />
  <TrackRow
    title="Senbonzakura"
    artist="Kurousa-P"
    duration="3:48"
    format="MP3"
    bitrate="256 kbps"
  />
</div>
```

## Examples

### Playing state

Pass `playing` to mark the currently-playing track. Row fills with the pink `highlight-soft` background, title fills with `text-highlight`. Reads as the only row in the list with state, even from a peripheral glance.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <TrackRow
    title="World Is Mine"
    artist="supercell"
    album="World Is Mine"
    duration="4:08"
    format="FLAC"
    bitrate="1411 kbps"
    bitDepth="16-bit"
  />
  <TrackRow
    title="Tell Your World"
    artist="livetune"
    album="Re:Dial"
    duration="4:25"
    format="FLAC"
    bitrate="3072 kbps"
    bitDepth="24-bit"
    playing
  />
  <TrackRow
    title="Romeo and Cinderella"
    artist="doriko"
    album="kiss"
    duration="5:25"
    format="MP3"
    bitrate="320 kbps"
  />
</div>
```

### Tech specs available subset

`duration`, `format`, `bitrate`, `bitDepth` are all independently optional. Whichever subset is provided joins with `·`; if none are, the tech line disappears and the row falls back to the compact two-line layout.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <TrackRow title="Just duration" artist="example" duration="3:12" />
  <TrackRow title="Just format" artist="example" format="WAV" />
  <TrackRow title="Duration + format" artist="example" duration="4:45" format="FLAC" />
  <TrackRow
    title="Hi-res — full specs"
    artist="example"
    duration="6:12"
    format="FLAC"
    bitrate="9216 kbps"
    bitDepth="24-bit"
  />
  <TrackRow title="No tech specs at all" artist="example" />
</div>
```

### Without artwork

Cover thumbs use the same fallback as the rest of the system — a music-note glyph on `bg-surface` keeps the row height stable while the library scan finds (or doesn't find) embedded art.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <TrackRow
    title="Untitled rip — track 01"
    artist="(unknown artist)"
    duration="3:12"
    format="FLAC"
    bitrate="1411 kbps"
  />
  <TrackRow
    title="Untitled rip — track 02"
    artist="(unknown artist)"
    duration="4:45"
    format="FLAC"
    bitrate="1411 kbps"
  />
  <TrackRow title="Demo bounce" artist="(unknown artist)" duration="0:42" />
</div>
```

### Compact (no tech specs)

Drop `duration` / `format` / `bitrate` / `bitDepth` for surfaces where the tech line would be noise — a queue list with reorder handles, a search-suggestion strip, etc. The row falls back to the two-line layout.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <TrackRow title="World Is Mine" artist="supercell" />
  <TrackRow title="Tell Your World" artist="livetune" />
  <TrackRow title="Romeo and Cinderella" artist="doriko" />
</div>
```

## Props

### TrackRow

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Track title. Truncated to one line."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Track artist. Renders alone or as `<artist> · <album>` when `album` is provided."
  },
  {
    "prop": "album",
    "type": "string",
    "default": "—",
    "description": "Optional album name. When set, the metadata line reads `<artist> · <album>`."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover thumbnail URL. Falls back to the CoverArt placeholder at the same 56 px footprint."
  },
  {
    "prop": "duration",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted duration (\"3:47\"). Rendered with format / bitrate on the third metadata line."
  },
  {
    "prop": "format",
    "type": "string",
    "default": "—",
    "description": "Codec / container label (\"FLAC\", \"MP3\", \"AAC\", \"WAV\"). Joined with duration and bitrate on the tech-specs line."
  },
  {
    "prop": "bitrate",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted bitrate (\"1411 kbps\", \"320 kbps\"). Joined with duration and format on the tech-specs line."
  },
  {
    "prop": "bitDepth",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted PCM bit depth (\"16-bit\", \"24-bit\", \"32-bit\"). Joined onto the tech-specs line. For the audiophile shorthand `24/96`, pre-format the combined string and pass it via this prop."
  },
  {
    "prop": "playing",
    "type": "boolean",
    "default": "false",
    "description": "Marks this row as the currently-playing track. Row gets `bg-highlight-soft`, title gets `text-highlight`."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project the primary surface onto a different element (typically a router `<Link/>`)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All standard button props pass through to the cover-and-metadata click target."
  }
]
```

## Accessibility

- The whole row is one button — single tab stop, single click target.
- Focus outline uses negative offset so it sits inside the row boundary (positive offset would clip on a list-row that lives inside a bordered container).
- The `playing` prop is a visual marker only. If the row needs to announce playback state to screen readers, add `aria-current="true"` externally.
- Cover art's `alt` is composed as `"<title> — <artist>"` so SR users get both pieces. The tech-specs line is decoration; SR users hear it last and can skip via heading nav.
