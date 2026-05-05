import { useState } from "react";
import {
  CaretDownIcon,
  PauseIcon,
  PlayIcon,
  QuotesIcon,
  RepeatIcon,
  RepeatOnceIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";
import { IconButton } from "@/components/primitives/icon-button";
import { Slider } from "@/components/primitives/slider";

type RepeatMode = "off" | "all" | "one";

type FullPlayerProps = {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  // Whether playback is currently active. Drives the play/pause icon swap.
  playing: boolean;
  // Current playback position in seconds. Drives the scrubber + elapsed time.
  progressSec: number;
  // Total track length in seconds. Drives the scrubber max + remaining time.
  durationSec: number;
  onPlayPause: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  // Fires when the user releases the scrubber thumb at a new position.
  onSeek?: (seconds: number) => void;
  // Tap the collapse chevron to return to MiniPlayer.
  onCollapse?: () => void;
  shuffle?: boolean;
  onToggleShuffle?: () => void;
  // "off" hides the dot; "all" / "one" show it. "one" swaps the icon to
  // the per-track repeat glyph so the state reads at a glance.
  repeat?: RepeatMode;
  onCycleRepeat?: () => void;
  // Optional tech-spec line under album, e.g. "FLAC · 24/96".
  quality?: string;
  // Tap the lyrics button to surface the lyric panel. When omitted the button
  // is hidden — same pattern as the other optional callbacks. Future
  // siblings (volume / EQ / filters) will join this row.
  onOpenLyrics?: () => void;
  className?: string;
};

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Fullscreen now-playing surface. Hero-cover layout tuned for the M500's
// portrait viewport — top collapse bar, square cover (~280 px), title /
// artist / album, scrubber, transport row.
export function FullPlayer({
  title,
  artist,
  album,
  coverUrl,
  playing,
  progressSec,
  durationSec,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onCollapse,
  shuffle = false,
  onToggleShuffle,
  repeat = "off",
  onCycleRepeat,
  quality,
  onOpenLyrics,
  className,
}: FullPlayerProps) {
  // While the user is dragging the scrubber, the slider is "controlled" by
  // this local override so the thumb (and the elapsed/remaining readouts)
  // track the pointer in real time. On drop the override clears and `onSeek`
  // pushes the new position upstream — the parent's `progressSec` then takes
  // over again on the next render.
  const [dragSec, setDragSec] = useState<number | null>(null);
  const displaySec = dragSec ?? Math.min(progressSec, durationSec);

  const elapsed = fmtTime(displaySec);
  // Negative remaining feels right for music players — readers know "how
  // much is left" rather than "how long until it ends from start".
  const remaining = `-${fmtTime(Math.max(0, durationSec - displaySec))}`;
  const RepeatGlyph = repeat === "one" ? RepeatOnceIcon : RepeatIcon;
  const repeatActive = repeat !== "off";

  // Shared content extracted as JSX fragments so the mobile and desktop
  // body trees don't duplicate the title/scrubber/transport markup. The two
  // body trees themselves stay separate (@3xl:hidden ↔ hidden @3xl:flex) so
  // each has its own clean flex distribution — cross-breakpoint flex math
  // gets weird fast.
  const titleBlock = (
    <>
      <span className="text-style-section-title text-fg line-clamp-2">{title}</span>
      <span className="text-style-lead truncate text-fg-muted">{artist}</span>
      {quality ? (
        <span className="text-style-caption text-fg-subtle tabular-nums">{quality}</span>
      ) : null}
    </>
  );

  const scrubberBlock = (
    <>
      <Slider
        min={0}
        max={Math.max(1, durationSec)}
        value={displaySec}
        onValueChange={setDragSec}
        onValueCommitted={(v) => {
          setDragSec(null);
          onSeek?.(v);
        }}
        aria-label="Seek track position"
      />
      <div className="flex items-center justify-between text-style-time text-fg-muted">
        <span>{elapsed}</span>
        <span>{remaining}</span>
      </div>
    </>
  );

  // Secondary actions — sit between the title block and the scrubber in both
  // layouts. Hidden entirely when no handler is wired so the spacing stays
  // tight on a stripped-down player. Volume / EQ / filters will join here
  // later as additional optional siblings.
  const hasActions = Boolean(onOpenLyrics);
  const actionRow = hasActions ? (
    <div className="flex items-center justify-center gap-2">
      {onOpenLyrics ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Show lyrics"
          onClick={onOpenLyrics}
          className="text-fg-muted hover:text-fg"
        >
          <QuotesIcon weight="bold" />
        </IconButton>
      ) : null}
    </div>
  ) : null;

  const transportRow = (
    <>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
        aria-pressed={shuffle}
        onClick={onToggleShuffle}
        className={cn(shuffle ? "text-accent" : "text-fg-muted hover:text-fg")}
      >
        <ShuffleIcon weight="bold" />
      </IconButton>
      <IconButton variant="ghost" size="md" aria-label="Previous track" onClick={onPrev}>
        <SkipBackIcon weight="fill" />
      </IconButton>
      {/* Big play/pause — primary affordance on the screen. */}
      <IconButton
        variant="primary"
        size="lg"
        aria-label={playing ? "Pause" : "Play"}
        onClick={onPlayPause}
        className="h-14 w-14 rounded-full"
      >
        {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
      </IconButton>
      <IconButton variant="ghost" size="md" aria-label="Next track" onClick={onNext}>
        <SkipForwardIcon weight="fill" />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={`Repeat ${repeat}`}
        aria-pressed={repeatActive}
        onClick={onCycleRepeat}
        className={cn(repeatActive ? "text-accent" : "text-fg-muted hover:text-fg")}
      >
        <RepeatGlyph weight="bold" />
      </IconButton>
    </>
  );

  return (
    // h-full instead of h-dvh — let the parent decide the height. AppShell
    // gives it the dvh; the docs preview gives it a 640 px frame; either
    // way FullPlayer fills exactly what it's handed.
    //
    // @container so the portrait ↔ hero switch tracks our own width, not the
    // page viewport. Without this, a 360 px-wide FullPlayer dropped into a
    // wide page (e.g. the docs preview frame) still resolves md: against the
    // viewport and renders the desktop hero squeezed into 360 px.
    <div
      className={cn(
        "@container flex h-full flex-col bg-bg text-fg",
        // Tight horizontal padding on the M500's 360 px viewport; relax on
        // wider container widths where the layout has room to breathe.
        "px-5 pb-6 @md:px-8 @3xl:px-12",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between py-4">
        <IconButton variant="ghost" size="sm" aria-label="Collapse player" onClick={onCollapse}>
          <CaretDownIcon weight="bold" />
        </IconButton>
        <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
          <span className="text-style-eyebrow text-fg-muted">Now Playing</span>
          {album ? (
            <span className="text-style-caption truncate text-fg-subtle">{album}</span>
          ) : null}
        </div>
        {/* Spacer matching the collapse IconButton so the eyebrow stays centred. */}
        <span aria-hidden className="h-9 w-9 shrink-0" />
      </header>

      {/* Mobile portrait body — single column, cover at top, scrubber +
          transport pushed to bottom by a flex spacer. */}
      <div className="flex flex-1 min-h-0 flex-col pt-2 @3xl:hidden">
        <CoverArt
          src={coverUrl}
          alt={`${title} — ${artist}`}
          rounded="rounded-md"
          className="mx-auto aspect-square w-full max-w-[18rem]"
        />
        <div className="mt-6 flex flex-col items-center gap-1 text-center">{titleBlock}</div>
        <div aria-hidden className="min-h-4 flex-1" />
        <div className="flex flex-col gap-6">
          {actionRow}
          <div className="flex flex-col gap-2">{scrubberBlock}</div>
          <div className="flex items-center justify-between gap-3">{transportRow}</div>
        </div>
      </div>

      {/* Desktop hero body (@3xl+ container) — two-column hero, cover left,
          controls stacked right, both columns vertically centred inside
          max-w-5xl. Cover takes 50% (capped at 30rem) so the right column
          never gets squeezed below half on a narrow desktop preview. */}
      <div className="hidden flex-1 min-h-0 @3xl:mx-auto @3xl:flex @3xl:w-full @3xl:max-w-5xl @3xl:items-center @3xl:gap-12 @3xl:pt-2">
        <div className="flex flex-1 justify-center">
          <CoverArt
            src={coverUrl}
            alt={`${title} — ${artist}`}
            rounded="rounded-md"
            className="aspect-square w-full max-w-[30rem]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-1 text-center">{titleBlock}</div>
          {actionRow}
          <div className="flex flex-col gap-2">{scrubberBlock}</div>
          <div className="flex items-center justify-center gap-6">{transportRow}</div>
        </div>
      </div>
    </div>
  );
}
