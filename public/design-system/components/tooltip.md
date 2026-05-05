```scope
Tooltip
Button
BookmarkSimpleIcon
GearIcon
InfoIcon
MagnifyingGlassIcon
MoonIcon
SunIcon
XIcon
```

# Tooltip

Hover hints for icon-only or compact controls. Renders a soft dark chip (`bg-surface` / `text-fg`) lifted off the page with a small pointer arrow. Compound primitive: `Tooltip` is the root, with `Tooltip.Trigger`, `Tooltip.Portal`, `Tooltip.Positioner`, `Tooltip.Popup`, and `Tooltip.Arrow`. A `Tooltip.Provider` mounted near the app root manages the shared hover delay so adjacent tooltips don't each wait their full delay.

```tsx preview
<Tooltip>
  <Tooltip.Trigger
    render={
      <Button variant="ghost" size="sm" aria-label="Bookmark page">
        <BookmarkSimpleIcon weight="light" />
      </Button>
    }
  />
  <Tooltip.Portal>
    <Tooltip.Positioner sideOffset={6}>
      <Tooltip.Popup>
        Bookmark page
        <Tooltip.Arrow />
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip>
```

## Anatomy

`Tooltip.Provider` is mounted once near the app root and sets the global open / close delay so multiple tooltips share a hover budget. Each tooltip wires a trigger to a portalled popup; the `Tooltip.Arrow` uses Base UI's CSS variables to track the trigger edge automatically.

```tsx
import { Tooltip } from "@/components/primitives/tooltip";

<Tooltip>
  <Tooltip.Trigger render={<Button aria-label="…">…</Button>} />
  <Tooltip.Portal>
    <Tooltip.Positioner sideOffset={6}>
      <Tooltip.Popup>
        Hint text
        <Tooltip.Arrow />
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip>;
```

## Examples

### Icon hints

The classic case. Wrap each icon-only control in a tooltip so the `aria-label` has a visible echo on hover.

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <Tooltip>
    <Tooltip.Trigger
      render={
        <Button variant="ghost" size="sm" aria-label="Bookmark page">
          <BookmarkSimpleIcon weight="light" />
        </Button>
      }
    />
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={6}>
        <Tooltip.Popup>
          Bookmark page
          <Tooltip.Arrow />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip>

  <Tooltip>
    <Tooltip.Trigger
      render={
        <Button variant="ghost" size="sm" aria-label="Search">
          <MagnifyingGlassIcon weight="light" />
        </Button>
      }
    />
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={6}>
        <Tooltip.Popup>
          Search
          <Tooltip.Arrow />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip>

  <Tooltip>
    <Tooltip.Trigger
      render={
        <Button variant="ghost" size="sm" aria-label="Settings">
          <GearIcon weight="light" />
        </Button>
      }
    />
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={6}>
        <Tooltip.Popup>
          Settings
          <Tooltip.Arrow />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip>
</div>
```

### Placements

`side` controls the preferred edge. Base UI flips it if there isn't room.

```tsx preview
<div className="flex flex-wrap items-center gap-12 px-12 py-12">
  {[
    { side: "top", Icon: SunIcon, label: "Top" },
    { side: "right", Icon: MoonIcon, label: "Right" },
    { side: "bottom", Icon: XIcon, label: "Bottom" },
    { side: "left", Icon: InfoIcon, label: "Left" },
  ].map(({ side, Icon, label }) => (
    <Tooltip key={side}>
      <Tooltip.Trigger
        render={
          <Button variant="secondary" size="sm" aria-label={`Tooltip on ${side}`}>
            <Icon weight="light" />
          </Button>
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={6}>
          <Tooltip.Popup>
            {label}
            <Tooltip.Arrow />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip>
  ))}
</div>
```

### Long description

The popup has a `max-w-xs` cap so multi-line tips stay readable. Keep them short — anything longer than two lines wants a different surface.

```tsx preview
<Tooltip>
  <Tooltip.Trigger
    render={
      <Button variant="ghost" size="sm" aria-label="What is gapless playback?">
        <InfoIcon weight="light" />
      </Button>
    }
  />
  <Tooltip.Portal>
    <Tooltip.Positioner sideOffset={6}>
      <Tooltip.Popup>
        Gapless playback removes the silence between consecutive tracks — essential for live
        albums and continuous mixes where the audio bleeds across track boundaries.
        <Tooltip.Arrow />
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip>
```

## Props

### Tooltip

Root provider for one tooltip instance.

```json props
[
  {
    "prop": "delay",
    "type": "number",
    "default": "(provider)",
    "description": "Hover delay before opening, in ms. Inherits from the nearest `Tooltip.Provider` (300 ms by default)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tooltip.Root props",
    "default": "—",
    "description": "Supports `open` / `defaultOpen`, `onOpenChange`, `closeDelay`, etc."
  }
]
```

### Tooltip.Provider

Mounted once near the app root. Holds the shared hover budget so opening one tooltip skips the delay on the next adjacent tooltip.

```json props
[
  {
    "prop": "delay",
    "type": "number",
    "default": "300",
    "description": "Default open delay for descendant tooltips. Wrapped to `300` in the design-system primitive."
  }
]
```

### Tooltip.Trigger

The element that opens the tooltip. Use `render` to attach tooltip semantics to any focusable control.

```json props
[
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Element to render as the trigger. Typically a `Button` (often `variant=\"ghost\" size=\"sm\"` for icon-only controls)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tooltip.Trigger props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

### Tooltip.Portal

Renders the popup at the document root so it escapes any clipping ancestor.

```json props
[
  {
    "prop": "container",
    "type": "HTMLElement | null",
    "default": "document.body",
    "description": "Override the portal target. Rarely needed."
  }
]
```

### Tooltip.Positioner

Anchors the popup. The wrapper defaults `sideOffset` to `6`.

```json props
[
  {
    "prop": "side",
    "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
    "default": "\"top\"",
    "description": "Preferred edge. Base UI flips when there isn't room."
  },
  {
    "prop": "sideOffset",
    "type": "number",
    "default": "6",
    "description": "Pixel gap between trigger and popup."
  },
  {
    "prop": "align",
    "type": "\"start\" | \"center\" | \"end\"",
    "default": "\"center\"",
    "description": "Alignment along the cross axis."
  },
  {
    "prop": "...rest",
    "type": "Base UI Tooltip.Positioner props",
    "default": "—",
    "description": "Includes `alignOffset`, `collisionPadding`, etc."
  }
]
```

### Tooltip.Popup

The chip surface. Capped at `max-w-xs`; uses `text-style-caption`.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Tooltip.Popup props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-starting-style",
    "description": "Set on entry; drives the open animation from `opacity-0 scale-95`."
  },
  { "attribute": "data-ending-style", "description": "Set on exit." },
  {
    "attribute": "data-instant",
    "description": "Set when the tooltip is opening immediately (no delay) — used to skip the transition."
  }
]
```

### Tooltip.Arrow

The pointer triangle. Self-rotates per `data-side` so it always points at the trigger.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Tooltip.Arrow props",
    "default": "—",
    "description": "Standard div props pass through. The wrapper renders the SVG content."
  }
]
```

## Accessibility

- Tooltips are advisory — never put critical information in them. Always pair with an `aria-label` (or visible text) on the trigger.
- Base UI wires `aria-describedby` from the trigger to the popup automatically.
- The popup is hover- and focus-driven; touch users see it on long-press.

### Keyboard

```json keyboard
[
  {
    "keys": ["Tab"],
    "description": "Focusing the trigger opens the tooltip after the configured delay."
  },
  { "keys": ["Escape"], "description": "Closes any open tooltip." }
]
```
