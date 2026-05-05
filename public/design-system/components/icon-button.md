```scope
IconButton
BookmarkSimpleIcon
CaretRightIcon
GearIcon
MagnifyingGlassIcon
PauseIcon
PlayIcon
XIcon
```

# Icon Button

Square, icon-only sibling of `Button`. Same variants and focus treatment as Button, but it requires `aria-label` (no visible text to fall back on) and clones its child icon to inject the size that matches the button's footprint. Default variant is `ghost` since most icon-buttons in the player UI are toolbar density.

```tsx preview
<IconButton variant="primary" aria-label="Play">
  <PlayIcon weight="light" />
</IconButton>
```

## Anatomy

Pass a single Phosphor icon as the child. The component clones it to set its `size` prop based on the button's `size`, so callers don't manage that themselves. The default variant is `ghost` (toolbar use case); pass `variant="primary"` for the now-playing play button or any other accent affordance.

```tsx
import { IconButton } from "@/components/primitives/icon-button";
import { PlayIcon } from "@phosphor-icons/react";

<IconButton variant="primary" aria-label="Play">
  <PlayIcon weight="light" />
</IconButton>;
```

## Examples

### Variants

`primary` for the page's main affordance (play, save). `secondary` for a paired secondary control. `outline` for a non-accent neutral action that still reads as a defined surface. `ghost` for toolbar density — most IconButtons in the player chrome (mini-player controls, list-row trailing actions, header controls) are ghost.

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <IconButton variant="primary" aria-label="Play">
    <PlayIcon weight="light" />
  </IconButton>
  <IconButton variant="secondary" aria-label="Bookmark">
    <BookmarkSimpleIcon weight="light" />
  </IconButton>
  <IconButton variant="outline" aria-label="Search">
    <MagnifyingGlassIcon weight="light" />
  </IconButton>
  <IconButton variant="ghost" aria-label="Settings">
    <GearIcon weight="light" />
  </IconButton>
</div>
```

### Sizes

The icon size scales with the button (16 / 20 / 24 px), so the same `<PlayIcon />` child renders at the correct size for every footprint. `md` matches the M500's 44 px touch target.

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <IconButton size="sm" aria-label="Play (small)">
    <PlayIcon weight="light" />
  </IconButton>
  <IconButton size="md" aria-label="Play (medium)">
    <PlayIcon weight="light" />
  </IconButton>
  <IconButton size="lg" aria-label="Play (large)">
    <PlayIcon weight="light" />
  </IconButton>
</div>
```

### Disabled

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <IconButton variant="primary" disabled aria-label="Pause (disabled)">
    <PauseIcon weight="light" />
  </IconButton>
  <IconButton variant="secondary" disabled aria-label="Bookmark (disabled)">
    <BookmarkSimpleIcon weight="light" />
  </IconButton>
  <IconButton variant="outline" disabled aria-label="Search (disabled)">
    <MagnifyingGlassIcon weight="light" />
  </IconButton>
  <IconButton variant="ghost" disabled aria-label="Close (disabled)">
    <XIcon weight="light" />
  </IconButton>
</div>
```

### As link

Like `Button`, `IconButton` accepts a `render` prop to project icon-button semantics onto a router `<Link>` or any focusable element. Space-key activation is patched to match `<button>` semantics on non-native renders (inherited from the underlying Base UI `Button`).

```tsx preview
<IconButton variant="ghost" aria-label="Continue reading" render={<a href="#continue" />}>
  <CaretRightIcon weight="light" />
</IconButton>
```

## Props

### IconButton

```json props
[
  {
    "prop": "aria-label",
    "type": "string",
    "default": "—",
    "description": "Required. There's no visible text — screen readers rely on this entirely."
  },
  {
    "prop": "variant",
    "type": "\"primary\" | \"secondary\" | \"outline\" | \"ghost\"",
    "default": "\"ghost\"",
    "description": "Visual emphasis. `ghost` is the default since most icon-buttons in the player UI are toolbar density."
  },
  {
    "prop": "size",
    "type": "\"sm\" | \"md\" | \"lg\"",
    "default": "\"md\"",
    "description": "Square footprint (36 / 44 / 48 px). Drives the cloned-icon size (16 / 20 / 24 px). `md` is the M500 touch-target default."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project icon-button semantics onto a different element (e.g. a router `<Link/>`)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All standard button props (`disabled`, `onClick`, etc.) pass through."
  }
]
```

## Accessibility

- `aria-label` is required at the type level — TypeScript will refuse to compile an IconButton without it.
- Renders a real `<button type="button">` by default, so keyboard activation, focus, and `disabled` semantics come from the platform.
- Same focus-visible treatment as `Button` — outline-color pinned to accent so the ring doesn't flash the wrong colour during transition.
