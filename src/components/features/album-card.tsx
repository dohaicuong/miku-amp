import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { CoverArt } from "@/components/features/cover-art";

type AlbumCardProps = Omit<ComponentProps<typeof BaseButton>, "title"> & {
  title: string;
  artist: string;
  // Cover image URL. Falls back to CoverArt's missing-art placeholder.
  coverUrl?: string;
  // Optional release year, rendered next to the artist on its own pass.
  year?: number;
  // Project the card onto a different element (typically a router `<Link/>`).
  // Defaults to a native `<button>`.
  render?: ReactElement;
};

// Cover-art-led album tile for grid views (library, recently added, search
// results). No card chrome by default — the cover does the visual heavy
// lifting and metadata sits below per Apple Music / Spotify convention.
//
// Whole tile is the click target; hover lightens the title to accent so the
// affordance reads at a glance without a frame around the cover.
export function AlbumCard({
  title,
  artist,
  coverUrl,
  year,
  className,
  render,
  nativeButton,
  ...props
}: AlbumCardProps) {
  const subtitle = year ? `${artist} · ${year}` : artist;
  return (
    <BaseButton
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(
        "group flex flex-col gap-3 text-left",
        "cursor-pointer select-none",
        "outline-accent outline-offset-2 rounded-md",
        "focus-visible:outline-2",
        className,
      )}
      {...props}
    >
      <CoverArt
        src={coverUrl}
        alt={`${title} — ${artist}`}
        className="aspect-square w-full transition-opacity group-hover:opacity-90"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-style-track-title text-fg line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </span>
        <span className="text-style-track-meta text-fg-muted truncate">{subtitle}</span>
      </div>
    </BaseButton>
  );
}
