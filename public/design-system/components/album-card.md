```scope
AlbumCard
asset
```

# Album Card

Cover-art-led tile for the album grid. No card chrome by default — the cover does the visual work, with metadata below. Whole tile is the click target; hover lightens the title to accent so the affordance reads without a frame.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 w-full">
  <AlbumCard title="Supercell" artist="supercell" year={2009} coverUrl={asset("wallpaper.png")} />
  <AlbumCard
    title="World Is Mine"
    artist="supercell"
    year={2008}
    coverUrl={asset("wallpaper.png")}
  />
  <AlbumCard title="Tell Your World" artist="livetune feat. Hatsune Miku" year={2012} />
  <AlbumCard title="Romeo and Cinderella" artist="doriko" year={2009} />
  <AlbumCard title="The Disappearance of Hatsune Miku" artist="cosMo @BousouP" year={2008} />
</div>
```

## Examples

### Without artwork

When a track has no embedded cover, the placeholder fills the same footprint so the grid never reflows.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full max-w-2xl">
  <AlbumCard title="Untitled rip" artist="(unknown artist)" />
  <AlbumCard title="Live recording — 2024-03-12" artist="(unknown artist)" />
  <AlbumCard title="Demo bounce" artist="(unknown artist)" year={2025} />
</div>
```

### Long titles

Title clamps to two lines, artist to one. Keeps row height deterministic in dense grids.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full max-w-2xl">
  <AlbumCard
    title="A Very Long Album Title That Will Definitely Wrap Onto A Second Line"
    artist="An Even Longer Artist Name That Itself Might Want To Truncate"
    year={2024}
  />
  <AlbumCard title="Short title" artist="A·very·long·dotted·artist·collaboration·credit·string" />
</div>
```

### As link

Pass `render={<Link to="..." />}` to mount the card as a router link instead of a button — gets correct semantics and middle-click-to-new-tab for free.

```tsx preview
<div className="w-44">
  <AlbumCard title="Click me" artist="(opens in same tab)" render={<a href="#album-detail" />} />
</div>
```

## Props

### AlbumCard

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Album name. Clamped to two lines."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Album artist. Truncated to a single line."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover image URL. When omitted, the CoverArt placeholder fills the same footprint."
  },
  {
    "prop": "year",
    "type": "number",
    "default": "—",
    "description": "Release year. Appears as `artist · year` in the subtitle when set."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project the card onto a different element (typically a router `<Link/>`). Defaults to a native `<button>`."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All standard button props (`onClick`, `disabled`, etc.) pass through."
  }
]
```

## Accessibility

- The whole tile is one button — single tab stop, single click target, no nested interactives. Hover and focus styles apply to the entire surface.
- Cover art's `alt` is composed as `\"<title> — <artist>\"` so screen readers announce both pieces alongside the metadata text.
- Title hover-tints to `text-accent` rather than introducing a separate hover bg — keeps the visual quiet inside dense grids while still signalling "this is interactive".
