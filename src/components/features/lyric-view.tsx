import { Button as BaseButton } from "@base-ui/react/button";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/icon-button";
import { TrackRow } from "@/components/features/track-row";

// One line of timed lyrics. `timeSec` is the absolute track position at which
// the line becomes the active line; the line stays active until the next
// line's timestamp (or the track ends).
export type LyricLine = { timeSec: number; text: string };

// Two supported shapes:
//  - `string` — plain block of text with `\n` line breaks (no timing).
//  - `LyricLine[]` — timed lines, ascending `timeSec`, used for the active-
//    line highlight that follows playback.
export type Lyrics = string | LyricLine[];

type LyricViewProps = {
  // Track header — passed straight through to the embedded TrackRow.
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  duration?: string;
  format?: string;
  bitrate?: string;
  bitDepth?: string;

  lyrics: Lyrics;

  // Required for timed lyrics; ignored for the plain-text variant. Drives
  // which line is active and the auto-scroll target.
  currentTimeSec?: number;

  // Tap a timed line to seek there. Lines stay non-interactive when omitted
  // (still readable, no hover/focus chrome). Ignored for plain-text.
  onSeek?: (seconds: number) => void;

  // When provided, renders a close X in the header. Used when the panel is
  // surfaced as the FullPlayer's wide-layout right column — the panel must
  // ship its own close UI since FullPlayer doesn't render one. Drawer-based
  // narrow surfaces typically omit this (Drawer's backdrop / Esc handles
  // dismiss).
  onClose?: () => void;

  className?: string;
};

// Header-plus-lyrics surface. The TrackRow on top gives the page-level
// context (which track these lyrics belong to); the body below renders
// either the plain text or the timed lyric stream.
export function LyricView({
  title,
  artist,
  album,
  coverUrl,
  duration,
  format,
  bitrate,
  bitDepth,
  lyrics,
  currentTimeSec = 0,
  onSeek,
  onClose,
  className,
}: LyricViewProps) {
  return (
    <div className={cn("flex h-full flex-col bg-bg text-fg", className)}>
      {/* Wrapping div carries the divider — TrackRow's own border-b is
          stripped by `last:border-b-0` when it's the only child. The close
          X (when provided) sits as a flex sibling so it doesn't compete with
          TrackRow's own click target. */}
      <div className="shrink-0 flex items-center border-b border-border">
        <div className="min-w-0 flex-1">
          <TrackRow
            title={title}
            artist={artist}
            album={album}
            coverUrl={coverUrl}
            duration={duration}
            format={format}
            bitrate={bitrate}
            bitDepth={bitDepth}
          />
        </div>
        {onClose ? (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close lyrics"
            onClick={onClose}
            className="mr-3 shrink-0 text-fg-muted hover:text-fg"
          >
            <XIcon weight="bold" />
          </IconButton>
        ) : null}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scroll-style">
        {Array.isArray(lyrics) ? (
          <TimedLyrics lines={lyrics} currentTimeSec={currentTimeSec} onSeek={onSeek} />
        ) : (
          <PlainLyrics text={lyrics} />
        )}
      </div>
    </div>
  );
}

function PlainLyrics({ text }: { text: string }) {
  if (!text.trim()) return <EmptyState />;
  // Split on blank lines so verse breaks render as visible gaps; preserve
  // single newlines inside each block via `whitespace-pre-line` so an LRC-
  // less plain-text dump still reads as a song, not a paragraph wall.
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="flex flex-col gap-4 px-5 py-6 text-style-lead text-fg">
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-line">
          {block}
        </p>
      ))}
    </div>
  );
}

function TimedLyrics({
  lines,
  currentTimeSec,
  onSeek,
}: {
  lines: LyricLine[];
  currentTimeSec: number;
  onSeek?: (seconds: number) => void;
}) {
  const activeIndex = findActiveLineIndex(lines, currentTimeSec);
  const activeRef = useRef<HTMLLIElement>(null);

  // Re-centre the active line as it advances. `block: "center"` keeps the
  // current line in the middle of the viewport so a couple of upcoming
  // lines are always visible — matches Apple Music's lyric pane behaviour.
  // The effect only fires when the index changes, so passive renders (e.g.
  // a `currentTimeSec` tick within the same line) don't re-scroll.
  useEffect(() => {
    if (activeIndex < 0) return;
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex]);

  if (lines.length === 0) return <EmptyState />;

  return (
    <ol className="flex flex-col gap-3 px-5 py-6">
      {lines.map((line, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        const text = line.text || " "; // nbsp keeps blank lines visible
        const tone = isActive ? "text-fg font-medium" : isPast ? "text-fg-subtle" : "text-fg-muted";
        return (
          <li key={i} ref={isActive ? activeRef : undefined}>
            {onSeek ? (
              <BaseButton
                onClick={() => onSeek(line.timeSec)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block w-full -mx-2 rounded-sm px-2 py-1 text-left",
                  "cursor-pointer select-none transition-colors",
                  "outline-accent -outline-offset-2 focus-visible:outline-2",
                  "hover:bg-surface",
                )}
              >
                <span className={cn("text-style-lead transition-colors", tone)}>{text}</span>
              </BaseButton>
            ) : (
              <div aria-current={isActive ? "true" : undefined} className="-mx-2 px-2 py-1">
                <span className={cn("text-style-lead transition-colors", tone)}>{text}</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-5 py-6">
      <span className="text-style-body text-fg-subtle">No lyrics available</span>
    </div>
  );
}

// Last line whose timestamp has elapsed. -1 if we're still before the first
// line — caller treats that as "no active line" so all lines render in the
// future-line tone.
function findActiveLineIndex(lines: LyricLine[], t: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].timeSec <= t) idx = i;
    else break;
  }
  return idx;
}
