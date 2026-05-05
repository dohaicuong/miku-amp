```scope
Knob
```

# Knob

Rotary control. The DAW-style sibling of `Slider` — same value/min/max/step API, but the affordance is a circular dial. Use for volume, gain, balance/pan, tempo, filter cutoff, and other "tactile" parameters where the rotary metaphor reads better than a horizontal track.

The knob sweeps a 270° arc with the gap centred at the bottom, so the off-state position (`min`) sits at 7 o'clock and the max sits at 5 o'clock. Drag vertically to change the value (up = increase), wheel for fine adjustment, double-tap to reset, hold `Shift` for slow-motion.

```tsx preview
() => {
  const [volume, setVolume] = useState(65);
  return <Knob value={volume} onValueChange={setVolume} aria-label="Volume" showValue />;
};
```

## Examples

### Default

A 0–100 knob. Drag vertically, scroll the wheel, or tab to it and use arrow keys.

```tsx preview
() => {
  const [v, setV] = useState(40);
  return <Knob value={v} onValueChange={setV} aria-label="Default knob" showValue />;
};
```

### Sizes

`sm` (40 px), `md` (56 px, default), `lg` (72 px). The centre value readout scales with the knob; on `sm` it's intentionally tight — pair `showValue` with `md`+ for comfortable reading.

```tsx preview
() => {
  const [a, setA] = useState(20);
  const [b, setB] = useState(50);
  const [c, setC] = useState(80);
  return (
    <div className="flex items-center gap-6">
      <Knob value={a} onValueChange={setA} size="sm" aria-label="Small" />
      <Knob value={b} onValueChange={setB} size="md" aria-label="Medium" showValue />
      <Knob value={c} onValueChange={setC} size="lg" aria-label="Large" showValue />
    </div>
  );
};
```

### Bipolar — balance / pan

`bipolar` flips the fill so the arc grows outward from the centre angle. Pair with a symmetric range (e.g. `-100` → `+100`) so the midpoint reads as a clean "neutral" with no fill. Double-tap returns to the centre — set `defaultValue={0}` to make that explicit.

```tsx preview
() => {
  const [pan, setPan] = useState(0);
  const fmt = (v) => {
    if (v === 0) return "C";
    return v > 0 ? `R ${v}` : `L ${Math.abs(v)}`;
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <Knob
        value={pan}
        onValueChange={setPan}
        min={-100}
        max={100}
        defaultValue={0}
        bipolar
        showValue
        formatValue={fmt}
        size="lg"
        aria-label="Pan"
      />
      <span className="text-style-caption text-fg-muted">Double-tap to centre</span>
    </div>
  );
};
```

### Custom range — tempo

`min`, `max`, `step`, and `formatValue` together cover non-percentage ranges. Here a tempo dial spans 0.5× → 2× in 0.05 increments.

```tsx preview
() => {
  const [rate, setRate] = useState(1);
  const fmt = (v) => `${v.toFixed(2)}×`;
  return (
    <div className="flex flex-col items-center gap-2">
      <Knob
        value={rate}
        onValueChange={setRate}
        min={0.5}
        max={2}
        step={0.05}
        defaultValue={1}
        showValue
        formatValue={fmt}
        size="lg"
        aria-label="Playback rate"
      />
      <span className="text-style-caption text-fg-muted">Double-tap to reset to 1.00×</span>
    </div>
  );
};
```

### Bank — multiple knobs

Lays out comfortably in a row when paired with labels and live readouts. The pattern an EQ / filter panel would use.

```tsx preview
() => {
  const [low, setLow] = useState(0);
  const [mid, setMid] = useState(0);
  const [high, setHigh] = useState(0);
  const fmtDb = (v) => `${v > 0 ? "+" : ""}${v} dB`;
  return (
    <div className="flex items-end gap-8">
      {[
        { label: "Low", value: low, set: setLow },
        { label: "Mid", value: mid, set: setMid },
        { label: "High", value: high, set: setHigh },
      ].map(({ label, value, set }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <Knob
            value={value}
            onValueChange={set}
            min={-12}
            max={12}
            step={1}
            defaultValue={0}
            bipolar
            showValue
            formatValue={fmtDb}
            aria-label={label}
          />
          <span className="text-style-eyebrow text-fg-muted">{label}</span>
        </div>
      ))}
    </div>
  );
};
```

### Form integration

Pass `name` and the knob serializes with the surrounding `<form>`. Works in both controlled and uncontrolled modes; here the knob is uncontrolled with `defaultValue` and the form reads the value via `FormData` on submit.

