```scope
CoverArt
asset
```

# Cover Art

The image surface every album/track/artist tile + row in the app uses. Renders an `<img>` when a `src` is provided, falls back to a music-note placeholder on `bg-surface` when it isn't. Sizing is the caller's responsibility — pass dimensions via `className`.

```tsx preview
<CoverArt src={asset("wallpaper.png")} alt="World Is Mine — supercell" className="aspect-square w-40" />
```

## Examples

### With image

The standard surface — `<img>` lazy-loaded, `object-cover` to fill any aspect ratio.

```tsx preview
<div className="flex flex-wrap items-end gap-4">
  <CoverArt src={asset("wallpaper.png")} alt="World Is Mine" className="aspect-square w-32" />
  <CoverArt src={asset("wallpaper.png")} alt="World Is Mine" className="aspect-square w-20" />
  <CoverArt src={asset("wallpaper.png")} alt="World Is Mine" className="aspect-square w-12" />
</div>
```

### Missing artwork

No `src` → music-note placeholder on `bg-surface`. Same dimensions; the surface stays consistent so layouts don't reflow when art finishes loading.

```tsx preview
<div className="flex flex-wrap items-end gap-4">
  <CoverArt alt="" className="aspect-square w-32" />
  <CoverArt alt="" className="aspect-square w-20" />
  <CoverArt alt="" className="aspect-square w-12" />
</div>
```

### Rounded variants

`rounded` defaults to `rounded-md` for albums / tracks. Pass `rounded-sm` for tighter list-row thumbnails, `rounded-full` for circular artist avatars.

```tsx preview
<div className="flex flex-wrap items-end gap-4">
  <CoverArt
    alt="Album"
    src={asset("wallpaper.png")}
    className="aspect-square w-24"
    rounded="rounded-md"
  />
  <CoverArt
    alt="Track thumb"
    src={asset("wallpaper.png")}
    className="aspect-square w-12"
    rounded="rounded-sm"
  />
  <CoverArt
    alt="Artist"
    src={asset("wallpaper.png")}
    className="aspect-square w-24"
    rounded="rounded-full"
  />
</div>
```

## Props

### CoverArt

```json props
[
  {
    "prop": "src",
    "type": "string",
    "default": "—",
    "description": "Image URL. When omitted, renders the music-note placeholder."
  },
  {
    "prop": "alt",
    "type": "string",
    "default": "—",
    "description": "Required. Used on the inner `<img>`. Pass an empty string for purely decorative covers; the placeholder branch sets `aria-hidden` either way."
  },
  {
    "prop": "rounded",
    "type": "string",
    "default": "\"rounded-md\"",
    "description": "Tailwind rounding utility. Pass `rounded-sm` for thumbs, `rounded-full` for avatars."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Sizing utilities (`aspect-*`, `w-*`, `h-*`, etc.) and any additional styling."
  },
  {
    "prop": "...rest",
    "type": "HTMLAttributes<HTMLDivElement>",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

## Accessibility

- The wrapper is non-interactive — wrap it in a router `<Link>` or button when the cover art needs to be clickable.
- The `<img>` carries the `alt` you pass. The placeholder branch is `aria-hidden`, on the assumption that surrounding metadata (title + artist) carries the meaning. If that's not the case, set `aria-label` on the wrapper.
- `loading="lazy"` and `decoding="async"` are baked in so a long album grid doesn't block the initial render.
