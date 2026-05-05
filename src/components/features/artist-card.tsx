import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";

type ArtistCardProps = Omit<ComponentProps<typeof BaseButton>, "title"> & {
  name: string;
  // Portrait / avatar URL. Falls back to the music-note placeholder.
  imageUrl?: string;
  // Optional secondary line — typically "<n> albums" or "<n> tracks".
  subtitle?: string;
  // Project the card onto a different element (typically a router `<Link/>`).
  // Defaults to a native `<button>`.
  render?: ReactElement;
};

// Circular-avatar tile for the artist grid. Same vertical-stack rhythm as
// AlbumCard but with a round portrait and centred metadata so artists read as
// "people" rather than as another album shelf.
export function ArtistCard({
  name,
  imageUrl,
  subtitle,
  className,
  render,
  nativeButton,
  ...props
}: ArtistCardProps) {
  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(
        "group flex flex-col items-center gap-3 text-center",
        "cursor-pointer select-none",
        "outline-accent outline-offset-2 rounded-md",
        "focus-visible:outline-2",
        className,
      )}
      {...props}
    >
      <CoverArt
        src={imageUrl}
        alt={name}
        rounded="rounded-full"
        className="aspect-square w-full transition-opacity group-hover:opacity-90"
      />
      <div className="flex flex-col gap-0.5 min-w-0 w-full">
        <span className="text-style-track-title text-fg line-clamp-2 group-hover:text-accent transition-colors">
          {name}
        </span>
        {subtitle ? (
          <span className="text-style-track-meta text-fg-muted truncate">{subtitle}</span>
        ) : null}
      </div>
    </BaseButton>
  );
}
