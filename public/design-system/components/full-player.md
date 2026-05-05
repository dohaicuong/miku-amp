```scope
FullPlayer
LyricView
VolumeView
Drawer
asset
```

# Full Player

The fullscreen now-playing surface. Single-column hero-cover layout — top collapse bar, square cover, title / artist / album block, secondary-action row (lyrics + volume so far; EQ / filters will join later), scrubber, transport row. The column is capped at `max-w-md` and centred so the same shape reads cleanly on the M500's 360 px viewport and a 4K monitor. Pure presentational; orchestrating the mini ↔ full transition and the action panels is the parent's job (Drawers for lyrics + volume).

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(125);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="World Is Mine"
        artist="supercell feat. Hatsune Miku"
        album="World Is Mine"
        coverUrl={asset("wallpaper.jpg")}
        playing={playing}
        progressSec={progressSec}
        durationSec={248}
        quality="FLAC · 16/44.1"
        shuffle={shuffle}
        repeat={repeat}
        onPlayPause={() => setPlaying((p) => !p)}
        onSeek={setProgressSec}
        onCollapse={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() => {
          setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
        }}
        onOpenLyrics={() => {}}
      />
    </div>
  );
};
```

## Examples

### With action panels

`onOpenLyrics` and `onOpenVolume` emit on tap — `FullPlayer` itself doesn't render the panels, the parent decides. Both panels surface as bottom Drawers regardless of viewport: `LyricView` gets a near-full sheet (`h-[85vh]`), `VolumeView` a shorter one since two knobs need less room. Tapping a timed lyric line seeks the player and dismisses the lyrics drawer so the wiring feels live.

```tsx preview
() => {
  const [playing, setPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(20);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volume, setVolume] = useState(45);
  const [balance, setBalance] = useState(0);
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
    <>
      <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
        <FullPlayer
          title="Tell Your World"
          artist="livetune feat. Hatsune Miku"
          album="Re:Dial"
          coverUrl={asset("wallpaper.jpg")}
          playing={playing}
          progressSec={progressSec}
          durationSec={265}
          quality="FLAC · 24/96"
          onPlayPause={() => setPlaying((p) => !p)}
          onSeek={setProgressSec}
          onCollapse={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onOpenLyrics={() => setLyricsOpen(true)}
          onOpenVolume={() => setVolumeOpen(true)}
        />
      </div>
      <Drawer open={lyricsOpen} onOpenChange={setLyricsOpen}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Popup side="bottom" className="h-[85vh] p-0 gap-0">
            <LyricView
              title="Tell Your World"
              artist="livetune"
              album="Re:Dial"
              coverUrl={asset("wallpaper.jpg")}
              duration="4:25"
              format="FLAC"
              bitrate="3072 kbps"
              bitDepth="24-bit"
              lyrics={lines}
              currentTimeSec={progressSec}
              onSeek={(s) => {
                setProgressSec(s);
                setLyricsOpen(false);
              }}
            />
          </Drawer.Popup>
        </Drawer.Portal>
      </Drawer>
      <Drawer open={volumeOpen} onOpenChange={setVolumeOpen}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Popup side="bottom" className="h-[60vh] p-0 gap-0">
            <VolumeView
              volume={volume}
              onVolumeChange={setVolume}
              balance={balance}
              onBalanceChange={setBalance}
            />
          </Drawer.Popup>
        </Drawer.Portal>
      </Drawer>
    </>
  );
};
```

### Shuffle + repeat states

Active shuffle / repeat read as `text-accent` (cyan) on the trailing icons; off-state stays muted so the mode-on signal is colour alone.

```tsx preview
() => {
  const [shuffle, setShuffle] = useState(true);
  const [repeat, setRepeat] = useState("one");
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="Romeo and Cinderella"
        artist="doriko feat. Hatsune Miku"
        album="kiss"
        coverUrl={asset("wallpaper.jpg")}
        playing
        progressSec={210}
        durationSec={325}
        quality="MP3 · 320 kbps"
        shuffle={shuffle}
        repeat={repeat}
        onPlayPause={() => {}}
        onSeek={() => {}}
        onCollapse={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() => {
          setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
        }}
      />
    </div>
  );
};
```

### Without optional metadata

`album`, `quality`, `shuffle`, and `repeat` are all optional. Without them, the corresponding lines and toggles disappear and the layout reflows.

```tsx preview
() => {
  const [playing, setPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(8);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <FullPlayer
        title="Untitled rip — track 03"
        artist="(unknown artist)"
        playing={playing}
        progressSec={progressSec}
        durationSec={180}
        onPlayPause={() => setPlaying((p) => !p)}
        onSeek={setProgressSec}
        onCollapse={() => {}}
      />
    </div>
  );
};
```

## Props

### FullPlayer

```json props
[
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Track title. Renders as section-title text, clamped to two lines."
  },
  {
    "prop": "artist",
    "type": "string",
    "default": "—",
    "description": "Track artist. Renders as a lead-style line directly under the title."
  },
  {
    "prop": "album",
    "type": "string",
    "default": "—",
    "description": "Optional album label. When set, surfaces as a tertiary caption in the top bar."
  },
  {
    "prop": "coverUrl",
    "type": "string",
    "default": "—",
    "description": "Cover image URL. Falls back to the CoverArt placeholder at the same square footprint."
  },
  {
    "prop": "playing",
    "type": "boolean",
    "default": "—",
    "description": "Whether playback is active. Drives the play/pause icon swap."
  },
  {
    "prop": "progressSec",
    "type": "number",
    "default": "—",
    "description": "Current playback position in seconds. Drives the scrubber + elapsed time."
  },
  {
    "prop": "durationSec",
    "type": "number",
    "default": "—",
    "description": "Total track length in seconds. Drives the scrubber max + remaining time."
  },
  {
    "prop": "onPlayPause",
    "type": "() => void",
    "default": "—",
    "description": "Required. Fires when the big play/pause button is tapped."
  },
  {
    "prop": "onPrev",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the previous-track button is tapped."
  },
  {
    "prop": "onNext",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the next-track button is tapped."
  },
  {
    "prop": "onSeek",
    "type": "(seconds: number) => void",
    "default": "—",
    "description": "Fires when the user releases the scrubber thumb at a new position. Called via Slider's `onValueCommitted`, not on every drag-frame, to avoid thrashing the audio engine."
  },
  {
    "prop": "onCollapse",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the collapse chevron is tapped. Wire to whatever returns to MiniPlayer."
  },
  {
    "prop": "shuffle",
    "type": "boolean",
    "default": "false",
    "description": "Active shuffle state. When true, the shuffle icon tints to `text-accent`."
  },
  {
    "prop": "onToggleShuffle",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the shuffle button is tapped."
  },
  {
    "prop": "repeat",
    "type": "\"off\" | \"all\" | \"one\"",
    "default": "\"off\"",
    "description": "Repeat mode. `all` and `one` tint the icon to `text-accent`; `one` swaps the glyph to the per-track repeat variant."
  },
  {
    "prop": "onCycleRepeat",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the repeat button is tapped. Parent advances `off` → `all` → `one` → `off`."
  },
  {
    "prop": "quality",
    "type": "string",
    "default": "—",
    "description": "Optional tech-spec line under album (e.g. \"FLAC · 24/96\", \"MP3 · 320 kbps\"). Tabular-nums for clean digit rhythm."
  },
  {
    "prop": "onOpenLyrics",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the lyrics action button is tapped. Wire to whatever surfaces the LyricView (full-screen modal on portrait; right-column swap on the @3xl hero). Button is hidden when omitted."
  },
  {
    "prop": "onOpenVolume",
    "type": "() => void",
    "default": "—",
    "description": "Fires when the volume action button is tapped. Same hide-when-omitted pattern as `onOpenLyrics`. Canonical surface is the VolumeView in a bottom Drawer."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer flex column. Use for layout overrides at the AppShell level."
  }
]
```

## Accessibility

- The scrubber is a real `Slider` with `aria-label="Seek track position"` and a min/max/value range, so screen-reader users hear the position and can step through with arrow keys.
- All transport controls are IconButtons with explicit `aria-label`s — Play / Pause label swaps based on `playing`.
- Shuffle and repeat carry `aria-pressed` (toggle semantics) so AT users hear the active state without needing the colour cue.
- The big play/pause button is sized `h-14 w-14 rounded-full` to be the visually dominant affordance — matches the muscle memory most users bring from native player apps.
