import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const Provider = BaseToast.Provider;
const Portal = BaseToast.Portal;

const rootBase = [
  "absolute right-0 top-0 left-auto",
  "w-[22rem] max-w-[calc(100vw-2rem)]",
  "bg-bg text-fg",
  "border border-border rounded-md",
  "border-l-4",
  "shadow-md shadow-black/30",
  "p-4 pr-8",
  "transition-all duration-300 ease-out",
  // See Button: outline-color pinned to accent in base so it doesn't
  // animate from currentColor to var(--accent) on focus.
  "outline-accent outline-offset-2",
  "focus-visible:outline-2",

  // Collapsed (default): stack-of-cards — newest in front (index 0), older
  // behind, slightly offset down + scaled down. Z-index keeps newest on top.
  "translate-y-[calc(var(--toast-index)*0.5rem)]",
  "scale-[calc(1-var(--toast-index)*0.04)]",
  "z-[calc(100-var(--toast-index))]",

  // Expanded (hover/focus on viewport): spread out vertically. Base UI sets
  // --toast-offset-y already with `px` units, so we use the value directly.
  "data-[expanded]:translate-y-[calc(var(--toast-offset-y)+var(--toast-index)*0.5rem)]",
  "data-[expanded]:scale-100",

  // Enter/exit from the right.
  "data-[starting-style]:translate-x-full data-[starting-style]:opacity-0",
  "data-[ending-style]:translate-x-full data-[ending-style]:opacity-0",

  // Follow finger/cursor during swipe; disable transition so it tracks 1:1.
  "data-[swiping]:translate-x-[var(--toast-swipe-movement-x)]",
  "data-[swiping]:transition-none",

  // Type accents — miku-amp's palette is intentionally minimal (cyan +
  // pink + neutrals), so we map the three semantic types onto what's there:
  //   info     → accent (cyan) — the standard interaction colour
  //   success  → fg-muted — neutral confirmation; no green token exists
  //   error    → highlight (pink) — the state marker, doubles as "needs
  //              attention" since it's already the playback / active hue
  "data-[type=info]:border-l-accent",
  "data-[type=success]:border-l-fg-muted",
  "data-[type=error]:border-l-highlight",
].join(" ");

const viewportBase = [
  "fixed top-4 right-4 sm:top-6 sm:right-6 z-50",
  "w-[22rem] max-w-[calc(100vw-2rem)]",
  "outline-none",
].join(" ");

type ViewportProps = ComponentProps<typeof BaseToast.Viewport>;

function Viewport({ className, ...props }: ViewportProps) {
  return (
    <BaseToast.Viewport className={cn(viewportBase, className)} {...props}>
      <ToastList />
    </BaseToast.Viewport>
  );
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <BaseToast.Root key={toast.id} toast={toast} className={rootBase}>
          {toast.title ? <BaseToast.Title className="text-style-heading-3 text-fg" /> : null}
          {toast.description ? (
            <BaseToast.Description className="text-style-caption text-fg-muted mt-1" />
          ) : null}
          {toast.actionProps ? (
            <BaseToast.Action
              className={cn(
                "mt-3 inline-flex h-9 items-center justify-center rounded-md px-4",
                "border border-accent text-accent text-sm font-medium",
                "transition-colors duration-150 cursor-pointer select-none",
                "hover:bg-accent-soft active:bg-accent-soft",
                "outline-accent outline-offset-2 focus-visible:outline-2",
              )}
            />
          ) : null}
          <BaseToast.Close
            aria-label="Close notification"
            className={cn(
              "absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-sm",
              "text-fg-muted hover:text-fg hover:bg-surface",
              "transition-colors duration-150 cursor-pointer select-none",
              "outline-accent focus-visible:outline-2",
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 2 L10 10 M10 2 L2 10" />
            </svg>
          </BaseToast.Close>
        </BaseToast.Root>
      ))}
    </>
  );
}

export const Toast = {
  Provider,
  Viewport,
  Portal,
};

export const useToast = BaseToast.useToastManager;
