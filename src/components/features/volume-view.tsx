import { ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/primitives/button";
import { IconButton } from "@/components/primitives/icon-button";
import { Knob } from "@/components/primitives/knob";

type VolumeViewProps = {
  // 0–100 master volume. Controlled — the parent owns it so the value
  // survives panel close/reopen.
  volume: number;
  onVolumeChange: (value: number) => void;
  // -100 → +100 stereo balance. 0 = centred, negative = left-biased,
  // positive = right-biased. Controlled like volume.
  balance: number;
  onBalanceChange: (value: number) => void;
  // When provided, renders a close X in the header. Used when the panel is
  // surfaced as the FullPlayer's wide-layout right column — the panel must
  // ship its own close UI since FullPlayer doesn't render one. Drawer-based
  // narrow surfaces typically omit this (Drawer's backdrop / Esc handles
  // dismiss).
  onClose?: () => void;
  className?: string;
};

// Full-panel volume / balance surface. Mirrors LyricView's shape — header
// strip on top, body fills the remainder — so the two cohabit cleanly when
// both surface as drawers from FullPlayer's action row. Two big knobs
// instead of horizontal sliders to suit a thumb-driven DAP and to read as
// a deliberate audiophile control rather than a generic media-player HUD.
export function VolumeView({
  volume,
  onVolumeChange,
  balance,
  onBalanceChange,
  onClose,
  className,
}: VolumeViewProps) {
  return (
    <div className={cn("flex h-full flex-col bg-bg text-fg", className)}>
      <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-style-eyebrow text-fg-muted">Volume</span>
        {onClose ? (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close volume"
            onClick={onClose}
            className="text-fg-muted hover:text-fg"
          >
            <XIcon weight="bold" />
          </IconButton>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5">
        <div className="flex items-center justify-center gap-16">
          <KnobCell label="Volume">
            <Knob
              value={volume}
              onValueChange={onVolumeChange}
              min={0}
              max={100}
              step={1}
              size="lg"
              showValue
              formatValue={(v) => `${Math.round(v)}`}
              aria-label="Volume"
            />
          </KnobCell>
          <KnobCell label="Balance">
            <Knob
              value={balance}
              onValueChange={onBalanceChange}
              min={-100}
              max={100}
              step={1}
              bipolar
              size="lg"
              showValue
              formatValue={formatBalance}
              aria-label="Balance"
            />
          </KnobCell>
        </div>
        {/* Resets balance to centre only — volume is left alone so a reset
            mid-playback can't slam the level up unexpectedly. Disabled when
            balance is already centred so the button doesn't read as "do
            something" when there's nothing to do. */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBalanceChange(0)}
          disabled={balance === 0}
          aria-label="Reset balance to centre"
        >
          <ArrowCounterClockwiseIcon weight="bold" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function KnobCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="text-style-caption text-fg-muted">{label}</span>
    </div>
  );
}

// `C` for centre, `L<n>` / `R<n>` for off-centre. Reads natively as a
// stereo-balance label rather than a plain signed number.
function formatBalance(v: number): string {
  const n = Math.round(v);
  if (n === 0) return "C";
  return n < 0 ? `L${-n}` : `R${n}`;
}