```tsx preview
() => {
  const [submitted, setSubmitted] = useState(null);
  return (
    <form
      className="flex items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(data.get("gain"));
      }}
    >
      <Knob name="gain" defaultValue={50} aria-label="Gain" showValue />
      <button
        type="submit"
        className="px-3 py-1 rounded-sm bg-accent text-accent-fg text-style-caption"
      >
        Submit
      </button>
      {submitted !== null ? (
        <span className="text-style-caption text-fg-muted">gain = {String(submitted)}</span>
      ) : null}
    </form>
  );
};
```

### Disabled

```tsx preview
<Knob defaultValue={40} disabled showValue aria-label="Disabled knob" />
```

## Props

```json props
[
  {
    "prop": "value",
    "type": "number",
    "default": "—",
    "description": "Controlled value. Pair with `onValueChange`. Omit for uncontrolled mode (knob tracks `defaultValue` internally)."
  },
  {
    "prop": "defaultValue",
    "type": "number",
    "default": "min (or midpoint when `bipolar`)",
    "description": "Initial value in uncontrolled mode. Also the target for double-tap reset in both controlled and uncontrolled mode."
  },
  {
    "prop": "onValueChange",
    "type": "(value: number) => void",
    "default": "—",
    "description": "Fires on every drag tick, key press, wheel notch, and reset. Snapped + clamped to `min`/`max`/`step`."
  },
  {
    "prop": "onValueCommitted",
    "type": "(value: number) => void",
    "default": "—",
    "description": "Fires once on pointer-up after a drag. For keyboard, wheel, and double-tap, fires alongside `onValueChange` since those changes are already discrete."
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
    "description": "Granularity. Keyboard arrows move by this step; PageUp/Down move by 10× step."
  },
  {
    "prop": "bipolar",
    "type": "boolean",
    "default": "false",
    "description": "Fill arc grows outward from the centre angle instead of from the start. Use for symmetric ranges (pan, balance, ±dB) so a value at the midpoint shows no fill."
  },
  {
    "prop": "size",
    "type": "\"sm\" | \"md\" | \"lg\"",
    "default": "\"md\"",
    "description": "Knob diameter. sm 40 px, md 56 px, lg 72 px."
  },
  {
    "prop": "showValue",
    "type": "boolean",
    "default": "false",
    "description": "Render the current value at the knob's centre. Pair with `formatValue` for non-numeric readouts (\"L 12\", \"1.25×\")."
  },
  {
    "prop": "formatValue",
    "type": "(value: number) => string",
    "default": "Math.round",
    "description": "Formatter for the centre readout. Also surfaces as the knob's `aria-valuetext` so screen readers hear the formatted value."
  },
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Drops opacity, removes the knob from the tab order, and ignores pointer / keyboard / wheel input."
  },
  {
    "prop": "name",
    "type": "string",
    "default": "—",
    "description": "Form field name. When set, a hidden input shadows the live value so the knob serializes with surrounding `<form>` submissions."
  },
  {
    "prop": "form",
    "type": "string",
    "default": "—",
    "description": "Form id, forwarded to the hidden input. Lets the knob attach to a form it isn't physically nested in."
  },
  {
    "prop": "aria-label",
    "type": "string",
    "default": "—",
    "description": "Accessible name. Required when there's no visible label nearby."
  },
  {
    "prop": "aria-labelledby",
    "type": "string",
    "default": "—",
    "description": "Use when the label is a separate element with its own id."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the focusable root. Useful for layout (margin, alignment) — visual size should go through `size`."
  }
]
```

## Accessibility

- The root carries `role="slider"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` plus `aria-orientation="vertical"` (the drag axis). Pass `aria-label` (or `aria-labelledby`) so the announcement reads as a named control.
- `formatValue` doubles as `aria-valuetext` so screen readers hear "L 12" or "1.25×" instead of a bare number.
- Keyboard control is full-featured — Tab into it and use arrows / Page / Home / End. Focus halo is the standard 2 px accent outline.
- Hold `Shift` while dragging or scrolling for fine adjustment (×0.2). Double-tap (or double-click) resets to `defaultValue`.
- `touch-action: none` on the root keeps the drag from competing with vertical page scroll on the M500's touchscreen.

### Keyboard

```json keyboard
[
  { "keys": ["ArrowUp", "ArrowRight"], "description": "Increment by `step`." },
  { "keys": ["ArrowDown", "ArrowLeft"], "description": "Decrement by `step`." },
  { "keys": ["PageUp"], "description": "Increment by 10× `step`." },
  { "keys": ["PageDown"], "description": "Decrement by 10× `step`." },
  { "keys": ["Home"], "description": "Jump to `min`." },
  { "keys": ["End"], "description": "Jump to `max`." }
]
```
