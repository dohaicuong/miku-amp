```scope
Tabs
useState
```

# Tabs

Inline filter tabs. Eyebrow type, animated cyan indicator. Compound primitive: `Tabs` is the root, with `Tabs.List`, `Tabs.Tab`, `Tabs.Indicator`, and `Tabs.Panel` slotting in. Suits library filters (All / Tracks / Albums / Artists), now-playing pivots (Up Next / Lyrics / Info), or settings sections.

```tsx preview
<Tabs defaultValue="all">
  <Tabs.List>
    <Tabs.Tab value="all">All</Tabs.Tab>
    <Tabs.Tab value="tracks">Tracks</Tabs.Tab>
    <Tabs.Tab value="albums">Albums</Tabs.Tab>
    <Tabs.Tab value="artists">Artists</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="all">
    <p className="text-style-body text-fg">Showing everything in your library.</p>
  </Tabs.Panel>
  <Tabs.Panel value="tracks">
    <p className="text-style-body text-fg">Just tracks, sorted by title.</p>
  </Tabs.Panel>
  <Tabs.Panel value="albums">
    <p className="text-style-body text-fg">Albums grouped by artist.</p>
  </Tabs.Panel>
  <Tabs.Panel value="artists">
    <p className="text-style-body text-fg">Artists, alphabetised.</p>
  </Tabs.Panel>
</Tabs>
```

## Anatomy

The root holds the active value (controlled or uncontrolled). The list is a horizontal row of tabs with the animated indicator pinned to the bottom edge — `Tabs.Indicator` reads the active tab's geometry from CSS custom properties (`--active-tab-left` / `--active-tab-width`) Base UI sets on `Tabs.List`.

```tsx
import { Tabs } from "@/components/primitives/tabs";

<Tabs defaultValue="all">
  <Tabs.List>
    <Tabs.Tab value="all">All</Tabs.Tab>
    <Tabs.Tab value="tracks">Tracks</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="all">…</Tabs.Panel>
  <Tabs.Panel value="tracks">…</Tabs.Panel>
</Tabs>;
```

## Examples

### Default — Uncontrolled

`defaultValue` picks the initial tab; the component owns the active-tab state from there. Best for filter rows where the parent doesn't need to read the active value.

```tsx preview
<Tabs defaultValue="albums">
  <Tabs.List>
    <Tabs.Tab value="all">All</Tabs.Tab>
    <Tabs.Tab value="tracks">Tracks</Tabs.Tab>
    <Tabs.Tab value="albums">Albums</Tabs.Tab>
    <Tabs.Tab value="artists">Artists</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="all">
    <p className="text-style-body text-fg">
      Everything in your library — tracks, albums, and artists in one mixed view.
    </p>
  </Tabs.Panel>
  <Tabs.Panel value="tracks">
    <p className="text-style-body text-fg">
      A flat list of every song, sorted by title. Tap any row to drop it into the dock.
    </p>
  </Tabs.Panel>
  <Tabs.Panel value="albums">
    <p className="text-style-body text-fg">
      Albums grouped by artist, with cover art lifted from the embedded tags.
    </p>
  </Tabs.Panel>
  <Tabs.Panel value="artists">
    <p className="text-style-body text-fg">
      Artists alphabetised. Drill in to see every album and loose track they appear on.
    </p>
  </Tabs.Panel>
</Tabs>
```

### Controlled

Pair `value` with `onValueChange` when the parent needs to react to the active tab — e.g. to drive a query parameter, dispatch a fetch, or sync with another control.

```tsx preview
() => {
  const [v, setV] = useState("tracks");
  return (
    <div className="flex flex-col gap-3">
      <p className="text-style-caption text-fg-muted">
        Active filter: <span className="text-accent">{v}</span>
      </p>
      <Tabs value={v} onValueChange={(next) => setV(next as string)}>
        <Tabs.List>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="tracks">Tracks</Tabs.Tab>
          <Tabs.Tab value="albums">Albums</Tabs.Tab>
          <Tabs.Tab value="artists">Artists</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="all">
          <p className="text-style-body text-fg">All items.</p>
        </Tabs.Panel>
        <Tabs.Panel value="tracks">
          <p className="text-style-body text-fg">Tracks only.</p>
        </Tabs.Panel>
        <Tabs.Panel value="albums">
          <p className="text-style-body text-fg">Albums only.</p>
        </Tabs.Panel>
        <Tabs.Panel value="artists">
          <p className="text-style-body text-fg">Artists only.</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
```

