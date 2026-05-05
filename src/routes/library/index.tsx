import { CaretRightIcon, HouseIcon, MusicNotesIcon } from "@phosphor-icons/react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlbumCard } from "@/components/features/album-card";
import { DirectoryRow } from "@/components/features/directory-row";
import { TrackRow } from "@/components/features/track-row";
import { useLibraryHandle } from "@/lib/library-handle";
import { walkLibrary, findFolder, findTrackByPath, type FolderNode } from "@/lib/library";
import { usePlayer } from "@/lib/player-context";
import { cn } from "@/lib/cn";

type Search = { path?: string };

export const Route = createFileRoute("/library/")({
  // Persist the current folder in the URL as `?path=Folder/Subfolder`. Lets
  // the browser back/forward buttons walk up the tree, lets a refresh land
  // back where the user was, and lets a folder be deep-linked. Folder names
  // can't contain `/` (filesystem rule), so the slash separator is safe.
  validateSearch: (search: Record<string, unknown>): Search => ({
    path: typeof search.path === "string" ? search.path : undefined,
  }),
  component: FoldersView,
});

function FoldersView() {
  const { handle } = useLibraryHandle();
  const player = usePlayer();
  const { path: pathParam } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [root, setRoot] = useState<FolderNode | null>(null);
  const [scanning, setScanning] = useState(true);

  // Path segments derived from the URL. Empty array = library root.
  const path = useMemo(() => (pathParam ? pathParam.split("/").filter(Boolean) : []), [pathParam]);

  // Pushing a new path goes through navigate so back/forward work. We omit
  // `path` from the search entirely when at the root — keeps the URL clean
  // (`/library` instead of `/library?path=`).
  const setPath = (next: string[]) => {
    void navigate({
      search: (prev) => ({ ...prev, path: next.length > 0 ? next.join("/") : undefined }),
    });
  };

  // Run the scan once when the handle lands. The handle is stable for the
  // session (set on landing, never replaced unless the user re-picks), so
  // a single useEffect dependency is enough — no need for cancellation.
  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setScanning(true);
    void walkLibrary(handle).then((tree) => {
      if (cancelled) return;
      setRoot(tree);
      setScanning(false);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const here = useMemo(() => (root ? findFolder(root, path) : null), [root, path]);

  // One-shot playback restore from the URL — fires once after the scan
  // completes if there's a `?track=...` param and the player isn't already
  // holding a track. The `restoredRef` guard prevents re-firing if the
  // URL changes later (the player itself rewrites `?track=` on track
  // change, which would otherwise loop us).
  //
  // We also resolve the track's parent folder and pass `queue: folder.tracks`
  // so prev / next + repeat-all + auto-advance keep working across the
  // refresh — without this, the restore would set a single-track queue
  // and every "what's next" path would land on the same song.
  const rootSearch = useSearch({ from: "__root__" });
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (!root || player.current) return;
    if (!rootSearch.track) return;
    const track = findTrackByPath(root, rootSearch.track);
    if (!track) return;
    restoredRef.current = true;
    // `track.folderPath` includes the root's own name as its first segment;
    // strip it before walking from root via subfolders.
    const folder = findFolder(root, track.folderPath.slice(1));
    const queue = folder?.tracks ?? [track];
    void player.playTrack(track, { seekTo: rootSearch.t, queue });
  }, [root, rootSearch.track, rootSearch.t, player]);

  if (scanning || !root) return <ScanningState />;
  if (!here) {
    // Stale path no longer resolves (shouldn't happen in practice, but
    // covers a future re-scan racing the navigation). Reset to root.
    return <EmptyState onReset={() => setPath([])} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-fg">
      <header className="shrink-0 border-b border-border px-5 py-4">
        <Breadcrumbs root={root} path={path} onNavigate={setPath} />
      </header>
      <div
        data-scroll-restoration-id="library-body"
        className={cn(
          "flex-1 overflow-y-auto scroll-style",
          // Keep the last row clear of the floating MiniPlayer when
          // playback is active. ~6rem covers the bar's height (mobile
          // full-bleed) plus a little breathing room; on desktop the
          // floating card is offset from the edge anyway, so the same
          // padding just adds harmless empty space at the bottom right.
          player.current ? "pb-24" : null,
        )}
      >
        {here.folders.length === 0 && here.tracks.length === 0 ? (
          <FolderEmpty />
        ) : here.tracks.length > 0 ? (
          // Album mode — current folder has audio. Tracks are the primary
          // content; subfolders (rare for an album, e.g. a "scans + log"
          // sibling) demote to small rows below so they don't compete.
          <div className="md:mx-auto md:max-w-3xl">
            <ul className="divide-y divide-border">
              {here.tracks.map((track) => {
                const isCurrent = player.current?.handle === track.handle;
                return (
                  <li key={track.filename}>
                    <TrackRow
                      title={track.title}
                      artist={here.name}
                      coverUrl={here.coverUrl}
                      format={track.format}
                      playing={isCurrent}
                      onClick={() => void player.playTrack(track, { queue: here.tracks })}
                    />
                  </li>
                );
              })}
            </ul>
            {here.folders.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-style-eyebrow text-fg-muted px-4 pb-2">Subfolders</h2>
                <ul className="divide-y divide-border">
                  {here.folders.map((folder) => (
                    <li key={folder.name}>
                      <DirectoryRow
                        name={folder.name}
                        trackCount={countTracks(folder)}
                        coverUrl={folder.coverUrl}
                        onClick={() => setPath([...path, folder.name])}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          // Album-of-albums mode — current folder is pure subfolders.
          // Narrow: edge-to-edge row list. Wide: AlbumCard grid (cover-led
          // tiles, the format users expect for a library at desktop widths).
          <>
            <ul className="md:hidden divide-y divide-border">
              {here.folders.map((folder) => (
                <li key={folder.name}>
                  <DirectoryRow
                    name={folder.name}
                    trackCount={countTracks(folder)}
                    coverUrl={folder.coverUrl}
                    onClick={() => setPath([...path, folder.name])}
                  />
                </li>
              ))}
            </ul>
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-5 px-6 py-6">
              {here.folders.map((folder) => {
                const count = countTracks(folder);
                return (
                  <AlbumCard
                    key={folder.name}
                    title={folder.name}
                    artist={`${count} ${count === 1 ? "track" : "tracks"}`}
                    coverUrl={folder.coverUrl}
                    onClick={() => setPath([...path, folder.name])}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Breadcrumbs({
  root,
  path,
  onNavigate,
}: {
  root: FolderNode;
  path: string[];
  onNavigate: (path: string[]) => void;
}) {
  // The root crumb is always shown; subsequent crumbs come from `path`.
  // Tap any crumb to jump straight back to that level.
  const segments = [
    { label: root.name, path: [] as string[] },
    ...path.map((name, i) => ({
      label: name,
      path: path.slice(0, i + 1),
    })),
  ];
  const last = segments.length - 1;

  return (
    <nav className="flex items-center gap-1 text-style-caption text-fg-muted overflow-x-auto scroll-style">
      <HouseIcon size={14} weight="bold" className="shrink-0" />
      {segments.map((seg, i) => {
        const active = i === last;
        return (
          <span key={i} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(seg.path)}
              disabled={active}
              className={cn(
                "rounded-sm px-1 py-0.5 transition-colors",
                "outline-accent focus-visible:outline-2",
                active ? "text-fg cursor-default" : "hover:text-fg cursor-pointer",
              )}
            >
              {seg.label}
            </button>
            {i < last ? <CaretRightIcon size={12} weight="bold" /> : null}
          </span>
        );
      })}
    </nav>
  );
}

function FolderEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <MusicNotesIcon size={32} weight="light" className="text-fg-subtle" />
      <span className="text-style-body text-fg-muted">No audio files in this folder.</span>
    </div>
  );
}

function ScanningState() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-bg text-fg px-6 text-center">
      <span className="text-style-eyebrow text-fg-muted">Scanning</span>
      <span className="text-style-body text-fg-muted">Walking the folder tree…</span>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-bg text-fg px-6 text-center">
      <span className="text-style-body text-fg-muted">
        That folder is no longer in the library.
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-style-body text-accent hover:underline"
      >
        Back to root
      </button>
    </div>
  );
}

// Recursive count of all audio files under a node (this folder + every
// descendant). Used in the row meta to give a sense of how much is inside
// before tapping in.
function countTracks(node: FolderNode): number {
  let total = node.tracks.length;
  for (const child of node.folders) total += countTracks(child);
  return total;
}
