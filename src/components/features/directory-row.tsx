import { Button as BaseButton } from "@base-ui/react/button";
import { CaretRightIcon, FolderIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";

type DirectoryRowProps = Omit<ComponentProps<typeof BaseButton>, "title"> & {
  // Folder name. Truncated to one line.
  name: string;
  // Recursive count of audio files under this folder. Reads as "12 tracks"
  // (or "1 track") under the name. Pass 0 explicitly for an empty folder.
  trackCount: number;
  // When provided, replaces the folder icon with a cover thumbnail (the
  // existing CoverArt component, so missing / failed images fall back to
  // the music-note placeholder). Use for browse-by-album surfaces where
  // the row is a directory but the visual is the artwork. Any value —
  // including an empty string — switches the row to cover mode; pass
  // nothing at all to keep the default folder icon.
  coverUrl?: string;
  // Project the row onto a different element (typically a router `<Link/>`)
  // — same pattern as AlbumCard / ArtistCard. Defaults to a native `<button>`.
  render?: ReactElement;
};

// List row used by the library's Folders view to drill into a subdirectory.
// Folder icon (cyan-tinted) on the left, two-line meta in the middle (name
// + recursive track count), chevron on the right cueing the drill action.
// The whole row is a single click target — single tab stop, single hit area.
export function DirectoryRow({
  name,
  trackCount,
  coverUrl,
  className,
  render,
  nativeButton,
  ...props
}: DirectoryRowProps) {
  const hasCover = coverUrl !== undefined;
  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        "transition-colors hover:bg-surface",
        // -offset so the focus ring sits inside the row instead of clipping
        // when the row lives in a bordered list container.
        "outline-accent -outline-offset-2 focus-visible:outline-2",
        "cursor-pointer select-none",
        className,
      )}
      {...props}
    >
      {hasCover ? (
        <CoverArt
          src={coverUrl || undefined}
          alt={name}
          rounded="rounded-sm"
          className="aspect-square w-12 shrink-0"
        />
      ) : (
        <FolderIcon size={20} weight="duotone" className="shrink-0 text-accent" aria-hidden />
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <span className="text-style-body text-fg truncate">{name}</span>
        <span className="text-style-caption text-fg-subtle tabular-nums">
          {trackCount} {trackCount === 1 ? "track" : "tracks"}
        </span>
      </div>
      <CaretRightIcon size={14} weight="bold" className="shrink-0 text-fg-muted" aria-hidden />
    </BaseButton>
  );
}
