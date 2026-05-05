```scope
BottomNav
MusicNotesIcon
VinylRecordIcon
UserIcon
PlaylistIcon
WaveformIcon
```

# Bottom Nav

Persistent primary navigation strip for the M500 portrait viewport. Five top-level destinations live here — Tracks · Albums · Artists · Playlists · Now Playing — each with an icon over a small caps label. Items render as TanStack Router `Link`s via the `render` prop and pick up the active tint automatically through `data-status="active"`.

`BottomNav` itself is presentational — positioning (typically `fixed inset-x-0 bottom-0`) is the AppShell's job so the bar can layer above the route content with the mini-player slot stacked between them.

```tsx preview
() => {
  const [active, setActive] = useState("Tracks");
  const items = [
    { label: "Tracks", icon: <MusicNotesIcon /> },
    { label: "Albums", icon: <VinylRecordIcon /> },
    { label: "Artists", icon: <UserIcon /> },
    { label: "Playlists", icon: <PlaylistIcon /> },
    { label: "Now Playing", icon: <WaveformIcon /> },
  ];
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px]">
      <BottomNav>
        {items.map((it) => (
          <BottomNav.Item
            key={it.label}
            icon={it.icon}
            label={it.label}
            aria-current={active === it.label ? "page" : undefined}
            onClick={() => setActive(it.label)}
          />
        ))}
      </BottomNav>
    </div>
  );
};
```

## Examples

### With router Link

In the real AppShell, each `BottomNav.Item` projects onto a TanStack Router `Link`. The router flips `data-status="active"` on the link when its `to` matches the current pathname, and the item's styling picks that up — no manual active-state wiring needed.

```tsx
import { Link } from "@tanstack/react-router";
import {
  MusicNotesIcon,
  VinylRecordIcon,
  UserIcon,
  PlaylistIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import { BottomNav } from "@/components/features/bottom-nav";

<BottomNav>
  <BottomNav.Item icon={<MusicNotesIcon />} label="Tracks" render={<Link to="/library/tracks" />} />
  <BottomNav.Item
    icon={<VinylRecordIcon />}
    label="Albums"
    render={<Link to="/library/albums" />}
  />
  <BottomNav.Item icon={<UserIcon />} label="Artists" render={<Link to="/library/artists" />} />
  <BottomNav.Item
    icon={<PlaylistIcon />}
    label="Playlists"
    render={<Link to="/library/playlists" />}
  />
  <BottomNav.Item icon={<WaveformIcon />} label="Now Playing" render={<Link to="/now-playing" />} />
</BottomNav>;
```

### Inside an AppShell mock

How the bar sits in a real screen — fixed to the bottom of the viewport, mini-player slot stacked above it, route content scrolling underneath. The mock here uses an absolute-positioned bar inside a sized frame so the layering reads at a glance.

```tsx preview
() => {
  const [active, setActive] = useState("Albums");
  const items = [
    { label: "Tracks", icon: <MusicNotesIcon /> },
    { label: "Albums", icon: <VinylRecordIcon /> },
    { label: "Artists", icon: <UserIcon /> },
    { label: "Playlists", icon: <PlaylistIcon /> },
    { label: "Now Playing", icon: <WaveformIcon /> },
  ];
  return (
    <div className="relative border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px] bg-bg">
      <main className="absolute inset-0 bottom-14 overflow-y-auto scroll-style px-5 py-6">
        <span className="text-style-eyebrow text-fg-muted">Library</span>
        <h1 className="text-style-heading-2 text-fg mt-1">Albums</h1>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-sm bg-surface" aria-hidden />
          ))}
        </div>
      </main>
      <div className="absolute inset-x-0 bottom-0">
        <BottomNav>
          {items.map((it) => (
            <BottomNav.Item
              key={it.label}
              icon={it.icon}
              label={it.label}
              aria-current={active === it.label ? "page" : undefined}
              onClick={() => setActive(it.label)}
            />
          ))}
        </BottomNav>
      </div>
    </div>
  );
};
```

### Three-item nav (settings sub-shell)

The bar isn't fixed at five — any item count works. Sparse layouts read well too; each item still flexes to share the row.

```tsx preview
() => {
  const [active, setActive] = useState("Tracks");
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px]">
      <BottomNav>
        {["Tracks", "Albums", "Now Playing"].map((label) => (
          <BottomNav.Item
            key={label}
            icon={
              label === "Tracks" ? (
                <MusicNotesIcon />
              ) : label === "Albums" ? (
                <VinylRecordIcon />
              ) : (
                <WaveformIcon />
              )
            }
            label={label}
            aria-current={active === label ? "page" : undefined}
            onClick={() => setActive(label)}
          />
        ))}
      </BottomNav>
    </div>
  );
};
```

## Props

### BottomNav

```json props
[
  {
    "prop": "children",
    "type": "ReactNode",
    "default": "—",
    "description": "`BottomNav.Item`s, in tab order. Each item flexes to share the row."
  },
  {
    "prop": "aria-label",
    "type": "string",
    "default": "\"Primary\"",
    "description": "Accessible name for the nav landmark. Override only if the page mounts more than one nav and they need to be disambiguated for screen readers."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the `<nav>` element. Use for outer layout (positioning, shadow, custom border)."
  }
]
```

### BottomNav.Item

```json props
[
  {
    "prop": "icon",
    "type": "ReactElement",
    "default": "—",
    "description": "Glyph rendered above the label. Cloned with `size={22}` so the icon row stays visually consistent across calls."
  },
  {
    "prop": "label",
    "type": "string",
    "default": "—",
    "description": "Visible caption. Rendered as 10 px uppercase tracking-wider — tuned for the M500's narrow nav."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project the item onto a router Link or any custom element. With TanStack Router's `Link`, `data-status=\"active\"` is set automatically when the route matches and the item tints to `text-accent`."
  },
  {
    "prop": "aria-current",
    "type": "\"page\" | …",
    "default": "—",
    "description": "Manual active-state hook. Useful when not projecting onto a router Link (e.g. controlled tab state in a sub-shell). The styling picks up `aria-[current=page]` the same way it picks up `data-[status=active]`."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All Base UI Button root props pass through (onClick, disabled, render, nativeButton, etc.)."
  }
]
```

## Accessibility

- The wrapping `<nav>` carries `aria-label="Primary"` so screen readers announce it as a navigation landmark; override only for pages with multiple nav landmarks.
- Items inherit Base UI's button semantics — focusable, keyboard-activatable, with the standard `outline-accent` focus halo.
- Active tinting reads from both `data-status="active"` (set by TanStack Router's `Link`) and `aria-current="page"` (manual). Either way the active item is announced as the current page.
- The icon is `aria-hidden`; the visible label _is_ the accessible name. Decorative-only icons keep the announcement clean.
- Touch height is at least 56 px (`min-h-14`) — comfortably above the M500's 44 px target so glove / thumb taps land cleanly.
