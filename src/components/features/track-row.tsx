import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";

type TrackRowProps = Omit<ComponentProps<typeof BaseButton>, "title"> & {
  title: string;
  artist: string;
  // Optional album appended to the metadata line as `<artist> · <album>`.
  album?: string;
  // Cover thumbnail. Falls back to the music-note placeholder.
  coverUrl?: string;
  // Pre-formatted duration ("3:47"). Rendered on the tech-specs line below
  // the artist row, joined with format / bitrate / bit depth via ` · `. DAP
  // audience cares about codec and depth, so they get equal billing with the
  // running time.
  duration?: string;
  // Pre-formatted codec / container ("FLAC", "MP3", "AAC", "WAV"). Tertiary.
  format?: string;
  // Pre-formatted bitrate ("1411 kbps", "320 kbps"). Tertiary.
  bitrate?: string;
  // Pre-formatted PCM bit depth ("16-bit", "24-bit", "32-bit"). Tertiary.
  // Conventionally paired with sample rate as "24/96"; if you want the
  // combined notation, pre-format as "24/96 kHz" and pass via bitDepth.
  bitDepth?: string;
  // Mark as currently playing — row gets the pink `highlight-soft` background
  // and the title fills with `text-highlight` so the row stands out in a long
  // list without competing with hover/focus affordances.
  playing?: boolean;
  // Project the row onto a different element (typically a router `<Link/>`).
  render?: ReactElement;
};

// Compact horizontal list-row for library track lists, queue, search results.
// Tuned for the M500's portrait viewport — three-line metadata stack on the
// left of a 56 px cover thumb. The whole row is one button; track-action UX
// (play / queue / more-options) lives elsewhere for now.
export function TrackRow({
  title,
  artist,
  album,
  coverUrl,
  duration,
  format,
  bitrate,
  bitDepth,
  playing = false,
  className,
  render,
  nativeButton,
  ...props
}: TrackRowProps) {
  const subtitle = album ? `${artist} · ${album}` : artist;
  // Tech-specs line: duration · format · bitrate · bitDepth (any subset).
  // Hidden when none provided so simpler surfaces (search-suggestion strip,
  // etc.) keep the compact two-line layout.
  const techParts = [duration, format, bitrate, bitDepth].filter(Boolean);
  const tech = techParts.length > 0 ? techParts.join(" · ") : null;

  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-left",
        "border-b border-border last:border-b-0",
        "cursor-pointer select-none transition-colors duration-150",
        "outline-accent -outline-offset-2 focus-visible:outline-2",
        playing ? "bg-highlight-soft" : "hover:bg-surface",
        className,
      )}
      {...props}
    >
      <CoverArt
        src={coverUrl}
        alt={`${title} — ${artist}`}
        rounded="rounded-sm"
        className="aspect-square h-14 w-14 shrink-0"
      />
      <div className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span
          className={cn("text-style-track-title truncate", playing ? "text-highlight" : "text-fg")}
        >
          {title}
        </span>
        <span className="text-style-track-meta text-fg-muted truncate">{subtitle}</span>
        {tech ? (
          <span className="text-style-caption text-fg-subtle truncate tabular-nums">{tech}</span>
        ) : null}
      </div>
    </BaseButton>
  );
}
