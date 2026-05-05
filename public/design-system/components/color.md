# Color

Single dark preset, anchored on canonical Hatsune Miku Cyan (`#39c5bd`) and a complementary pink (`#ea547a`) sampled from the M500's button accents. Surfaces lean cool so cyan accents feel at home rather than floating on neutral grey.

## Brand

The two fixed hues that define the app's identity. Reach for these only when something must read as "Miku" specifically — e.g. brand artwork, splash, settings header. Components should consume `accent` / `highlight` semantic tokens instead so future preset switching can retune everything.

```tsx preview
() => {
  const Swatch = ({ name, value, fillClass }) => (
    <div className="flex flex-col gap-2 border border-border rounded-sm overflow-hidden">
      <div className={`h-16 ${fillClass}`} />
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        <code className="text-style-caption text-fg">{name}</code>
        <code className="text-style-caption text-fg-muted">{value}</code>
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <Swatch name="miku-cyan" value="#39c5bd" fillClass="bg-miku-cyan" />
      <Swatch name="miku-pink" value="#ea547a" fillClass="bg-miku-pink" />
    </div>
  );
};
```

## Surfaces

Three layers of dark — page bg, raised surface (cards / mini-player / drawers), and the divider line between them. The slight teal undertone is intentional; pure neutral makes the cyan accent read as foreign rather than at home.

```tsx preview
() => {
  const Swatch = ({ name, note, fillClass }) => (
    <div className="flex flex-col gap-2 border border-border rounded-sm overflow-hidden">
      <div className={`h-16 ${fillClass}`} />
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        <code className="text-style-caption text-fg">{name}</code>
        <span className="text-style-caption text-fg-muted">{note}</span>
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      <Swatch name="bg" note="page background" fillClass="bg-bg" />
      <Swatch name="surface" note="raised cards / mini-player / drawer" fillClass="bg-surface" />
      <Swatch name="border" note="rules and dividers" fillClass="bg-border" />
    </div>
  );
};
```

## Text

Three foreground tones. Body copy at `fg`, secondary metadata (artist, album, captions) at `fg-muted`, almost-invisible group labels and separators at `fg-subtle`. The list-row pattern uses all three: track title at `fg`, "artist · album" at `fg-muted`, "ALBUMS" eyebrow at `fg-subtle`.

```tsx preview
<div className="flex flex-col w-full">
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-baseline gap-1 sm:gap-4 border-t border-border py-3">
    <code className="text-style-caption text-fg-muted">fg</code>
    <span className="text-style-body text-fg">The track title in primary text</span>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-baseline gap-1 sm:gap-4 border-t border-border py-3">
    <code className="text-style-caption text-fg-muted">fg-muted</code>
    <span className="text-style-body text-fg-muted">Artist · Album · 2024</span>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-baseline gap-1 sm:gap-4 border-t border-border py-3">
    <code className="text-style-caption text-fg-muted">fg-subtle</code>
    <span className="text-style-body text-fg-subtle">ALBUMS · group label</span>
  </div>
</div>
```

## Accent (cyan)

The interaction layer. `accent` is the base; `accent-fg` is the readable text colour on top of an accent fill; `accent-soft` is the focus-ring / hover-bg tint; `accent-hover` and `accent-active` darken toward `accent-fg` so they self-adjust if the accent ever swaps.

```tsx preview
() => {
  const Swatch = ({ name, note, fillClass }) => (
    <div className="flex flex-col gap-2 border border-border rounded-sm overflow-hidden">
      <div className={`h-16 ${fillClass}`} />
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        <code className="text-style-caption text-fg">{name}</code>
        <span className="text-style-caption text-fg-muted">{note}</span>
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      <Swatch name="accent" note="primary interaction colour" fillClass="bg-accent" />
      <Swatch name="accent-fg" note="text on accent fill" fillClass="bg-accent-fg" />
      <Swatch name="accent-soft" note="hover/focus background tint" fillClass="bg-accent-soft" />
      <Swatch name="accent-hover" note="darkened for hover" fillClass="bg-accent-hover" />
      <Swatch
        name="accent-active"
        note="darker still for active/pressed"
        fillClass="bg-accent-active"
      />
    </div>
  );
};
```

## Highlight (pink)

The state layer. Used to mark _the song right now_, the active item in a queue, a destination already playing. Single soft tint — `highlight` is a flat marker, not an interactive surface, so no hover/active shades.

```tsx preview
() => {
  const Swatch = ({ name, note, fillClass }) => (
    <div className="flex flex-col gap-2 border border-border rounded-sm overflow-hidden">
      <div className={`h-16 ${fillClass}`} />
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        <code className="text-style-caption text-fg">{name}</code>
        <span className="text-style-caption text-fg-muted">{note}</span>
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      <Swatch name="highlight" note="now-playing / active state colour" fillClass="bg-highlight" />
      <Swatch name="highlight-fg" note="text on highlight fill" fillClass="bg-highlight-fg" />
      <Swatch
        name="highlight-soft"
        note="row-bg tint for active item"
        fillClass="bg-highlight-soft"
      />
    </div>
  );
};
```

## Composition

Both accents in their natural roles — cyan for the interactive button, pink for the highlighted "now playing" row.

```tsx preview
<div className="flex flex-col gap-3 w-full max-w-md">
  <button className="self-start px-4 py-2 rounded-sm bg-accent text-accent-fg text-style-track-title hover:bg-accent-hover transition-colors">
    Play
  </button>
  <div className="border border-border rounded-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-style-track-title text-fg">Romeo and Cinderella</span>
        <span className="text-style-track-meta text-fg-muted">doriko · 2009</span>
      </div>
      <span className="text-style-time text-fg-muted">5:25</span>
    </div>
    <div className="px-4 py-3 bg-highlight-soft border-b border-border flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-style-track-title text-highlight">World Is Mine</span>
        <span className="text-style-track-meta text-fg-muted">supercell · 2008</span>
      </div>
      <span className="text-style-time text-fg-muted">4:08</span>
    </div>
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-style-track-title text-fg">Tell Your World</span>
        <span className="text-style-track-meta text-fg-muted">livetune · 2012</span>
      </div>
      <span className="text-style-time text-fg-muted">4:25</span>
    </div>
  </div>
</div>
```
