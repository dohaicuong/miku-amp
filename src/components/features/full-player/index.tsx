import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";
import { ActionRow } from "./action-row";
import { FullPlayerProvider, type RepeatMode } from "./context";
import { Header } from "./header";
import { Scrubber } from "./scrubber";
import { TitleBlock } from "./title-block";
import { TransportRow } from "./transport-row";

type FullPlayerProps = {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  playing: boolean;
  progressSec: number;
  durationSec: number;
  onPlayPause: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSeek?: (seconds: number) => void;
  onCollapse?: () => void;
  shuffle?: boolean;
  onToggleShuffle?: () => void;
  repeat?: RepeatMode;
  onCycleRepeat?: () => void;
  quality?: string;
  onOpenLyrics?: () => void;
  onOpenVolume?: () => void;
  className?: string;
};

// Fullscreen now-playing surface. Single-column hero-cover layout — cover
// at the top, title / artist / quality + action row + scrubber + transport
// stacked below, capped at `max-w-md` and centred so the column reads the
// same on a 360 px M500 viewport and a 4K monitor. Pure presentational;
// orchestrating the mini ↔ full transition and the action panels is the
// parent's job (Drawers for lyrics / volume).
//
// The body is composed from per-region pieces that read shared props from
// `FullPlayerContext` so the JSX reads as layout, not prop-drilling. Sub-
// components live alongside in this directory; promote any of them to
// `export` if a future surface (e.g. a "Now Playing" embed) wants to reuse
// just one piece.
export function FullPlayer({
  shuffle = false,
  repeat = "off",
  className,
  ...props
}: FullPlayerProps) {
  const { coverUrl, title, artist } = props;
  return (
    <FullPlayerProvider value={{ ...props, shuffle, repeat }}>
      {/* h-full instead of h-dvh — let the parent decide the height. AppShell
          gives it the dvh; the docs preview gives it a 640 px frame; either
          way FullPlayer fills exactly what it's handed. The dark `bg-bg`
          surface goes edge-to-edge so wide viewports don't bleed background
          around the centred column. */}
      <div className={cn("flex h-full flex-col bg-bg text-fg", className)}>
        <div className="mx-auto flex w-full max-w-md flex-1 min-h-0 flex-col px-5 pb-6">
          <Header />
          {/* Two-group stack: cover (top), title + controls (bottom). On
              narrow viewports (DAP / phone) the cover group has `flex-1
              justify-center` so it floats vertically centred in the upper
              half while the title + controls stay glued to the bottom edge
              — thumb-reachable, no top-aligned cluster. From `md:` up the
              cover group becomes `flex-none` (content height) and the body
              switches to `justify-center`, packing both groups as one
              centred cluster so a tall desktop fullscreen doesn't float
              the controls miles below the cover. */}
          <div className="flex flex-1 min-h-0 flex-col gap-8 pt-2 md:justify-center">
            <div className="flex flex-1 items-center justify-center md:flex-none">
              <CoverArt
                src={coverUrl}
                alt={`${title} — ${artist}`}
                rounded="rounded-md"
                className="mx-auto aspect-square w-full max-w-[18rem]"
              />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <TitleBlock />
              </div>
              <ActionRow />
              <Scrubber />
              <TransportRow />
            </div>
          </div>
        </div>
      </div>
    </FullPlayerProvider>
  );
}
