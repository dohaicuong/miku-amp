# Breakpoints

Tailwind's default min-width breakpoints, applied mobile-first. Every layout has to work at the M500 viewport (360 × 640 CSS px) **and** on Linux desktop, so we use the full ladder — `sm:`, `md:`, `lg:`, `xl:`, `2xl:` — not just one or two.

## Reference

```tsx preview
() => {
  const breakpoints = [
    {
      name: "(default)",
      min: "0px",
      note: "M500 viewport — single column, ≥44 px touch targets, dense lists",
    },
    {
      name: "sm",
      min: "640px",
      note: "narrow tablets / large phones in landscape — sidebar can stay expanded",
    },
    { name: "md", min: "768px", note: "tablets in portrait, narrow laptops" },
    { name: "lg", min: "1024px", note: "tablets in landscape, standard laptops" },
    { name: "xl", min: "1280px", note: "wide laptops, smaller desktops" },
    { name: "2xl", min: "1536px", note: "large desktops" },
  ];
  return (
    <div className="flex flex-col w-full">
      {breakpoints.map((bp) => (
        <div
          key={bp.name}
          className="grid grid-cols-[5rem_1fr] sm:grid-cols-[6rem_6rem_1fr] items-baseline gap-x-4 gap-y-1 border-t border-border py-3"
        >
          <code className="text-style-track-title text-fg">{bp.name}</code>
          <code className="text-style-body text-fg-muted tabular-nums">{`≥ ${bp.min}`}</code>
          <span className="text-style-caption text-fg-muted col-span-2 sm:col-span-1">
            {bp.note}
          </span>
        </div>
      ))}
    </div>
  );
};
```

## Mobile-first authoring

Write the base style for the M500. Layer breakpoint prefixes on top to upgrade larger screens — they cascade up, so later breakpoints override earlier ones.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">…</div>
```

In that example: M500 sees one column; `sm:` (≥640 px) jumps to two; `lg:` (≥1024 px) to three; `xl:` (≥1280 px) to four. Each step adds breathing room as the viewport widens.

## What changes at each breakpoint in this app

- **Default (M500, < 640 px)** — single column, dense rows, touch-target sizing. Sidebar collapses to icon-only via JS (the docs system uses this pattern in `components/route.tsx`).
- **`sm:` ≥ 640 px** — sidebars expand to full labels; lists may go to two columns; bottom-sheet drawers can become side drawers.
- **`md:` ≥ 768 px** — multi-column grids start being comfortable; the player now-playing screen can sit beside the queue instead of stacking.
- **`lg:` ≥ 1024 px** — desktop layouts proper; persistent secondary panels (queue / detail) coexist with the main view.
- **`xl:` ≥ 1280 px** — wider content max-widths; album grids step to four columns; the typography clamp() upper bound kicks in.
- **`2xl:` ≥ 1536 px** — five-up album grids on a big monitor; hero surfaces breathe.

## When _not_ to add a breakpoint

If the only thing changing across breakpoints is "things get a bit bigger", let the layout flow naturally. Reach for a breakpoint when the _structure_ changes — number of columns, sidebar collapsed/expanded, stacked vs. side-by-side. Per-breakpoint font-size escalation is what the `clamp()`-based `text-style-display` / `text-style-heading-1` / `text-style-lead` utilities are for; you shouldn't need `text-base sm:text-lg md:text-xl` ladders.

Avoid `max-*` reverse breakpoints unless a layout truly needs phone-only treatment — they fight the mobile-first cascade and tend to leave one viewport size with no rules at all when later edits change the source order.
