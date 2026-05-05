import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateVariant = "neutral" | "error";

type EmptyStateProps = {
  // Hero glyph at the top. Cloned with size 44 so callers don't have to
  // thread sizing through every call site.
  icon?: ReactElement;
  title: string;
  // Supporting copy — string for the common case, ReactNode for surfaces that
  // want inline emphasis or a help link.
  description?: ReactNode;
  // Optional call-to-action — typically a Button ("Pick folder", "Retry",
  // "Go to settings"). Rendered with a small top margin so it sits clearly
  // below the description.
  action?: ReactNode;
  // `error` tints the icon with the pink `highlight` to signal a recoverable
  // failure (permission revoked, scan failed). `neutral` keeps it muted —
  // the default for "you haven't done X yet" first-run states.
  variant?: EmptyStateVariant;
  className?: string;
};

const ICON_TONE: Record<EmptyStateVariant, string> = {
  neutral: "text-fg-subtle",
  error: "text-highlight",
};

// Centred placeholder for empty / error / first-run surfaces. Drop into any
// scroll container; the component stretches to whatever footprint the parent
// gives it and centres its column inside that. Sample callsites:
//   - "No library yet" with a folder icon + "Pick folder" button.
//   - "Permission revoked" with a warning icon + "Reconnect" button (variant="error").
//   - "No tracks match" search no-results.
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "neutral",
  className,
}: EmptyStateProps) {
  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ size?: number }>, { size: 44 })
    : icon;
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3",
        "px-6 py-12 text-center",
        className,
      )}
    >
      {sizedIcon ? (
        <span className={cn("inline-flex", ICON_TONE[variant])} aria-hidden>
          {sizedIcon}
        </span>
      ) : null}
      <h3 className="text-style-heading-3 text-fg">{title}</h3>
      {description ? (
        <p className="text-style-body max-w-prose text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
