import { createContext, useContext, type ReactNode } from "react";

export type RepeatMode = "off" | "all" | "one";

export type FullPlayerContextValue = {
  // The shared bundle every sub-component (Header, TitleBlock, ActionRow,
  // Scrubber, TransportRow) reads from. Mirrors FullPlayer's public props
  // 1:1 except for the layout-only `className` which lives on the wrapper
  // and never leaves it.
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
  shuffle: boolean;
  onToggleShuffle?: () => void;
  // "off" hides the dot; "all" / "one" show it. "one" swaps the icon to the
  // per-track repeat glyph so the state reads at a glance.
  repeat: RepeatMode;
  onCycleRepeat?: () => void;
  // Optional tech-spec line under album, e.g. "FLAC · 24/96".
  quality?: string;
  // Tap the lyrics button to surface the lyric panel. When omitted the button
  // is hidden — same pattern as the other optional callbacks. Future siblings
  // (EQ / filters) will join this row.
  onOpenLyrics?: () => void;
  // Tap the volume button to surface the volume dock. Same hide-when-omitted
  // pattern as `onOpenLyrics`.
  onOpenVolume?: () => void;
};

const FullPlayerContext = createContext<FullPlayerContextValue | null>(null);

export function FullPlayerProvider({
  value,
  children,
}: {
  value: FullPlayerContextValue;
  children: ReactNode;
}) {
  return <FullPlayerContext.Provider value={value}>{children}</FullPlayerContext.Provider>;
}

// Throws when called outside the FullPlayer subtree — every sub-component
// here lives inside the Provider mounted by `<FullPlayer>`, so a missing
// context is a programmer error, not a runtime fallback to handle.
export function useFullPlayer(): FullPlayerContextValue {
  const ctx = useContext(FullPlayerContext);
  if (!ctx) {
    throw new Error("useFullPlayer must be used inside a <FullPlayer> tree");
  }
  return ctx;
}