### Disabled tab

`disabled` on a `Tabs.Tab` skips it during keyboard navigation and dims the styling. The panel can still mount if you reach it via `value`.

```tsx preview
<Tabs defaultValue="all">
  <Tabs.List>
    <Tabs.Tab value="all">All</Tabs.Tab>
    <Tabs.Tab value="tracks">Tracks</Tabs.Tab>
    <Tabs.Tab value="podcasts" disabled>
      Podcasts (soon)
    </Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="all">
    <p className="text-style-body text-fg">All items.</p>
  </Tabs.Panel>
  <Tabs.Panel value="tracks">
    <p className="text-style-body text-fg">Tracks only.</p>
  </Tabs.Panel>
</Tabs>
```

## Props

### Tabs

The root. Manages active-tab state and exposes it to descendants via context.

```json props
[
  {
    "prop": "defaultValue",
    "type": "string | number | null",
    "default": "—",
    "description": "Initial active tab in uncontrolled mode."
  },
  {
    "prop": "value",
    "type": "string | number | null",
    "default": "—",
    "description": "Controlled active tab. Pair with `onValueChange`."
  },
  {
    "prop": "onValueChange",
    "type": "(value: string | number | null) => void",
    "default": "—",
    "description": "Fires when the active tab changes."
  },
  {
    "prop": "orientation",
    "type": "\"horizontal\" | \"vertical\"",
    "default": "\"horizontal\"",
    "description": "Affects ARIA wiring and arrow-key navigation. The visual layout still depends on your `Tabs.List` styles."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tabs.Root props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Tabs.List

The horizontal row that hosts tabs and the indicator. Sets the bottom border the indicator rides on.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Tabs.List props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Tabs.Tab

A single tab trigger. Identified by `value`; the matching panel is the one with the same `value`.

```json props
[
  {
    "prop": "value",
    "type": "string | number",
    "default": "—",
    "description": "Identifier matched against `Tabs.Panel#value` to wire panel visibility."
  },
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Dims the tab and removes it from keyboard cycling."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tabs.Tab props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-selected",
    "description": "Present on the active tab. Drives `text-accent`."
  },
  { "attribute": "data-disabled", "description": "Mirrored when `disabled` is set." }
]
```

### Tabs.Indicator

The animated underline. Reads its position and width from CSS custom properties Base UI sets on `Tabs.List` (`--active-tab-left` / `--active-tab-width`), so it transitions automatically when the active tab changes.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Tabs.Indicator props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Tabs.Panel

The content for a single tab. Mounts when the matching tab is active.

```json props
[
  {
    "prop": "value",
    "type": "string | number",
    "default": "—",
    "description": "Matched against `Tabs.Tab#value`."
  },
  {
    "prop": "keepMounted",
    "type": "boolean",
    "default": "false",
    "description": "Keep the panel in the DOM (with `hidden`) even when inactive — useful for forms that should preserve state across tabs."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tabs.Panel props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

## Accessibility

- The list is wired with `role="tablist"`, tabs with `role="tab"`, and panels with `role="tabpanel"` — all by Base UI.
- Inactive panels are removed from the DOM by default; the active one is reachable via Tab through the panel root, then arrow-keys back into the tablist.
- The indicator is purely decorative; the active state is also conveyed via `aria-selected` on the tab.

### Keyboard

```json keyboard
[
  {
    "keys": ["ArrowLeft"],
    "description": "Move to the previous enabled tab (horizontal orientation)."
  },
  { "keys": ["ArrowRight"], "description": "Move to the next enabled tab." },
  {
    "keys": ["ArrowUp", "ArrowDown"],
    "description": "Same as left/right when `orientation=\"vertical\"`."
  },
  { "keys": ["Home"], "description": "Move to the first enabled tab." },
  { "keys": ["End"], "description": "Move to the last enabled tab." },
  {
    "keys": ["Tab"],
    "description": "Move focus from the tablist into the active panel, or out to the next focusable element."
  }
]
```
