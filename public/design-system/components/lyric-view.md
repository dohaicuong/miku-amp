```scope
LyricView
IconButton
PlayIcon
PauseIcon
asset
```

# Lyric View

Track context on top, lyrics underneath. Two lyric formats: a plain text block, or a timed `LyricLine[]` that follows playback with an active-line highlight. Pure presentational — the parent owns playback state and feeds `currentTimeSec` plus an optional `onSeek` for tap-to-jump.

```tsx preview
() => {
  const [t, setT] = useState(18);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => (v + 0.5) % 60), 500);
    return () => clearInterval(id);
  }, [playing]);
  const lines = [
    { timeSec: 0, text: "" },
    { timeSec: 4, text: "どこまでも続く 空の青さに" },
    { timeSec: 9, text: "ぽっかり浮かんだ 君の声" },
    { timeSec: 14, text: "" },
    { timeSec: 16, text: "Tell your world" },
    { timeSec: 20, text: "声を聞かせてよ 君の言葉で" },
    { timeSec: 26, text: "Tell your world" },
    { timeSec: 30, text: "心開いて ほら 受け止めるから" },
    { timeSec: 36, text: "" },
    { timeSec: 40, text: "繋がりたい 伝えたい" },
    { timeSec: 46, text: "もう一人じゃないから" },
  ];
  return (
    <div className="mx-auto w-[360px] flex flex-col gap-3">
      <div className="border border-border rounded-md overflow-hidden h-[520px]">
        <LyricView
          title="Tell Your World"
          artist="livetune"
          album="Re:Dial"
          coverUrl={asset("wallpaper.png")}
          duration="4:25"
          format="FLAC"
          bitrate="3072 kbps"
          bitDepth="24-bit"
          lyrics={lines}
          currentTimeSec={t}
          onSeek={setT}
        />
      </div>
      <div className="flex justify-center">
        <IconButton
          variant="primary"
          size="lg"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
          className="h-12 w-12 rounded-full"
        >
          {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </IconButton>
      </div>
    </div>
  );
};
```

## Examples

### Timed lyrics (live highlight)

Pass `LyricLine[]` and a `currentTimeSec` — the view marks the line whose timestamp last elapsed as active (`text-fg`, medium weight), past lines fade to `text-fg-subtle`, future lines stay `text-fg-muted`. The active line auto-scrolls to the centre as it advances. Pass `onSeek` to make every line tappable; without it the lines render as static read-only rows.

```tsx preview
() => {
  const [t, setT] = useState(12);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => (v + 0.5) % 50), 500);
    return () => clearInterval(id);
  }, [playing]);
  const lines = [
    { timeSec: 0, text: "プロローグ" },
    { timeSec: 4, text: "歌いだす その先には" },
    { timeSec: 8, text: "見たことのない景色が広がる" },
    { timeSec: 12, text: "" },
    { timeSec: 14, text: "サビ" },
    { timeSec: 16, text: "ロミオとシンデレラに" },
    { timeSec: 20, text: "なれないことくらい知ってる" },
    { timeSec: 26, text: "それでも歌う 君のために" },
    { timeSec: 32, text: "" },
    { timeSec: 34, text: "終わらない夜の中で" },
    { timeSec: 40, text: "二人だけの世界を作ろう" },
  ];
  return (
    <div className="mx-auto w-[360px] flex flex-col gap-3">
      <div className="border border-border rounded-md overflow-hidden h-[480px]">
        <LyricView
          title="Romeo and Cinderella"
          artist="doriko"
          album="kiss"
          coverUrl={asset("wallpaper.png")}
          duration="5:25"
          format="MP3"
          bitrate="320 kbps"
          lyrics={lines}
          currentTimeSec={t}
          onSeek={setT}
        />
      </div>
      <div className="flex justify-center">
        <IconButton
          variant="primary"
          size="lg"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
          className="h-12 w-12 rounded-full"
        >
          {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </IconButton>
      </div>
    </div>
  );
};
```

### Read-only timed lyrics

Drop `onSeek` and the lines render as plain text — still timed, still highlighting the active line, but no hover affordance and no click target. Use this when seek isn't appropriate (e.g. when surfacing lyrics inside a non-playback context like a search result preview).

