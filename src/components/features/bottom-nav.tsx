import { Button as BaseButton } from "@base-ui/react/button";
import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type BottomNavProps = {
  children: ReactNode;
  className?: string;
  // Visible label for assistive tech. Defaults to "Primary" — override only
  // when the page mounts more than one nav landmark and they need to be
  // disambiguated.
  "aria-label"?: string;
};

// Persistent primary navigation for the M500 portrait viewport. Pure
// presentational — positioning (typically `fixed inset-x-0 bottom-0`) is the
// AppShell's job so the bar can layer above route content. Pad-bottom picks up
// `env(safe-area-inset-bottom)` so it doesn't collide with home-indicator
// gestures on devices that report one; on the M500 the inset is 0 and the
// rule is a no-op.
export function BottomNav({
  children,
  className,
  "aria-label": ariaLabel = "Primary",
}: BottomNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-stretch border-t border-border bg-bg",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className,
      )}
    >
      {children}
    </nav>
  );
}

type ItemProps = Omit<ComponentProps<typeof BaseButton>, "children" | "title"> & {
  // Phosphor icon (or any element accepting a `size` number prop). Cloned to
  // inject size 22 — keeps the icon row visually consistent without the caller
  // having to thread sizing through every invocation.
  icon: ReactElement;
  // Visible label, rendered as the second line under the icon.
  label: string;
  // Project the item onto a router Link (or any custom element). The
  // TanStack Router `Link` flips `data-status="active"` when the route
  // matches; the styling below picks that up to tint the active item accent.
  render?: ReactElement;
};

function Item({ icon, label, className, render, nativeButton, ...props }: ItemProps) {
  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ size?: number }>, { size: 22 })
    : icon;
  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1",
        // ≥44 px touch height per the M500 density target. Horizontal padding
        // keeps the icon+label cluster from kissing the divider when only 5
        // items share the bar.
        "min-h-14 px-2 py-2",
        "cursor-pointer select-none transition-colors duration-150",
        "text-fg-muted hover:text-fg",
        "outline-accent -outline-offset-2 focus-visible:outline-2",
        // Active route — TanStack Router's Link sets data-status="active"
        // automatically. Falls back to aria-current="page" so consumers using
        // a non-router Item (e.g. controlled tab state) can still drive the
        // active tint by hand.
        "data-[status=active]:text-accent aria-[current=page]:text-accent",
        className,
      )}
      {...props}
    >
      <span aria-hidden>{sizedIcon}</span>
      <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
    </BaseButton>
  );
}

BottomNav.Item = Item;
