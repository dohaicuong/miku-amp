```scope
DirectoryRow
asset
```

# Directory Row

List row used by the library's Folders view to drill into a subdirectory. Folder icon (cyan-tinted) on the left, two-line meta in the middle (name + recursive track count), chevron on the right cueing the drill action. The whole row is one button — single tab stop, single hit area.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden divide-y divide-border">
  <DirectoryRow name="Clockwork Lullaby" trackCount={12} />
  <DirectoryRow name="Count Twilight's Invitation Inhumanely Invitations" trackCount={8} />
  <DirectoryRow name="EVILS COURT" trackCount={11} />
</div>
```

## Examples

### Singular vs. plural

The track-count line auto-pluralises — `1 track` vs `0 tracks` / `12 tracks`. Pass `0` explicitly for an empty folder; the row still renders so the user can drill in to confirm.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden divide-y divide-border">
  <DirectoryRow name="Single-track release" trackCount={1} />
  <DirectoryRow name="Empty placeholder folder" trackCount={0} />
  <DirectoryRow name="Bigger album" trackCount={42} />
</div>
```

### Long names

Names truncate to one line with ellipsis. Folder titles in audiophile libraries can run long ("EVILS COURT - Crime That Reveals the Tail"); the row keeps a deterministic height so the list stays scannable.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden divide-y divide-border">
  <DirectoryRow name="Waltz of the Deceased - Deadly Sins of Evil SEKAI EDITION+" trackCount={16} />
  <DirectoryRow
    name="A·very·long·dotted·release·name·that·will·certainly·truncate"
    trackCount={3}
  />
</div>
```

### With cover

Pass `coverUrl` and the folder icon swaps for a 48 px cover thumbnail (uses the same `CoverArt` component as elsewhere, so a missing / failed URL falls back to the music-note placeholder). Useful for browse-by-album surfaces where the row points at a directory but the visual is the artwork. Any value for `coverUrl` switches to cover mode — including an empty string, which renders the placeholder.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden divide-y divide-border">
  <DirectoryRow name="Tell Your World" trackCount={11} coverUrl={asset("wallpaper.jpg")} />
  <DirectoryRow name="World Is Mine" trackCount={9} coverUrl="" />
  <DirectoryRow name="Senbonzakura" trackCount={14} coverUrl={asset("wallpaper.jpg")} />
</div>
```

### As a router link

Pass `render={<Link to="..." />}` to mount the row as a router link instead of a button — same pattern as `AlbumCard` and `ArtistCard`. Gets the right semantics for middle-click-to-new-tab and keyboard activation for free.

```tsx preview
<div className="border border-border rounded-md w-full max-w-md overflow-hidden">
  <DirectoryRow name="Tap me" trackCount={9} render={<a href="#directory-row-link" />} />
</div>
```

## Props

### DirectoryRow

```json props
[
  {
    "prop": "name",
    "type": "string",
    "default": "—",
    "description": "Folder name. Truncated to one line."
  },
  {
    "prop": "trackCount",
    "type": "number",
    "default": "—",
    "description": "Recursive count of audio files under this folder. Renders as `\"12 tracks\"` (or `\"1 track\"`) under the name. Pass 0 for an empty folder; the row still renders."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "When provided, replaces the folder icon with a 48 px CoverArt thumbnail. Falls back to the music-note placeholder for missing / failed URLs. Any value (including an empty string) switches the row to cover mode; omit the prop to keep the default folder icon."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project the row onto a different element (typically a router `<Link/>`). Defaults to a native `<button>`."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All standard button props (`onClick`, `disabled`, etc.) pass through to the underlying surface."
  }
]
```

## Accessibility

- The whole row is one button — single tab stop, single click target.
- Focus outline uses negative offset so it sits inside the row boundary (positive offset would clip on a list-row that lives inside a bordered container).
- Folder icon and chevron are `aria-hidden` — they're decoration; the visible name + track count carry meaning for AT users.
- No accessible-name composition needed: the name is the button's text content, and the track-count line is read after it as part of the same node.
