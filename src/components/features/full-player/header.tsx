import { CaretDownIcon } from "@phosphor-icons/react";
import { IconButton } from "@/components/primitives/icon-button";
import { useFullPlayer } from "./context";

export function Header() {
  const { album, onCollapse } = useFullPlayer();
  return (
    <header className="flex shrink-0 items-center justify-between py-4">
      <IconButton variant="ghost" size="sm" aria-label="Collapse player" onClick={onCollapse}>
        <CaretDownIcon weight="bold" />
      </IconButton>
      <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
        <span className="text-style-eyebrow text-fg-muted">Now Playing</span>
        {album ? <span className="text-style-caption truncate text-fg-subtle">{album}</span> : null}
      </div>
      {/* Spacer matching the collapse IconButton so the eyebrow stays centred. */}
      <span aria-hidden className="h-9 w-9 shrink-0" />
    </header>
  );
}
