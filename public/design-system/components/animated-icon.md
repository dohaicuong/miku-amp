```scope
AnimatedIcon
ANIMATED_ICON_NAMES
useToast
```

# Animated Icon

Sprite-frame animation surface for the chibi mascot cels. One component cycles a `<name>NN.png` sequence under `/public/animated-icons/<name>/` at a configurable frame rate, with looping, pausing, and one-shot semantics. Sizing is the caller's job — pass dimensions via `className`.

```tsx preview
() => {
  const [name, setName] = useState("def");
  return (
    <div className="flex flex-col items-start gap-4">
      <label className="flex flex-col gap-1 text-style-caption text-fg-muted">
        Animation
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-style-body bg-surface text-fg border border-border rounded-sm px-2 py-1 outline-accent focus-visible:outline-2"
        >
          {ANIMATED_ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="w-40 aspect-square">
        <AnimatedIcon name={name} />
      </div>
    </div>
  );
};
```

## Examples

### Listening / not-listening pair

The two music-app-relevant moods. Wire `listenmusic` to playback-state-on, `notlistenmusic` to paused.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="flex items-center gap-8">
      <div className="w-32 aspect-square">
        <AnimatedIcon name={playing ? "listenmusic" : "notlistenmusic"} />
      </div>
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="text-style-body text-accent hover:underline"
      >
        Toggle ({playing ? "listening" : "not listening"})
      </button>
    </div>
  );
};
```

### Pause control

`playing={false}` freezes on the current frame. The animation resumes from the same frame when toggled back on, so the motion picks up where it left off.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="flex items-center gap-6">
      <div className="w-28 aspect-square">
        <AnimatedIcon name="dizzy" playing={playing} />
      </div>
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="text-style-body text-accent hover:underline"
      >
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
};
```

### One-shot with `onComplete`

`loop={false}` halts on the last frame. `onComplete` fires once on that transition — useful for chaining UI (toasts, navigation, state flips) to a finished animation.

```tsx preview
() => {
  const toast = useToast();
  const [runId, setRunId] = useState(0);
  return (
    <div className="flex items-center gap-6">
      <div className="w-28 aspect-square">
        <AnimatedIcon
          key={runId}
          name="bye"
          loop={false}
          onComplete={() => toast.toast({ title: "She's gone." })}
        />
      </div>
      <button
        type="button"
        onClick={() => setRunId((n) => n + 1)}
        className="text-style-body text-accent hover:underline"
      >
        Replay
      </button>
    </div>
  );
};
```

### Frame rate

Default is 12 fps. Drop to 6 for a sleepy / contemplative read; push to 24 for a frantic one. The chibi cels are illustrated for the 10–15 band; outside that range the motion starts to feel either choppy or floaty.

```tsx preview
<div className="flex items-end gap-8">
  <div className="flex flex-col items-center gap-1">
    <div className="w-24 aspect-square">
      <AnimatedIcon name="drink" fps={6} />
    </div>
    <span className="text-style-caption text-fg-muted">6 fps</span>
  </div>
  <div className="flex flex-col items-center gap-1">
    <div className="w-24 aspect-square">
      <AnimatedIcon name="drink" fps={12} />
    </div>
    <span className="text-style-caption text-fg-muted">12 fps (default)</span>
  </div>
  <div className="flex flex-col items-center gap-1">
    <div className="w-24 aspect-square">
      <AnimatedIcon name="drink" fps={24} />
    </div>
    <span className="text-style-caption text-fg-muted">24 fps</span>
  </div>
</div>
```

## Props

### AnimatedIcon

```json props
[
  {
    "prop": "name",
    "type": "AnimatedIconName",
    "default": "—",
    "description": "Required. One of the 23 animation names — `angry`, `bye`, `cry`, `def`, `dizzy`, `drink`, `eatcake`, `excited`, `fall`, `hairflip`, `heart`, `hello`, `jump`, `lift`, `listenmusic`, `notlistenmusic`, `punching`, `question`, `rolling`, `rotate`, `shy`, `sleep`, `watch`. Type-narrowed via the exported union; `ANIMATED_ICON_NAMES` is the runtime list."
  },
  {
    "prop": "fps",
    "type": "number",
    "default": "12",
    "description": "Frames per second. The chibi cels are tuned for ~10–15 fps; outside that range the motion either stutters or floats."
  },
  {
    "prop": "playing",
    "type": "boolean",
    "default": "true",
    "description": "When `false`, the animation freezes on the current frame and resumes from the same frame when toggled back on."
  },
  {
    "prop": "loop",
    "type": "boolean",
    "default": "true",
    "description": "When `false`, the animation halts on the last frame instead of restarting at frame 0."
  },
  {
    "prop": "onComplete",
    "type": "() => void",
    "default": "—",
    "description": "Fires once on the transition into the final frame of a non-looping animation. To replay, remount the component (e.g. via a `key` change) — the prop alone is single-use per instance."
  },
  {
    "prop": "alt",
    "type": "string",
    "default": "\"\"",
    "description": "Alt text on the underlying `<img>`. Defaults to empty (treats the icon as decorative). Set explicitly when the animation conveys state to assistive tech (e.g. `\"Now playing\"` for a `listenmusic` mascot)."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the `<img>`. Use for sizing — `w-32 aspect-square` keeps the cels square; rounded surfaces or filters compose freely."
  }
]
```

## Accessibility

- Renders a single `<img>` with `alt=""` by default — purely decorative. Surrounding metadata or button labels should carry meaning when the icon is part of an interactive surface.
- For state-bearing usage (e.g. mood-of-the-player), pass an explicit `alt` so screen readers announce the change. The component re-renders the `<img>` on every frame swap; alt text doesn't churn but does get re-read on `name` changes.
- Frames are preloaded on mount via `new Image()` so the first cycle doesn't pop. There's a one-time fetch cost per animation (4–33 frames at ~40–50 KB each); the `drink` set is the heaviest at ~1.5 MB. Sequences re-render from cache thereafter.
- `prefers-reduced-motion` isn't currently honoured — the cels are core to the mascot's expressiveness and there's no obvious still-frame fallback. Revisit if a real user surface lands and someone needs it; consider freezing on `def01.png` when the media query matches.
