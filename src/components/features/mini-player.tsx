import { Button as BaseButton } from "@base-ui/react/button";
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";
import { IconButton } from "@/components/primitives/icon-button";

type MiniPlayerProps = {
  title: string;
  artist: string;
  coverUrl?: string;
  // Whether playback is currently active. Drives the play/pause icon swap.
  playing: boolean;
  // Optional 0–1 fraction. Drives the thin highlight strip at the top of
  // the bar. Pink because the strip is a state marker (where you are in the
  // current track), not an interactive scrubber — that lives in FullPlayer.
  progress?: number;
  onPlayPause: () => void;
  // Tap the cover + metadata block to expand to FullPlayer. The transport
  // controls are siblings so they don't bubble through.
  onExpand?: () => void;
  // Optional prev/next on wider viewports (`sm:` and up). On the M500's
  // narrow portrait the play button alone keeps the bar uncluttered; expand
  // for prev/next via FullPlayer.
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
};

// Bottom floating bar — the player's "always there" state. Renders position-
// agnostic; caller wraps it for fixed-bottom mounting in the AppShell.
export function MiniPlayer({
  title,
  artist,
  coverUrl,
  playing,
  progress,
  onPlayPause,
  onExpand,
  onPrev,
  onNext,
  className,
}: MiniPlayerProps) {
  // Clamp progress to 0–1 so an out-of-range value can't blow past the
  // strip's bounds. Hidden when undefined.
  const progressPct =
    progress === undefined ? null : `${Math.max(0, Math.min(1, progress)) * 100}%`;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 overflow-hidden",
        "bg-surface border-t border-border",
        // md+ floats as a rounded card with full border + shadow. The caller
        // owns the actual positioning via `className` (fixed inset-x-0
        // bottom-0 on mobile; anchored bottom-right on md+ with max-w-sm);
        // the visual chrome here just keeps the shape correct at each width.
        "md:rounded-md md:border md:shadow-lg md:shadow-black/40",
        className,
      )}
    >
      {progressPct !== null ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-bg"
        >
          <div className="h-full bg-highlight" style={{ width: progressPct }} />
        </div>
      ) : null}

      <BaseButton
        onClick={onExpand}
        aria-label="Expand player"
        className={cn(
          "flex flex-1 min-w-0 items-center gap-3 text-left",
          "cursor-pointer select-none rounded-sm",
          "outline-accent -outline-offset-2 focus-visible:outline-2",
        )}
      >
        <CoverArt
          src={coverUrl}
          alt={`${title} — ${artist}`}
          rounded="rounded-sm"
          className="aspect-square h-12 w-12 shrink-0"
        />
        <div className="flex flex-1 min-w-0 flex-col gap-0.5">
          <span className="text-style-track-title truncate text-fg">{title}</span>
          <span className="text-style-track-meta truncate text-fg-muted">{artist}</span>
        </div>
      </BaseButton>

      {onPrev ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous track"
          onClick={onPrev}
          className="hidden sm:inline-flex"
        >
          <SkipBackIcon weight="fill" />
        </IconButton>
      ) : null}

      <IconButton
        variant="ghost"
        size="md"
        aria-label={playing ? "Pause" : "Play"}
        onClick={onPlayPause}
      >
        {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
      </IconButton>

      {onNext ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next track"
          onClick={onNext}
          className="hidden sm:inline-flex"
        >
          <SkipForwardIcon weight="fill" />
        </IconButton>
      ) : null}
    </div>
  );
}
