import {
  useCallback,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { cn } from "@/lib/cn";

type KnobSize = "sm" | "md" | "lg";

type KnobProps = {
  // Single-value, mirrors the linear `Slider` callsites in this codebase. If
  // `value` is omitted the component still renders (treated as `defaultValue`),
  // so the knob can be used uncontrolled inside a form alongside `name`.
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  // Fires once on pointer-up after a drag. Keyboard / wheel / double-tap fire
  // both `onValueChange` and `onValueCommitted` immediately — the change is
  // already discrete in those cases, so there's nothing meaningful to debounce.
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  // When true, fill arc grows outward from the centre of the sweep instead of
  // from the start. Pair with a symmetric range (e.g. -100 → +100) for pan /
  // balance / detuning controls.
  bipolar?: boolean;
  size?: KnobSize;
  // Render the current value at the centre of the knob.
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  // Form integration — when set, a hidden input shadows the live value so the
  // knob serializes with surrounding `<form>` submissions.
  name?: string;
  form?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// Sweep is a 270° arc with the gap centred at the bottom (6 o'clock). The
// "ui angle" convention used here is: 0° points up (12 o'clock), positive
// angles rotate clockwise.
const TRACK_START = -135;
const TRACK_END = 135;
const TRACK_SWEEP = TRACK_END - TRACK_START; // 270

const SIZE_PX: Record<KnobSize, number> = { sm: 40, md: 56, lg: 72 };

// Drag distance for a full-range traversal, in CSS pixels. Picked by feel —
// 200 px is roughly a comfortable thumb arc on a phone, ~half a desktop
// trackpad swipe. Shift slows it for fine adjustments.
const DRAG_FULL_RANGE_PX = 200;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function snap(v: number, step: number, min: number) {
  if (!step || step <= 0) return v;
  return Math.round((v - min) / step) * step + min;
}

function polar(cx: number, cy: number, r: number, uiAngleDeg: number) {
  // SVG has y pointing down and angle 0 along +x. Translating ui angle (0 = up)
  // to SVG: subtract 90° before converting to radians.
  const rad = ((uiAngleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startUiAngle: number, endUiAngle: number) {
  const start = polar(cx, cy, r, startUiAngle);
  const end = polar(cx, cy, r, endUiAngle);
  const sweep = endUiAngle - startUiAngle;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
}

// Tailwind class for the centre-value text. Sizes are gentle — at sm the
// readout is intentionally tight; the showValue option is best at md+.
const VALUE_TEXT_SIZE: Record<KnobSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export function Knob({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  bipolar = false,
  size = "md",
  showValue = false,
  formatValue,
  disabled = false,
  name,
  form,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: KnobProps) {
  // Resolve the working value. Uncontrolled mode tracks `defaultValue`
  // through a ref so the parent can integrate with forms via `name` without
  // also wiring a state hook.
  const fallback = defaultValue ?? (bipolar ? (min + max) / 2 : min);
  const uncontrolledRef = useRef<number>(fallback);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as number) : uncontrolledRef.current;

  // Reset target for double-tap. Explicit defaultValue wins; otherwise centre
  // for bipolar (returns balance to 0) or min for unipolar.
  const resetValue = defaultValue ?? (bipolar ? (min + max) / 2 : min);

  const ratio = max === min ? 0 : (current - min) / (max - min);
  const angle = TRACK_START + ratio * TRACK_SWEEP;

  const trackD = arcPath(50, 50, 44, TRACK_START, TRACK_END);

  // Fill: bipolar grows outward from the centre angle so a value at the
  // midpoint shows no fill (clear "neutral" reading); unipolar grows from
  // the start of the track in the conventional way.
  const centerAngle = TRACK_START + 0.5 * TRACK_SWEEP; // 0
  let fillStart: number;
  let fillEnd: number;
  if (bipolar) {
    fillStart = Math.min(centerAngle, angle);
    fillEnd = Math.max(centerAngle, angle);
  } else {
    fillStart = TRACK_START;
    fillEnd = angle;
  }
  const fillD = fillStart === fillEnd ? null : arcPath(50, 50, 44, fillStart, fillEnd);

  const notchOuter = polar(50, 50, 32, angle);
  const notchInner = polar(50, 50, 22, angle);

  const dragRef = useRef<{ startY: number; startValue: number; lastValue: number } | null>(null);

  const apply = useCallback(
    (next: number) => {
      const clamped = clamp(snap(next, step, min), min, max);
      if (!isControlled) uncontrolledRef.current = clamped;
      onValueChange?.(clamped);
      return clamped;
    },
    [isControlled, max, min, onValueChange, step],
  );

  const commit = useCallback(
    (next: number) => {
      const clamped = clamp(snap(next, step, min), min, max);
      onValueCommitted?.(clamped);
    },
    [max, min, onValueCommitted, step],
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startValue: current, lastValue: current };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (disabled || !drag) return;
    const deltaY = e.clientY - drag.startY;
    const sensitivity = e.shiftKey ? 0.2 : 1;
    const valueDelta = (-deltaY / DRAG_FULL_RANGE_PX) * (max - min) * sensitivity;
    drag.lastValue = apply(drag.startValue + valueDelta);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    commit(drag.lastValue);
    dragRef.current = null;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next = current;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = current + step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = current - step;
        break;
      case "PageUp":
        next = current + step * 10;
        break;
      case "PageDown":
        next = current - step * 10;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    const committed = apply(next);
    commit(committed);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    const sensitivity = e.shiftKey ? 0.2 : 1;
    const delta = (-e.deltaY / DRAG_FULL_RANGE_PX) * (max - min) * sensitivity;
    const committed = apply(current + delta);
    commit(committed);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    const committed = apply(resetValue);
    commit(committed);
  };

  const px = SIZE_PX[size];
  const valueText = formatValue ? formatValue(current) : String(Math.round(current));
  const wrapStyle: CSSProperties = { width: px, height: px, touchAction: "none" };

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={formatValue ? formatValue(current) : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-orientation="vertical"
      aria-disabled={disabled || undefined}
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center",
        "rounded-full outline-accent outline-offset-2 focus-visible:outline-2",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={wrapStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <path
          d={trackD}
          fill="none"
          className="stroke-border"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {fillD ? (
          <path
            d={fillD}
            fill="none"
            className="stroke-accent"
            strokeWidth={6}
            strokeLinecap="round"
          />
        ) : null}
        <circle cx={50} cy={50} r={34} className="fill-surface" />
        <line
          x1={notchInner.x}
          y1={notchInner.y}
          x2={notchOuter.x}
          y2={notchOuter.y}
          className="stroke-fg"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      {showValue ? (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "tabular-nums text-fg",
            VALUE_TEXT_SIZE[size],
          )}
        >
          {valueText}
        </span>
      ) : null}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={current}
          form={form}
          disabled={disabled || undefined}
        />
      ) : null}
    </div>
  );
}
