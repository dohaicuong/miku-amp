```scope
Slider
Button
```

# Slider

Range control. Powers the audio scrubber, volume slider, and any setting that wants a draggable value. Wraps Base UI's headless `Slider` compound (`Root` → `Control` → `Track` → `Indicator` → `Thumb`); the default `<Slider>` renders the whole tree, and the parts are also exposed via `Slider.Root`, `Slider.Track`, etc. for custom anatomy (e.g. a buffered-progress overlay).

```tsx preview
<div className="w-full max-w-md">
  <Slider defaultValue={50} min={0} max={100} step={1} aria-label="Volume" />
</div>
```

## Anatomy

The default `<Slider>` is a one-shot wrapper that mounts the full Base UI tree. Pass standard slider props (`min`, `max`, `step`, `defaultValue` / `value`) and an `aria-label`; the wrapper forwards the label onto the thumb so screen readers announce the right context.

```tsx
import { Slider } from "@/components/primitives/slider";

<Slider defaultValue={50} min={0} max={100} step={1} aria-label="Volume" />;
```

For custom anatomy — extra indicators, multi-thumb ranges, a custom thumb glyph — drop down to the compound parts:

```tsx
<Slider.Root defaultValue={30} aria-labelledby="vol-label">
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
    </Slider.Track>
    <Slider.Thumb />
  </Slider.Control>
</Slider.Root>
```

## Examples

### Default

A 0–100 slider with a single thumb starting at 50.

```tsx preview
<div className="w-full max-w-md">
  <Slider defaultValue={50} min={0} max={100} step={1} aria-label="Volume" />
</div>
```

### Audio scrubber

The shape the mini-player uses: time readouts on either side, slider in the middle. `text-style-time` keeps the digits tabular so the layout doesn't jiggle as the track plays. Wire the `value` to your player's elapsed time and the `onValueChange` to a seek call.

```tsx preview
() => {
  const [position, setPosition] = useState(72);
  const duration = 214; // 3:34
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className="w-full max-w-md flex items-center gap-3">
      <span className="text-style-time text-fg-muted shrink-0">{fmt(position)}</span>
      <Slider
        value={position}
        onValueChange={setPosition}
        min={0}
        max={duration}
        step={1}
        aria-label="Seek"
      />
      <span className="text-style-time text-fg-muted shrink-0">{fmt(duration)}</span>
    </div>
  );
};
```

### Volume slider

Paired with a label and a reset button. The label uses `text-style-eyebrow` for the all-caps section-marker feel.

```tsx preview
() => {
  const [volume, setVolume] = useState(65);
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-style-eyebrow text-fg-muted">Volume</span>
        <span className="text-style-caption text-fg-muted tabular-nums">{volume}</span>
      </div>
      <div className="flex items-center gap-3">
        <Slider value={volume} onValueChange={setVolume} aria-label="Volume" />
        <Button variant="ghost" size="sm" onClick={() => setVolume(50)}>
          Reset
        </Button>
      </div>
    </div>
  );
};
```

### With min / max range

`min` and `max` accept any numeric range; `step` controls the granularity. Pair with a static label so the unit is clear.

```tsx preview
<div className="w-full max-w-md flex flex-col gap-3">
  <span className="text-style-eyebrow text-fg-muted">Font size (12–32 px)</span>
  <Slider defaultValue={18} min={12} max={32} step={1} aria-label="Font size" />
</div>
```

### Vertical orientation

Pass `orientation="vertical"` and the slider flips to an upright fader: track runs top-to-bottom and the indicator fills from the bottom upward (higher = more). The parent must set the height — vertical mode inherits it via `h-full`.

```tsx preview
() => {
  const [v, setV] = useState(60);
  return (
    <div className="h-48 flex items-center">
      <Slider orientation="vertical" value={v} onValueChange={setV} aria-label="Vertical slider" />
    </div>
  );
};
```

### EQ band — vertical bank

The pattern an EQ panel uses: a row of vertical sliders, each with a label below and a live readout above. Range is bipolar (−12 → +12 dB) so a fader at the midpoint sits halfway up; double up with a centre-fill custom anatomy if you want the indicator to grow outward from 0 dB.

```tsx preview
() => {
  const [bands, setBands] = useState({
    "60Hz": 0,
    "250Hz": 2,
    "1kHz": 0,
    "4kHz": -3,
    "12kHz": 4,
  });
  const fmt = (v) => `${v > 0 ? "+" : ""}${v}`;
  return (
    <div className="flex items-end gap-6">
      {Object.entries(bands).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <span className="text-style-caption text-fg-muted tabular-nums">{fmt(value)}</span>
          <div className="h-40 flex items-center">
            <Slider
              orientation="vertical"
              value={value}
              onValueChange={(next) => setBands((b) => ({ ...b, [label]: next }))}
              min={-12}
              max={12}
              step={1}
              aria-label={`${label} gain`}
            />
          </div>
          <span className="text-style-eyebrow text-fg-muted">{label}</span>
        </div>
      ))}
    </div>
  );
};
```

