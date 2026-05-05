import { MusicNoteIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CoverArtProps = Omit<ComponentProps<"div">, "children"> & {
  // Image URL. When absent, renders a placeholder with a music-note glyph.
  src?: string;
  // Required for the <img> alt; falls back to "" on the placeholder so
  // screen readers skip purely decorative cover-less surfaces.
  alt: string;
  // Optional rounding override. The default is `rounded-md`; pass
  // `rounded-full` for circular avatars, `rounded-sm` for thumbnails.
  rounded?: string;
};

// Cover art surface used by every album/track/artist tile + row in the app.
// Centralises the missing-art fallback so a track without embedded artwork
// looks the same everywhere instead of each consumer rolling its own.
//
// Sizing is the caller's responsibility — pass `className="aspect-square w-40"`
// or whatever fits the surface. CoverArt itself is shape-agnostic.
export function CoverArt({ src, alt, className, rounded = "rounded-md", ...props }: CoverArtProps) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface", rounded, className)} {...props}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      // aria-hidden so the empty alt text doesn't add noise to AT — surrounding
      // metadata (title + artist) carries the meaning.
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-surface text-fg-subtle",
        rounded,
        className,
      )}
      {...props}
    >
      <MusicNoteIcon weight="light" className="h-1/3 w-1/3" />
    </div>
  );
}
