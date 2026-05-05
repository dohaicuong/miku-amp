```scope
Button
```

# Button

The base interactive control. Wraps Base UI's headless `Button` and applies the design system's variants, sizes, and focus styling. Touch targets sized for the M500's portrait screen — `md` lands at 44 px, the iOS/Android minimum.

```tsx preview
<Button>Play</Button>
```

## Anatomy

A single element. Render is delegated via Base UI's `render` prop, so the same component can mount as a `<button>` (default), a `<Link>`, or any focusable element. Space-key activation is patched in for non-native renders so anchor-shaped buttons still feel like buttons.

```tsx
import { Button } from "@/components/primitives/button";

<Button variant="primary" size="md">
  Play
</Button>;
```

## Examples

### Variants

`primary` is the cyan accent fill — the page's main call to action. `secondary` is the outlined cyan twin for the secondary action that pairs with it (Cancel next to Save). `outline` is the neutral bordered button for non-accent actions (settings, secondary navigation). `ghost` is bare text for toolbar density.

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
</div>
```

### Sizes

`sm` for toolbar density, `md` for the standard touch target on the M500, `lg` for hero CTAs (the page's whole reason to exist — Play All, Start Scanning).

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>
```

### Disabled

`disabled` dims the button and blocks interaction. Mirrors Base UI's `data-[disabled]` attribute, so styles can target either the prop or the state.

```tsx preview
<div className="flex flex-wrap items-center gap-3">
  <Button disabled>Primary disabled</Button>
  <Button variant="secondary" disabled>
    Secondary disabled
  </Button>
  <Button variant="outline" disabled>
    Outline disabled
  </Button>
  <Button variant="ghost" disabled>
    Ghost disabled
  </Button>
</div>
```

## Props

### Button

```json props
[
  {
    "prop": "variant",
    "type": "\"primary\" | \"secondary\" | \"outline\" | \"ghost\"",
    "default": "\"primary\"",
    "description": "Visual emphasis. `primary` fills with accent; `secondary` outlines accent; `outline` neutral border; `ghost` is bare text."
  },
  {
    "prop": "size",
    "type": "\"sm\" | \"md\" | \"lg\"",
    "default": "\"md\"",
    "description": "Height + horizontal padding. `md` is the 44 px touch-target default for the DAP."
  },
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Project button semantics onto a different element (e.g. a router `<Link/>`). When set, Space-key activation is patched in so anchor-shaped buttons still feel like buttons."
  },
  {
    "prop": "nativeButton",
    "type": "boolean",
    "default": "true when no render is provided",
    "description": "Whether the underlying element is a native `<button>`. Auto-derived from `render`; rarely needed manually."
  },
  {
    "prop": "...rest",
    "type": "Base UI Button props",
    "default": "—",
    "description": "All standard button props plus Base UI extensions (`disabled`, `onClick`, etc.) pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-disabled",
    "description": "Mirrored from the `disabled` prop. Drives the dimmed style and cursor."
  }
]
```

## Accessibility

- Renders a real `<button type="button">` by default — full keyboard semantics for free.
- `focus-visible:outline-2` shows the ring only for keyboard / programmatic focus, not on mouse click.
- Outline colour is pinned to `var(--accent)` even before focus, so the focus ring transition flips style/width only — no flash from `currentColor` to accent that would otherwise flicker for one frame on dark surfaces.
- For non-native renders (anchor / link), Space activation is wired by hand to match `<button>` semantics.