### Disabled

```tsx preview
<div className="w-full max-w-md">
  <Slider defaultValue={40} disabled aria-label="Disabled slider" />
</div>
```

### Custom anatomy — buffered-progress overlay

The compound API lets you stack extra elements inside `Slider.Track`. Here a static "buffered" bar sits behind the live indicator — the pattern the audio scrubber uses to show network buffer ahead of the playhead.

```tsx preview
() => {
  const [position, setPosition] = useState(40);
  const buffered = 72; // % buffered ahead of playhead
  return (
    <div className="w-full max-w-md">
      <Slider.Root value={position} onValueChange={setPosition} min={0} max={100} step={1}>
        <Slider.Control>
          <Slider.Track>
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-fg-subtle/40"
              style={{ width: `${buffered}%` }}
              aria-hidden
            />
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb getAriaLabel={() => "Seek"} />
        </Slider.Control>
      </Slider.Root>
    </div>
  );
};
```

## Props

### Slider

The default wrapper. Renders the full Base UI compound (`Root` + `Control` + `Track` + `Indicator` + `Thumb`) as a single component. Forwards standard slider props through to the root.

```json props
[
  {
    "prop": "value",
    "type": "number",
    "default": "—",
    "description": "Controlled value. Pair with `onValueChange`."
  },
  {
    "prop": "defaultValue",
    "type": "number",
    "default": "—",
    "description": "Initial value in uncontrolled mode."
  },
  {
    "prop": "onValueChange",
    "type": "(value: number) => void",
    "default": "—",
    "description": "Fires whenever the thumb moves (drag, keyboard, click on track)."
  },
  {
    "prop": "min",
    "type": "number",
    "default": "0",
    "description": "Lower bound of the range."
  },
  {
    "prop": "max",
    "type": "number",
    "default": "100",
    "description": "Upper bound of the range."
  },
  {
    "prop": "step",
    "type": "number",
    "default": "1",
    "description": "Granularity. Keyboard arrows move by this step."
  },
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Drops opacity, blocks pointer + keyboard interaction, and switches the cursor to not-allowed."
  },
  {
    "prop": "orientation",
    "type": "\"horizontal\" | \"vertical\"",
    "default": "\"horizontal\"",
    "description": "Slider axis. Vertical mode flips the track to a 24 px-wide column that fills its parent's height; the indicator fills bottom-up. Parent must constrain the height (typical for EQ band rows)."
  },
  {
    "prop": "aria-label",
    "type": "string",
    "default": "—",
    "description": "Accessible name for the thumb. The wrapper forwards it through Base UI's `getAriaLabel` so the thumb announces correctly."
  },
  {
    "prop": "...rest",
    "type": "Base UI Slider.Root props",
    "default": "—",
    "description": "All other Base UI slider root props pass through (orientation, name, format, etc.)."
  }
]
```

### Slider.Root, .Control, .Track, .Indicator, .Thumb

Compound parts re-exported from Base UI with the design-system styles already applied. Use these when the default `<Slider>` wrapper doesn't fit — extra indicators, custom thumb content, multi-thumb ranges. All standard Base UI props pass through; supply `className` to extend.

```json data-attributes
[
  {
    "attribute": "data-dragging",
    "description": "Set on the thumb while the user is actively dragging — drives the `cursor-grabbing` and the slight scale up."
  },
  {
    "attribute": "data-disabled",
    "description": "Mirrored on Root and Thumb when `disabled` is set."
  }
]
```

## Accessibility

- The thumb is a focusable element with `role="slider"` (managed by Base UI). `aria-label` on the wrapper is forwarded to it.
- Keyboard users get arrow-key control out of the box. The focus halo is a stacked box-shadow keyed to `var(--accent)` and `var(--bg)` — no extra theming needed.
- For paired controls (e.g. volume + reset, scrubber + time readouts) keep them in the same labelled group so the relationship is announced.
- `touch-none select-none` on the root keeps the slider drag from competing with page scroll on the M500's touchscreen.

### Keyboard

```json keyboard
[
  { "keys": ["ArrowRight", "ArrowUp"], "description": "Increment by `step`." },
  { "keys": ["ArrowLeft", "ArrowDown"], "description": "Decrement by `step`." },
  { "keys": ["Home"], "description": "Jump to `min`." },
  { "keys": ["End"], "description": "Jump to `max`." },
  { "keys": ["PageUp"], "description": "Increment by a larger step (typically 10× `step`)." },
  { "keys": ["PageDown"], "description": "Decrement by a larger step." }
]
```
