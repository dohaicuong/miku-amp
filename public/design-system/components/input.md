```scope
Input
MagnifyingGlassIcon
XIcon
useState
```

# Input

Single-line text field built on Base UI's headless `Input`. Three sizes, optional leading and trailing icons, plus `invalid` and `disabled` states. Sizes match the rest of the system — `md` lands at the 44 px touch-target the M500 expects.

```tsx preview
<Input placeholder="Search the library" className="max-w-md" />
```

## Anatomy

Wraps `BaseInput`. Accepts `leftIcon` / `rightIcon` props that overlay a positioned, non-interactive icon — when either is set, the component switches to a `relative` container so the icon and input share a layout box.

```tsx
import { Input } from "@/components/primitives/input";

<Input placeholder="Search" />
<Input leftIcon={<MagnifyingGlassIcon />} placeholder="Search the library" />;
```

## Examples

### Sizes

Heights are 36 / 44 / 48 px to match the Button primitive — `md` is the iOS/Android minimum touch target. Icon padding (`pl-9` / `pl-10` / `pl-12` and the right-side mirror) is wired to the size so icons sit flush whatever you pick.

```tsx preview
<div className="flex flex-col gap-3 w-full max-w-md">
  <Input size="sm" placeholder="Small" />
  <Input size="md" placeholder="Medium" />
  <Input size="lg" placeholder="Large" />
</div>
```

### With icons

`leftIcon` and `rightIcon` are decorative — the wrapper sets `pointer-events-none` so they don't intercept focus or selection.

```tsx preview
<div className="flex flex-col gap-3 w-full max-w-md">
  <Input leftIcon={<MagnifyingGlassIcon />} placeholder="Search the library" />
  <Input rightIcon={<XIcon />} placeholder="Filter" />
</div>
```

### Controlled

Pass `value` and `onChange` to own state in the parent. Standard React-input semantics — nothing component-specific.

```tsx preview
{
  () => {
    const [v, setV] = useState("");
    return (
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Type to control"
        className="max-w-md"
      />
    );
  };
}
```

### Disabled

Sets the native `disabled` attribute (Base UI also exposes `data-disabled` for styling). Cursor flips to `not-allowed` and opacity drops to 50 %.

```tsx preview
<Input disabled placeholder="Disabled" className="max-w-md" />
```

### Invalid

Pass `invalid` to set `aria-invalid` on the underlying input. The border switches to the system's `highlight` (pink) — the closest red-adjacent state marker in the palette, used here as an attention cue rather than playback state — via the `aria-invalid:` Tailwind variant.

```tsx preview
<Input invalid placeholder="Invalid" defaultValue="not quite right" className="max-w-md" />
```

## Props

### Input

Renders Base UI's headless `Input` (a thin wrapper around `<input>`) with the design system's borders, sizing, and focus tokens.

```json props
[
  {
    "prop": "size",
    "type": "\"sm\" | \"md\" | \"lg\"",
    "default": "\"md\"",
    "description": "Height + horizontal padding. Also drives the icon padding when leftIcon / rightIcon is set."
  },
  {
    "prop": "invalid",
    "type": "boolean",
    "default": "false",
    "description": "Sets `aria-invalid` on the underlying input. The `aria-invalid:border-highlight` variant flips the border colour to pink."
  },
  {
    "prop": "leftIcon",
    "type": "ReactNode",
    "default": "—",
    "description": "Optional leading icon. Rendered absolutely-positioned with `pointer-events-none` so it doesn't interfere with focus or selection."
  },
  {
    "prop": "rightIcon",
    "type": "ReactNode",
    "default": "—",
    "description": "Optional trailing icon. Same positioning rules as leftIcon."
  },
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Standard input disabled. Drops opacity to 50 % and switches the cursor to not-allowed."
  },
  {
    "prop": "...rest",
    "type": "InputHTMLAttributes<HTMLInputElement>",
    "default": "—",
    "description": "All standard input attributes (value, defaultValue, onChange, placeholder, name, type, etc.) pass through to the underlying `<input>`."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-disabled",
    "description": "Mirrored by Base UI when `disabled` is set, so styling stays consistent across native and rendered forms."
  }
]
```

## Accessibility

- Renders a real `<input>` so the browser handles role, tabbing, and form integration.
- `invalid` sets `aria-invalid`, but it does not announce a message — pair the field with a description / error element via `aria-describedby` when validation messaging matters.
- Decorative icons live in a `pointer-events-none` overlay; if you need an interactive trailing affordance (clear, reveal-password, etc.) wire it up as a sibling button outside the input rather than via `rightIcon`.

### Keyboard

```json keyboard
[
  { "keys": ["Tab"], "description": "Moves focus into and out of the field in document order." },
  { "keys": ["Enter"], "description": "Submits the enclosing form (browser default)." }
]
```
