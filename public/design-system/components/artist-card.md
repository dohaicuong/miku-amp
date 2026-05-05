```scope
ArtistCard
asset
```

# Artist Card

Circular-avatar tile for the artist grid. Same vertical-stack rhythm as `AlbumCard` but with a round portrait and centred metadata so artists read as people rather than as another album shelf.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 w-full">
  <ArtistCard name="supercell" subtitle="6 albums" imageUrl={asset("wallpaper.jpg")} />
  <ArtistCard name="livetune" subtitle="3 albums" />
  <ArtistCard name="doriko" subtitle="9 tracks" />
  <ArtistCard name="cosMo @BousouP" subtitle="22 tracks" />
  <ArtistCard name="Kurousa-P" subtitle="4 albums" />
</div>
```

## Examples

### Without subtitle

`subtitle` is optional. Drop it for compact grids where the count would just be noise.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full max-w-2xl">
  <ArtistCard name="supercell" />
  <ArtistCard name="livetune" />
  <ArtistCard name="doriko" />
  <ArtistCard name="Kurousa-P" />
</div>
```

### Long names

Name clamps to two lines, subtitle truncates to one. Keeps row height deterministic.

```tsx preview
<div className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full max-w-2xl">
  <ArtistCard name="A Very Long Composer Pseudonym That Will Wrap" subtitle="2 albums" />
  <ArtistCard name="mothy / Akuno-P / 悪ノP" subtitle="40+ tracks across multiple aliases" />
</div>
```

## Props

### ArtistCard

```json props
[
  {
    "prop": "name",
    "type": "string",
    "default": "—",
    "description": "Artist name. Clamped to two lines."
  },
  {
    "prop": "imageUrl",
    "type": "string",
    "default": "—",
    "description": "Portrait / avatar URL. Falls back to the CoverArt placeholder."
  },
  {
    "prop": "subtitle",
    "type": "string",
    "default": "—",
    "description": "Optional secondary line (e.g. \"6 albums\", \"22 tracks\"). Truncates to one line."
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
    "description": "All standard button props pass through."
  }
]
```

## Accessibility

- The whole tile is one button — single tab stop, single click target.
- Cover art's `alt` is set to the artist name so screen readers don't announce the same string twice.
- Hover lightens both the avatar (`opacity-90`) and the name (`text-accent`) — same dual signal as AlbumCard.
