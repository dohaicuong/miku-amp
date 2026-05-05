import {
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOnceIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/icon-button";
import { useFullPlayer } from "./context";

// Transport row — shuffle, prev, play/pause, next, repeat. Spread to the
// edges of the column with `justify-between` so each control gets equal
// breathing room regardless of column width.
export function TransportRow() {
  const { playing, onPlayPause, onPrev, onNext, shuffle, onToggleShuffle, repeat, onCycleRepeat } =
    useFullPlayer();
  const RepeatGlyph = repeat === "one" ? RepeatOnceIcon : RepeatIcon;
  const repeatActive = repeat !== "off";
  return (
    <div className="flex items-center justify-between gap-3">
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
    </div>
  );
}
