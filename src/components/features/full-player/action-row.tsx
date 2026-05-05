import { QuotesIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { IconButton } from "@/components/primitives/icon-button";
import { useFullPlayer } from "./context";

// Secondary actions — sit between the title block and the scrubber. Returns
// null when no handler is wired so the spacing stays tight on a stripped-down
// player. Future siblings (EQ / filters) will join this row.
export function ActionRow() {
  const { onOpenLyrics, onOpenVolume } = useFullPlayer();
  if (!onOpenLyrics && !onOpenVolume) return null;
  return (
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
      {onOpenVolume ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Adjust volume"
          onClick={onOpenVolume}
          className="text-fg-muted hover:text-fg"
        >
          <SpeakerHighIcon weight="bold" />
        </IconButton>
      ) : null}
    </div>
  );
}
