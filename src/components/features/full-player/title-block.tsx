import { useFullPlayer } from "./context";

// Title + artist + optional quality. Rendered inside a flex column at the
// callsite (portrait centres it under the cover; wide hero centres it at the
// top of the right column), so this component itself is layout-agnostic.
export function TitleBlock() {
  const { title, artist, quality } = useFullPlayer();
  return (
    <>
      <span className="text-style-section-title text-fg line-clamp-2">{title}</span>
      <span className="text-style-lead truncate text-fg-muted">{artist}</span>
      {quality ? (
        <span className="text-style-caption text-fg-subtle tabular-nums">{quality}</span>
      ) : null}
    </>
  );
}
