# Animation

Music players need to feel snappy — every animation has to earn its place. The system ships a small set of named keyframes for genuinely indeterminate work (loading, scanning) and leans on Tailwind's stock `transition-*` utilities at deliberately short durations for everything else.

## Keyframes

### progress-indeterminate

Sweeps a third-width pill from off-screen left (`-100%`) to off-screen right (`400%`) over 1.6 s. Used by the indeterminate `Progress` bar — library scan in flight, "decoding next track" pre-fetch.

```tsx preview
<div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
  <div className="h-full w-1/3 bg-accent animate-progress-indeterminate" />
</div>
```

### skeleton-shimmer

Slides a 200 %-wide horizontal gradient from right to left to suggest light glancing across an unloaded surface. Pair with a `bg-gradient-to-r` background and `bg-[length:200%_100%]` so the gradient has room to travel. Used by `Skeleton` — track-row placeholders during library scan, cover-art placeholders while images decode.

```tsx preview
<div
  className="h-4 w-full max-w-md rounded-sm bg-gradient-to-r from-border via-surface to-border bg-[length:200%_100%] animate-skeleton-shimmer"
/>
```

### spin (Tailwind built-in)

Tailwind's stock `animate-spin` for one-degree-per-frame rotation. Reserved for genuinely indeterminate loaders where progress can't be measured (a network request mid-flight). Avoid for "loading the library" — that's `Progress` indeterminate, which reads as "something's happening" without the spinner-fatigue stigma.

```tsx preview
<div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
```

## Durations & easing

The player follows three timing conventions:

- **`duration-150`** — interactive feedback. Hover colour shifts, button presses, tab switches. Anything tied to a single tap should resolve in under a sixth of a second so the UI never feels laggy.
- **`duration-200`** — small layout transitions. Sidebar collapse, drawer slide, dialog open / close. Long enough to read as motion, short enough to stay out of the way.
- **`duration-300`+** — set-pieces with intent. Accordion panel expansion (`duration-300`), the indeterminate progress sweep (`1.6s`). Use sparingly.

Easing:

- **`ease-out`** for entries — the motion decelerates as it lands, so the eye sees the destination clearly.
- **`ease-in-out`** for repeating motion — symmetric loops (progress sweep, skeleton shimmer) read as continuous rather than pulsed.
- **`linear`** for true constant motion — `animate-spin`, anywhere acceleration would feel unnatural. Almost never the right choice for finite UI motion.

## When not to animate

Reading a track list, tapping play, scrubbing the timeline — these are the primary use, and animation in any of them is friction. Keep these surfaces still:

- **Track list rows** — selection + playing-state change *colour* via `transition-colors duration-150`, never *position*. Don't reorder with motion.
- **Mini-player ↔ now-playing** — the only reasonable transition between them is a slide / scale (200 ms), but during a scrub or play/pause the surfaces should not move.
- **Scrubber thumb** — follows the cursor / finger 1:1 with no transition. Any easing on a scrubber feels like input lag.
- **Volume slider** — same. No transition on the thumb position.
- **Cover-art swap on track change** — instant. A crossfade reads as "the app is thinking" when actually the song already changed.

Reserve motion for state transitions the user *initiated* (drawer open, settings sheet) and for genuinely indeterminate work (library scan, decoding). Reading a library and playing music are the boring path — they should feel like nothing.
