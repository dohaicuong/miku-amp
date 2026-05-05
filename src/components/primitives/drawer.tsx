import { Dialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Side = "right" | "left" | "bottom";

type PopupProps = ComponentProps<typeof Dialog.Popup> & {
  side?: Side;
};

const backdropBase = [
  "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
  "transition-opacity duration-300 ease-out",
  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
].join(" ");

const popupBase = [
  // Shared shell — the per-side block below sets positioning, sizing, edge
  // border, and slide direction since side drawers and bottom sheets have
  // different shape conventions (full-height panel vs. content-driven sheet).
  "fixed z-50 flex flex-col gap-4 p-6",
  "bg-bg text-fg",
  "shadow-2xl shadow-black/40",
  "transition-transform duration-300 ease-out",
  "focus-visible:outline-none",
].join(" ");

const popupSides: Record<Side, string> = {
  right: [
    "top-0 right-0 h-dvh w-96 max-w-[90vw]",
    "border-l border-border",
    "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  ].join(" "),
  left: [
    "top-0 left-0 h-dvh w-96 max-w-[90vw]",
    "border-r border-border",
    "data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  ].join(" "),
  bottom: [
    // Bottom-anchored, full width, content-driven height capped at 85 vh so
    // a long action list doesn't push past the top edge. Rounded top corners
    // signal "this is a sheet that came from below" without needing a drag
    // handle pip in the static-modal case.
    "bottom-0 inset-x-0 max-h-[85vh] rounded-t-lg",
    "border-t border-border",
    "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
  ].join(" "),
};

function Root(props: ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root {...props} />;
}

function Trigger(props: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger {...props} />;
}

function Portal(props: ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal {...props} />;
}

function Backdrop({ className, ...props }: ComponentProps<typeof Dialog.Backdrop>) {
  return <Dialog.Backdrop className={cn(backdropBase, className)} {...props} />;
}

function Popup({ className, side = "right", ...props }: PopupProps) {
  return <Dialog.Popup className={cn(popupBase, popupSides[side], className)} {...props} />;
}

function Title({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cn("text-style-heading-2 text-fg", className)} {...props} />;
}

function Description({ className, ...props }: ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description className={cn("text-style-lead text-fg-muted", className)} {...props} />
  );
}

const closeBase = [
  "inline-flex items-center justify-center self-end",
  "h-8 px-4 rounded-sm text-sm",
  "font-sans font-medium",
  "text-fg hover:bg-surface active:bg-surface",
  "transition-colors duration-150 cursor-pointer select-none",
  // See Button: outline-color pinned to accent in base so it doesn't
  // animate from currentColor to var(--accent) on focus.
  "outline-accent outline-offset-2",
  "focus-visible:outline-2",
].join(" ");

function Close({ className, children, ...props }: ComponentProps<typeof Dialog.Close>) {
  return (
    <Dialog.Close className={cn(closeBase, className)} {...props}>
      {children ?? "Close"}
    </Dialog.Close>
  );
}

export const Drawer = Object.assign(Root, {
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close,
});
