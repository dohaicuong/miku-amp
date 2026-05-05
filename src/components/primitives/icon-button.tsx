import { Button as BaseButton } from "@base-ui/react/button";
import { cloneElement, isValidElement, type ComponentProps, type ReactElement } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type IconButtonProps = Omit<ComponentProps<typeof BaseButton>, "aria-label"> & {
  variant?: Variant;
  size?: Size;
  // Required — there's no visible text to fall back on for screen readers.
  "aria-label": string;
};

const base = [
  "inline-flex items-center justify-center",
  "transition-colors duration-150",
  "cursor-pointer select-none",
  // outline-color pinned to accent always so `transition-colors` doesn't
  // animate outline-color from currentColor → var(--accent) on focus.
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

// Square — width matches height. Heights mirror Button so an IconButton sits
// comfortably alongside a Button at the same size: sm 36 px, md 44 px (the
// M500 touch target), lg 48 px.
const sizes: Record<Size, string> = {
  sm: "h-9 w-9 rounded-md",
  md: "h-11 w-11 rounded-md",
  lg: "h-12 w-12 rounded-md",
};

const iconSizes: Record<Size, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function IconButton({
  className,
  variant = "ghost",
  size = "md",
  children,
  render,
  nativeButton,
  ...props
}: IconButtonProps) {
  // Clone the icon child to inject the size matching the button footprint —
  // callers don't have to thread it through manually.
  const icon = isValidElement(children)
    ? cloneElement(children as ReactElement<{ size?: number }>, { size: iconSizes[size] })
    : children;

  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
    </BaseButton>
  );
}
