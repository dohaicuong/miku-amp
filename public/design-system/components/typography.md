# Typography

Single sans-serif (Inter) for everything UI; mono digits for time displays. Drop a `text-style-*` utility on any element. Colour stays separate — pair with `text-fg`, `text-fg-muted`, `text-accent`, or `text-highlight` as needed.

## Music UI scale

The styles tuned for the player's actual surfaces — a track row, a section eyebrow, a now-playing display.

```tsx preview
() => {
  const styles = [
    { name: "text-style-display", sample: "World Is Mine" },
    { name: "text-style-section-title", sample: "Recently Played" },
    { name: "text-style-track-title", sample: "Romeo and Cinderella" },
    { name: "text-style-track-meta", sample: "doriko · supercell · 2009" },
    { name: "text-style-eyebrow", sample: "Now Playing" },
    { name: "text-style-time", sample: "03:47 / 04:12" },
    { name: "text-style-caption", sample: "Tap to scan a directory" },
  ];
  return (
    <div className="flex flex-col w-full">
      {styles.map((s) => (
        <div
          key={s.name}
          className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-baseline gap-2 sm:gap-6 border-t border-border py-5"
        >
          <code className="text-style-caption text-fg-muted">{s.name}</code>
          <div className={`${s.name} text-fg`}>{s.sample}</div>
        </div>
      ))}
    </div>
  );
};
```

## Prose scale

Generic typography for documentation and longer-form text. Used by the prose renderer in this very page.

```tsx preview
() => {
  const styles = [
    { name: "text-style-heading-1", sample: "Page Title" },
    { name: "text-style-heading-2", sample: "Section Heading" },
    { name: "text-style-heading-3", sample: "Subsection Heading" },
    { name: "text-style-lead", sample: "A lead paragraph that introduces a section." },
    {
      name: "text-style-body",
      sample: "Running prose copy. The reading surface for documentation pages.",
    },
  ];
  return (
    <div className="flex flex-col w-full">
      {styles.map((s) => (
        <div
          key={s.name}
          className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-baseline gap-2 sm:gap-6 border-t border-border py-5"
        >
          <code className="text-style-caption text-fg-muted">{s.name}</code>
          <div className={`${s.name} text-fg`}>{s.sample}</div>
        </div>
      ))}
    </div>
  );
};
```

## Why mono for time

Track-time readouts (`03:47 / 04:12`) update once a second as a track plays. With proportional digits the readout jiggles as the digit widths change — `1` is narrower than `8`, so the colon shifts left and right. `text-style-time` uses tabular-figure mono so the readout stays still; readers' eyes glance at it without registering motion.
