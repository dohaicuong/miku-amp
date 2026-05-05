import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// Orientation-aware sizing via the `data-orientation` attribute that
// base-ui sets on every slider part. Horizontal: a 24px-tall row that runs
// the parent's width. Vertical: a 24px-wide column that fills the parent's
// height — vertical mode requires the parent to set the height (typical for
// EQ bands: a fixed-height row of sliders).
const rootCls = [
  "relative flex touch-none select-none",
  "data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:items-center",
  "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-6 data-[orientation=vertical]:justify-center",
].join(" ");

const controlCls = [
  "relative flex",
  "data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:items-center",
  "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-6 data-[orientation=vertical]:justify-center",
].join(" ");

const trackCls = [
  "relative overflow-hidden rounded-full bg-border",
  "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full",
  "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
].join(" ");

// Indicator anchors at the start of the track on horizontal (left → right)
// and at the bottom on vertical (bottom → top), matching the convention
// where higher-on-screen reads as "more" — natural for EQ band gain,
// volume, and other DAW-style upright faders.
const indicatorCls = [
  "absolute rounded-full bg-accent",
  "data-[orientation=horizontal]:inset-y-0 data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:h-full",
  "data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:w-full",
].join(" ");

const thumbCls = [
  "block h-4 w-4 rounded-full bg-bg",
  "border-2 border-accent",
  "transition-[transform,box-shadow] duration-150 ease-out",
  "cursor-grab",
  "hover:scale-110",
  // base-ui renders the visible thumb as a wrapper around a hidden focusable
  // input — the focus state lives on the child, so we match it with
  // `:has(:focus-visible)`. Stack two box-shadows: a 2px bg-coloured "gap"
  // pushing outward (so the halo doesn't merge with the thumb's accent
  // border), then a solid 3px accent halo around that. Arbitrary values
  // bypass Tailwind's `@theme inline` substitution, so we reference
  // `var(--accent)` / `var(--bg)` directly.
  "outline-none has-[:focus-visible]:shadow-[0_0_0_2px_var(--bg),0_0_0_5px_var(--accent)]",
  "data-[dragging]:cursor-grabbing data-[dragging]:scale-110",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
].join(" ");

function Root({ className, ...props }: ComponentProps<typeof BaseSlider.Root<number>>) {
  return <BaseSlider.Root className={cn(rootCls, className)} {...props} />;
}

function Control({ className, ...props }: ComponentProps<typeof BaseSlider.Control>) {
  return <BaseSlider.Control className={cn(controlCls, className)} {...props} />;
}

function Track({ className, ...props }: ComponentProps<typeof BaseSlider.Track>) {
  return <BaseSlider.Track className={cn(trackCls, className)} {...props} />;
}

function Indicator({ className, ...props }: ComponentProps<typeof BaseSlider.Indicator>) {
  return <BaseSlider.Indicator className={cn(indicatorCls, className)} {...props} />;
}

function Thumb({ className, ...props }: ComponentProps<typeof BaseSlider.Thumb>) {
  return <BaseSlider.Thumb className={cn(thumbCls, className)} {...props} />;
}

type SliderProps = ComponentProps<typeof BaseSlider.Root<number>> & {
  "aria-label"?: string;
};

// Default wrapper — renders the full Root → Control → Track → Indicator →
// Thumb tree. Use this for the standard scrubber / volume / setting slider.
// For custom anatomy (e.g. a buffered-progress overlay on the audio scrubber)
// reach for `Slider.Root` + the compound parts directly.
function SliderImpl({ className, "aria-label": ariaLabel, ...props }: SliderProps) {
  return (
    <Root className={className} {...props}>
      <Control>
        <Track>
          <Indicator />
        </Track>
        <Thumb getAriaLabel={ariaLabel ? () => ariaLabel : undefined} />
      </Control>
    </Root>
  );
}

export const Slider = Object.assign(SliderImpl, {
  Root,
  Control,
  Track,
  Indicator,
  Thumb,
});
