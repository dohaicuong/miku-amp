```scope
Progress
```

# Progress

Linear bar for track scrubbing, scan progress, and loading states. Wraps Base UI's headless `Progress` so ARIA semantics and the indeterminate state come for free. Indicator fills with `bg-accent`; track sits on `bg-surface`.

```tsx preview
<div className="w-full max-w-md">
  <Progress value={60} aria-label="Track progress" />
</div>
```

## Anatomy

The wrapper renders Base UI's full progress tree (`Root` + optional `Label` / `Value` header + `Track` + `Indicator`) as one component. Pass `label` and / or `showValue` to opt into the header row.

```tsx
import { Progress } from "@/components/primitives/progress";

<Progress value={60} aria-label="Track progress" />
<Progress value={42} label="Now scanning" showValue aria-label="Scan progress" />;
```

## Examples

### Sizes

`size` controls the bar height (`sm` = 4 px, `md` = 6 px, `lg` = 10 px). Use `sm` inline (e.g. table rows, mini-player), `md` as the default, `lg` for hero placements.

```tsx preview
<div className="w-full max-w-md flex flex-col gap-5">
  <div className="flex flex-col gap-2">
    <span className="text-style-caption text-fg-muted">Small</span>
    <Progress value={64} size="sm" aria-label="Small" />
  </div>
  <div className="flex flex-col gap-2">
    <span className="text-style-caption text-fg-muted">Medium</span>
    <Progress value={64} size="md" aria-label="Medium" />
  </div>
  <div className="flex flex-col gap-2">
    <span className="text-style-caption text-fg-muted">Large</span>
    <Progress value={64} size="lg" aria-label="Large" />
  </div>
</div>
```

### Values

`value` accepts 0–100. The indicator transitions on `width` so updates animate naturally.

```tsx preview
<div className="w-full max-w-md flex flex-col gap-5">
  {[0, 25, 50, 75, 100].map((v) => (
    <div key={v} className="flex flex-col gap-2">
      <span className="text-style-caption text-fg-muted">{v}%</span>
      <Progress value={v} aria-label={`${v} percent`} />
    </div>
  ))}
</div>
```

### Animated

The `transition-[width]` on the indicator means a changing `value` tweens between frames on its own. Drive it from any source — a `useState` interval, an audio element's `timeupdate`, a long-running scan job.

```tsx preview
function AnimatedProgressDemo() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full max-w-md">
      <Progress value={value} label="Scanning library" showValue aria-label="Scanning library" />
    </div>
  );
}
```

### Indeterminate

Pass `value={null}` for the indeterminate state. The indicator shrinks to a third-width pill and sweeps left-right via the `progress-indeterminate` keyframe.

```tsx preview
<div className="w-full max-w-md flex flex-col gap-2">
  <span className="text-style-caption text-fg-muted">Loading</span>
  <Progress value={null} aria-label="Loading" />
</div>
```

### With label and value

`label` renders a `Progress.Label` on the left of the header row; `showValue` renders a `Progress.Value` on the right (auto-formats to a percentage).

```tsx preview
<div className="w-full max-w-md">
  <Progress value={42} label="Now scanning" showValue aria-label="Scan progress" />
</div>
```

## Props

### Progress

Wraps Base UI's Progress compound (`Root` + `Label` + `Value` + `Track` + `Indicator`) into a single component.

```json props
[
  {
    "prop": "value",
    "type": "number | null",
    "default": "—",
    "description": "Current value (0–100). Pass `null` for the indeterminate state."
  },
  {
    "prop": "size",
    "type": "\"sm\" | \"md\" | \"lg\"",
    "default": "\"md\"",
    "description": "Track height: `h-1` / `h-1.5` / `h-2.5`."
  },
  {
    "prop": "label",
    "type": "string",
    "default": "—",
    "description": "Optional visible label rendered above the track via `Progress.Label`."
  },
  {
    "prop": "showValue",
    "type": "boolean",
    "default": "false",
    "description": "Renders the percentage on the right of the header row via `Progress.Value`."
  },
  {
    "prop": "trackClassName",
    "type": "string",
    "default": "—",
    "description": "Merged onto the track element after the size class."
  },
  {
    "prop": "indicatorClassName",
    "type": "string",
    "default": "—",
    "description": "Merged onto the indicator element after the base styles."
  },
  {
    "prop": "aria-label",
    "type": "string",
    "default": "—",
    "description": "Accessible name. Always provide one (or use `label`, which contributes its own name via Base UI)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Progress.Root props",
    "default": "—",
    "description": "Standard root props pass through (e.g. `format`, `getAriaValueText`)."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-indeterminate",
    "description": "Set on the indicator when `value` is null. Drives the shrink + keyframe animation."
  }
]
```

## Accessibility

- Renders an ARIA `progressbar`. Always provide an `aria-label` or `label` so the bar's purpose is announced.
- For indeterminate progress, the bar communicates `aria-valuetext` automatically — assistive tech knows the value is unknown.
- For long-running progress, consider also surfacing the value as visible text (`showValue`) for sighted users.
