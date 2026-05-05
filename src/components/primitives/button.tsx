import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: Variant;
  size?: Size;
};

const base = [
  "inline-flex items-center justify-center gap-2",
  "font-sans font-medium",
  "transition-colors duration-150",
  "cursor-pointer select-none",
  // outline-color pinned to accent always so `transition-colors` doesn't
  // animate outline-color from currentColor → var(--accent) on focus —
  // would flash the wrong colour for a frame on dark surfaces.
  "outline-accent outline-offset-2",
  "focus-visible:outline-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
].join(" ");

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-active",
  secondary: "border border-accent text-accent hover:bg-accent-soft active:bg-accent-soft",
  outline: "border border-border text-fg hover:bg-surface active:bg-surface",
  ghost: "text-fg hover:bg-surface active:bg-surface",
};

const sizes: Record<Size, string> = {
  // Touch targets — `md` lands at 44px, the iOS/Android minimum, suitable for
  // the M500's primary actions. `sm` is for toolbar density; `lg` for hero
  // CTAs where the action is the page's whole reason to exist (Play All).
  sm: "h-9 px-4 text-sm rounded-md",
  md: "h-11 px-5 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-md",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  render,
  nativeButton,
  onKeyDown,
  ...props
}: ButtonProps) {
  const isNative = nativeButton ?? !render;

  return (
    <BaseButton
      render={render}
      nativeButton={isNative}
      onKeyDown={(event) => {
        // When rendered as an anchor (e.g. render={<Link/>}), Space doesn't
        // activate the element by default — only Enter does. Mirror native
        // <button> semantics so keyboard users get the same affordance.
        if (!isNative && event.key === " " && !event.defaultPrevented) {
          event.preventDefault();
          event.currentTarget.click();
        }
        onKeyDown?.(event);
      }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
