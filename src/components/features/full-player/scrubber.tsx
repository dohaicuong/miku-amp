import { useState } from "react";
import { Slider } from "@/components/primitives/slider";
import { useFullPlayer } from "./context";
import { fmtTime } from "./fmt-time";

// Slider plus elapsed/remaining time labels. Owns the drag-override state
// internally — while dragging, the thumb (and both readouts) track the
// pointer in real time; on drop the override clears and `onSeek` pushes
// the new position upstream so the parent's `progressSec` takes over again.
export function Scrubber() {
  const { progressSec, durationSec, onSeek } = useFullPlayer();
  const [dragSec, setDragSec] = useState<number | null>(null);
  const displaySec = dragSec ?? Math.min(progressSec, durationSec);
  const elapsed = fmtTime(displaySec);
  // Negative remaining feels right for music players — readers know "how
  // much is left" rather than "how long until it ends from start".
  const remaining = `-${fmtTime(Math.max(0, durationSec - displaySec))}`;
  return (
    <div className="flex flex-col gap-2">
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
    </div>
  );
}
