```scope
Switch
useState
```

# Switch

Pill toggle for boolean settings. Wraps Base UI's headless Switch and applies the design system's accent fill on the checked state. Compound: `Switch` (the convenience wrapper) plus `Switch.Root` and `Switch.Thumb` for hand-composed cases.

```tsx preview
() => {
  const [on, setOn] = useState(false);
  return (
    <label className="flex items-center gap-3">
      <Switch checked={on} onCheckedChange={setOn} aria-label="Background music" />
      <span className="text-style-body text-fg">Background music</span>
    </label>
  );
};
```

## Anatomy

The default `Switch` renders Base UI's `Switch.Root` + `Switch.Thumb` as a single component. Pair with a `<label>` (or `aria-label`) — there's no visible text built in. For custom thumbs, use `Switch.Root` and `Switch.Thumb` directly.

```tsx
import { Switch } from "@/components/primitives/switch";

<label className="flex items-center gap-3">
  <Switch defaultChecked aria-label="Gapless playback" />
  <span className="text-style-body text-fg">Gapless playback</span>
</label>;
```

## Examples

### On / Off

`defaultChecked` picks the initial state for uncontrolled use. The thumb slides on a 21 px translation; the track flips from `bg-surface` (off) to `bg-accent` (on).

```tsx preview
<div className="flex flex-col gap-3">
  <label className="flex items-center gap-3">
    <Switch defaultChecked={false} aria-label="Background music off" />
    <span className="text-style-body text-fg">Background music</span>
  </label>
  <label className="flex items-center gap-3">
    <Switch defaultChecked aria-label="Gapless playback on" />
    <span className="text-style-body text-fg">Gapless playback</span>
  </label>
</div>
```

### Controlled

Pair `checked` with `onCheckedChange` to own the state in the parent — useful when the value needs to flow into a settings store or trigger a side effect on toggle.

```tsx preview
() => {
  const [explicit, setExplicit] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-3">
        <Switch
          checked={explicit}
          onCheckedChange={setExplicit}
          aria-label="Show explicit content"
        />
        <span className="text-style-body text-fg">Show explicit content</span>
      </label>
      <span className="text-style-caption text-fg-muted">
        Currently {explicit ? "showing" : "hiding"} explicit tracks.
      </span>
    </div>
  );
};
```

### Disabled

`disabled` dims the switch and blocks pointer + keyboard activation. Both states (on / off) honour disabled styling.

```tsx preview
<div className="flex flex-col gap-3">
  <label className="flex items-center gap-3">
    <Switch disabled aria-label="Locked off" />
    <span className="text-style-body text-fg">Locked off</span>
  </label>
  <label className="flex items-center gap-3">
    <Switch disabled defaultChecked aria-label="Locked on" />
    <span className="text-style-body text-fg">Locked on</span>
  </label>
</div>
```

## Props

### Switch

Wraps Base UI's `Switch.Root` and renders an internal `Switch.Thumb`. Forwards all root props.

```json props
[
  {
    "prop": "checked",
    "type": "boolean",
    "default": "—",
    "description": "Controlled checked state. Pair with `onCheckedChange`."
  },
  {
    "prop": "defaultChecked",
    "type": "boolean",
    "default": "false",
    "description": "Initial state in uncontrolled mode."
  },
  {
    "prop": "onCheckedChange",
    "type": "(checked: boolean) => void",
    "default": "—",
    "description": "Fires when the user toggles the switch."
  },
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Drops opacity to 50 %, blocks pointer + keyboard activation, and switches the cursor to not-allowed."
  },
  {
    "prop": "aria-label",
    "type": "string",
    "default": "—",
    "description": "Accessible name when the switch isn't wrapped in a `<label>`. Always provide one or the other."
  },
  {
    "prop": "...rest",
    "type": "Base UI Switch.Root props",
    "default": "—",
    "description": "Includes `name`, `value`, `required`, `inputRef`, etc. for form integration."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-checked",
    "description": "Present when the switch is on. Drives the accent track and the thumb's translate offset."
  },
  { "attribute": "data-disabled", "description": "Mirrored when `disabled` is set." }
]
```

### Switch.Root

The track container. Use directly when composing a custom thumb or layering decorations inside.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Switch.Root props",
    "default": "—",
    "description": "All Base UI root props pass through."
  }
]
```

### Switch.Thumb

The sliding circle. Use inside `Switch.Root` when the convenience wrapper isn't enough.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Switch.Thumb props",
    "default": "—",
    "description": "All Base UI thumb props pass through."
  }
]
```

## Accessibility

- Renders a real `<button role="switch">` (Base UI). Browsers expose checked / disabled state to assistive tech automatically.
- Wrap in a `<label>` or pass `aria-label` — there's no built-in visible text.
- The focus ring is `outline-accent` pinned in the base layer so it doesn't animate from `currentColor` on focus, matching the pattern set by `Button`.

### Keyboard

```json keyboard
[
  { "keys": ["Space", "Enter"], "description": "Toggles the switch." },
  { "keys": ["Tab"], "description": "Moves focus into and out of the switch in document order." }
]
```