```tsx preview
() => {
  const [t, setT] = useState(20);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => (v + 0.5) % 40), 500);
    return () => clearInterval(id);
  }, [playing]);
  const lines = [
    { timeSec: 0, text: "Yesterday's the past, tomorrow's the future" },
    { timeSec: 6, text: "But today is a gift" },
    { timeSec: 12, text: "That's why it's called the present" },
    { timeSec: 18, text: "" },
    { timeSec: 20, text: "World is mine, oh world is mine" },
    { timeSec: 26, text: "I'm the princess of this world" },
    { timeSec: 32, text: "Oh world is mine, world is mine" },
  ];
  return (
    <div className="mx-auto w-[360px] flex flex-col gap-3">
      <div className="border border-border rounded-md overflow-hidden h-[480px]">
        <LyricView
          title="World Is Mine"
          artist="supercell"
          album="World Is Mine"
          coverUrl={asset("wallpaper.png")}
          duration="4:08"
          format="FLAC"
          bitDepth="16-bit"
          lyrics={lines}
          currentTimeSec={t}
        />
      </div>
      <div className="flex justify-center">
        <IconButton
          variant="primary"
          size="lg"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
          className="h-12 w-12 rounded-full"
        >
          {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </IconButton>
      </div>
    </div>
  );
};
```

### Plain text

When the source has no timing data, pass a single string. Single newlines become line breaks; blank lines become verse-break gaps. No active-line highlight, no scroll-to-current — the body reads as a static page.

```tsx preview
() => {
  const text = `Senbonzakura yoru ni magirete
Kimi no koe mo todokanai yo

Koko wa utage hagane no ori
Sono dantoudai de mioroshite

Sanzen sekai tokoyo no yami
Nageku uta mo kikoenai yo

Seijaku saji ni inori wo komete
Hisameku no wa anata no koe`;
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[480px]">
      <LyricView
        title="Senbonzakura"
        artist="Kurousa-P"
        coverUrl={asset("wallpaper.png")}
        duration="3:48"
        format="MP3"
        bitrate="256 kbps"
        lyrics={text}
      />
    </div>
  );
};
```

### Empty state

`""` for plain text or `[]` for timed both render the same fallback line — keeps every track-detail surface a fixed shape regardless of whether the scrape found anything.

```tsx preview
<div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[320px]">
  <LyricView
    title="Untitled rip — track 03"
    artist="(unknown artist)"
    duration="3:34"
    format="FLAC"
    bitrate="1411 kbps"
    lyrics=""
  />
</div>
```

## Props

### LyricView

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Track title. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Track artist. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "album",
    "type": "string",
    "default": "—",
    "description": "Optional album. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover thumbnail. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "duration",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted duration. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "format",
    "type": "string",
    "default": "—",
    "description": "Codec / container label. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "bitrate",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted bitrate. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "bitDepth",
    "type": "string",
    "default": "—",
    "description": "Pre-formatted bit depth. Forwarded to the embedded TrackRow."
  },
  {
    "prop": "lyrics",
    "type": "string | LyricLine[]",
    "default": "—",
    "description": "Either a plain-text block (single newlines split lines, blank lines split verses) or an array of `{ timeSec, text }` lines for the timed-highlight variant."
  },
  {
    "prop": "currentTimeSec",
    "type": "number",
    "default": "0",
    "description": "Current playback position. Drives the active-line highlight and auto-scroll for the timed variant. Ignored when `lyrics` is a string."
  },
  {
    "prop": "onSeek",
    "type": "(seconds: number) => void",
    "default": "—",
    "description": "Tap a timed line to seek there. When omitted, lines render as static read-only text. Ignored when `lyrics` is a string."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer flex column. Use for layout overrides at the AppShell level."
  }
]
```

### LyricLine

```json props
[
  {
    "prop": "timeSec",
    "type": "number",
    "default": "—",
    "description": "Absolute track position (in seconds) at which this line becomes active. Lines should be sorted ascending."
  },
  {
    "prop": "text",
    "type": "string",
    "default": "—",
    "description": "The line itself. Empty strings render as blank verse-break rows so an instrumental break still keeps its place in the timeline."
  }
]
```

## Accessibility

- The active line carries `aria-current="true"` so screen readers can announce it as the current item even when colour is the only visual cue.
- Tappable timed lines are real Base UI buttons with the standard `outline-accent` focus ring; static lines render as plain `<div>`s and aren't tab stops.
- Auto-scroll uses `scroll-behavior: smooth` and only fires when the active index actually changes — passive `currentTimeSec` ticks within the same line don't re-scroll the pane.
- The TrackRow at the top is the same primitive used in lists, so it carries the same focus + label semantics.
