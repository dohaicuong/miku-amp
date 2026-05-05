```scope
Skeleton
```

# Skeleton

Loading placeholders with a gentle shimmer. Three convenience shapes — `rect`, `text`, `circle` — that cover almost every layout-preserving wait state in the player. Use while the library scan is streaming in metadata, while a chapter image is decoding, or any other "the bones are here, the content's coming" moment.

```tsx preview
<div className="w-full max-w-md">
  <Skeleton variant="rect" className="h-32 w-full" />
</div>
```

## Anatomy

A single `<div>` (or a stack of `<div>`s for multi-line text). The shimmer is a 200 %-wide horizontal gradient swept by the `skeleton-shimmer` keyframe on a 1.6 s loop, applied via the `animate-skeleton-shimmer` utility.

```tsx
import { Skeleton } from "@/components/primitives/skeleton";

<Skeleton variant="rect" className="h-32 w-full" />
<Skeleton variant="text" lines={3} />
<Skeleton variant="circle" className="h-12 w-12" />;
```

## Examples

### Rect

The default. Use for cards, cover-art placeholders, or any rectangular block. Pass any `h-…` and `w-…` utilities via `className`.

```tsx preview
<div className="w-full max-w-md">
  <Skeleton variant="rect" className="h-32 w-full" />
</div>
```

### Text — single line

```tsx preview
<div className="w-full max-w-md">
  <Skeleton variant="text" />
</div>
```

### Text — paragraph

`lines` stacks N skeletons with `gap-2`. The last line shrinks to `w-3/4` so it reads like real prose rather than a justified slab.

```tsx preview
<div className="w-full max-w-md">
  <Skeleton variant="text" lines={3} />
</div>
```

### Circle

Use for avatars, round badges, or any disc-shaped placeholder. Pass an explicit `h-…` / `w-…` (the variant only sets `aspect-square` and `rounded-full`).

```tsx preview
<div className="flex items-center gap-4">
  <Skeleton variant="circle" className="h-8 w-8" />
  <Skeleton variant="circle" className="h-12 w-12" />
  <Skeleton variant="circle" className="h-16 w-16" />
</div>
```

### Track row placeholder

Compose the variants to suggest the final layout while content loads. Useful for the library scan's first few seconds — the user sees the row count materialise immediately, with track titles and metadata filling in as the worker finishes parsing.

```tsx preview
<div className="flex flex-col w-full max-w-md border border-border rounded-md overflow-hidden">
  {[0, 1, 2].map((i) => (
    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
      <Skeleton variant="rect" className="h-10 w-10 shrink-0 rounded-sm" />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
      <Skeleton variant="text" className="h-3 w-10 shrink-0" />
    </div>
  ))}
</div>
```

## Props

### Skeleton

A presentational placeholder. Renders `role="status"` with `aria-busy` so screen readers announce a loading state.

```json props
[
  {
    "prop": "variant",
    "type": "\"rect\" | \"text\" | \"circle\"",
    "default": "\"rect\"",
    "description": "Shape preset. `rect` and `text` render a `w-full h-4 rounded-sm` block by default; `circle` adds `aspect-square` + `rounded-full` and expects an explicit size via className."
  },
  {
    "prop": "lines",
    "type": "number",
    "default": "1",
    "description": "Only honoured when `variant=\"text\"`. With >1 lines, the wrapper renders a `flex-col gap-2` stack and shrinks the last line to `w-3/4`."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged after the variant classes. Use for explicit `h-…` / `w-…` sizing."
  },
  {
    "prop": "role",
    "type": "string",
    "default": "\"status\"",
    "description": "Override only if you have a different ARIA structure that already conveys loading state at a higher level."
  },
  {
    "prop": "aria-busy",
    "type": "boolean",
    "default": "true",
    "description": "Default true so AT users hear the busy state. Set false if a parent already advertises it."
  },
  {
    "prop": "aria-live",
    "type": "\"polite\" | \"assertive\" | \"off\"",
    "default": "\"polite\"",
    "description": "Polite by default — assistive tech announces the load without interrupting."
  },
  {
    "prop": "...rest",
    "type": "HTMLAttributes<HTMLDivElement>",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

## Accessibility

- `role="status"` + `aria-busy="true"` + `aria-live="polite"` come pre-set, so AT users hear "loading" without a custom announcement.
- For long-running loads, supply a parent region with a real label (e.g. `aria-label="Scanning library"`) and set `aria-busy={false}` on the children to avoid duplicate announcements.
- The shimmer is decorative; users with `prefers-reduced-motion` should ideally see a static gradient. Consider gating the animation at the surrounding feature level if the wait state is long enough that motion would be a concern.
