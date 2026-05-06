import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  DotsThreeVerticalIcon,
  MusicNotesIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";
import { AlbumCard } from "@/components/features/album-card";
import { DirectoryRow } from "@/components/features/directory-row";
import { TrackRow } from "@/components/features/track-row";
import { useLibraries, type Library } from "@/lib/library-handle";
import { countTracks, findFolder, findTrackByPath } from "@/lib/library";
import { usePlayer } from "@/lib/player-context";
import { loadPlaybackState } from "@/lib/library-storage";
import { Menu } from "@/components/primitives/menu";
import { cn } from "@/lib/cn";

// Shared library viewer. URL drives both which library is active (uuid
// as the first path segment) and which folder is open (rest of the path).
// The splat route owns the URL parsing and hands `path` + navigation
// callbacks down so this component can stay routing-agnostic.
export function FoldersView({
  path,
  setPath,
  onSwitchLibrary,
}: {
  path: string[];
  setPath: (next: string[]) => void;
  onSwitchLibrary: (id: string) => void;
}) {
  const { libraries, activeId, rescan, removeLibrary } = useLibraries();
  const player = usePlayer();

  const active = libraries.find((l) => l.id === activeId) ?? null;
  const root = active?.tree ?? null;

  const here = useMemo(() => (root ? findFolder(root, path) : null), [root, path]);

  // One-shot playback restore from IndexedDB — fires once the library
  // tree is in hand and the player isn't already holding a track. The
  // saved playback state names which library it came from, so we only
  // restore when that library is currently active. The `restoredRef`
  // guard prevents re-entry under StrictMode and on later renders.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (!active || !root || player.current) return;
    restoredRef.current = true;
    void loadPlaybackState().then((state) => {
      if (!state) return;
      if (state.rootId !== active.id) return;
      const track = findTrackByPath(root, state.trackPath);
      if (!track) return;
      // `track.folderPath` includes the root's own name as its first
      // segment; strip it before walking from root via subfolders.
      const folder = findFolder(root, track.folderPath.slice(1));
      const queue = folder?.tracks ?? [track];
      void player.playTrack(track, { seekTo: state.t, queue });
    });
  }, [active, root, player]);

  if (!active || !root) return <ScanningState />;
  if (!here) {
    // Stale path no longer resolves (e.g. switched library, or a rescan
    // dropped a folder). Reset to root.
    return <EmptyState onReset={() => setPath([])} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-fg">
      <header className="shrink-0 border-b border-border px-5 py-5 flex items-center gap-3">
        {path.length > 0 ? (
          <button
            type="button"
            onClick={() => setPath(path.slice(0, -1))}
            aria-label="Up one folder"
            className={cn(
              "shrink-0 inline-flex items-center justify-center rounded-md p-2",
              "text-fg hover:bg-surface active:bg-surface transition-colors",
              "outline-accent focus-visible:outline-2 cursor-pointer",
            )}
          >
            <ArrowLeftIcon size={18} weight="bold" />
          </button>
        ) : null}
        <h1 className="text-style-heading-3 text-fg line-clamp-1 min-w-0 flex-1">{here.name}</h1>
        <LibraryMenu
          libraries={libraries}
          activeId={active.id}
          onSwitch={onSwitchLibrary}
          onRescan={() => void rescan(active.id)}
          onRemove={() => void removeLibrary(active.id)}
        />
      </header>
      <div
        className={cn(
          "flex-1 overflow-y-auto scroll-style",
          // Always clear the persistent BottomNav (~3.5rem) on mobile;
          // bump the offset further when the MiniPlayer is also stacking
          // above the nav.
          player.current ? "pb-36" : "pb-16",
        )}
      >
        {here.folders.length === 0 && here.tracks.length === 0 ? (
          <FolderEmpty />
        ) : here.tracks.length > 0 ? (
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

// Library actions menu — sits on the right of the title row. Holds
// "Switch library" (when more than one is registered), "Rescan", and
// "Remove" — the only places those actions live now that the breadcrumb
// chain is gone.
function LibraryMenu({
  libraries,
  activeId,
  onSwitch,
  onRescan,
  onRemove,
}: {
  libraries: Library[];
  activeId: string;
  onSwitch: (id: string) => void;
  onRescan: () => void;
  onRemove: () => void;
}) {
  const others = libraries.filter((l) => l.id !== activeId);

  return (
    <Menu>
      <Menu.Trigger
        aria-label="Library options"
        className={cn(
          "shrink-0 inline-flex items-center justify-center rounded-md p-2",
          "text-fg-muted hover:text-fg hover:bg-surface transition-colors",
          "outline-accent focus-visible:outline-2 cursor-pointer",
        )}
      >
        <DotsThreeVerticalIcon size={20} weight="bold" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end">
          <Menu.Popup>
            {others.length > 0 ? (
              <>
                <Menu.Group>
                  <Menu.GroupLabel>Switch library</Menu.GroupLabel>
                  {others.map((l) => (
                    <Menu.Item key={l.id} onClick={() => onSwitch(l.id)}>
                      {l.handle.name}
                    </Menu.Item>
                  ))}
                </Menu.Group>
                <Menu.Separator />
              </>
            ) : null}
            <Menu.Item onClick={onRescan}>
              <span className="inline-flex items-center gap-2">
                <ArrowsClockwiseIcon size={14} weight="bold" />
                Rescan
              </span>
            </Menu.Item>
            <Menu.Item onClick={onRemove}>
              <span className="inline-flex items-center gap-2 text-highlight">
                <TrashIcon size={14} weight="bold" />
                Remove
              </span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu>
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
      <span className="text-style-eyebrow text-fg-muted">Loading library</span>
      <span className="text-style-body text-fg-muted">Just a moment…</span>
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
