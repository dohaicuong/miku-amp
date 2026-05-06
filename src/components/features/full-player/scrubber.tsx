import { useRef, useState } from "react";
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
  // True while the user is actively touching the slider. Driven by
  // pointerdown/up/cancel on the wrapper below, NOT by `onValueChange`
  // (which can fire without a press, see comment in onPointerCancel).
  // Used as a guard so a stranded `onValueCommitted` — fired by a stale
  // base-ui `pointerup` listener after the original press was cancelled
  // — doesn't re-seek to the last drag value when the user later taps
  // somewhere else on the page.
  const pressingRef = useRef(false);
  // True when at least one `onValueChange` has fired during the current
  // press. A click ON the track without movement is still a legitimate
  // commit (base-ui fires `onValueChange` for the trackPress reason);
  // a stranded `onValueCommitted` fired without a preceding press has
  // neither flag set and is ignored.
  const movedRef = useRef(false);

  const displaySec = dragSec ?? Math.min(progressSec, durationSec);
  const elapsed = fmtTime(displaySec);
  // Negative remaining feels right for music players — readers know "how
  // much is left" rather than "how long until it ends from start".
  const remaining = `-${fmtTime(Math.max(0, durationSec - displaySec))}`;
  return (
    <div
      className="flex flex-col gap-2"
      // Capture phase so we record press start before base-ui's
      // pointerdown handler runs on the slider Control. We don't stop
      // propagation here — events still need to reach the slider for
      // its own logic, and bubbling up past the slider is fine.
      onPointerDownCapture={() => {
        pressingRef.current = true;
        movedRef.current = false;
      }}
      // Cancel resets the press flags, but does NOT call setDragSec —
      // base-ui doesn't synthesise `onValueCommitted` on cancel, so
      // dragSec gets cleared by the next legitimate commit. This is the
      // bug we're working around: the OS occasionally cancels a slider
      // touch (notification swipe, edge-gesture, etc.); base-ui's
      // doc-level `{once: true}` pointerup listener stays armed; the
      // user's next tap anywhere then fires it with the stale last-drag
      // value. With pressingRef cleared on cancel, the stale commit hits
      // the guard below and is dropped.
      onPointerCancelCapture={() => {
        pressingRef.current = false;
        movedRef.current = false;
      }}
    >
      <Slider
        min={0}
        max={Math.max(1, durationSec)}
        value={displaySec}
        onValueChange={(v) => {
          movedRef.current = true;
          setDragSec(v);
        }}
        onValueCommitted={(v) => {
          const legit = pressingRef.current && movedRef.current;
          pressingRef.current = false;
          movedRef.current = false;
          setDragSec(null);
          if (legit) onSeek?.(v);
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
