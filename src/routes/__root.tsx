import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { FullPlayer } from "@/components/features/full-player";
import { MiniPlayer } from "@/components/features/mini-player";
import { PwaUpdateToast } from "@/components/features/pwa-update-toast";
import { Drawer } from "@/components/primitives/drawer";
import { Toast } from "@/components/primitives/toast";
import { Tooltip } from "@/components/primitives/tooltip";
import { LibraryHandleProvider } from "@/lib/library-handle";
import { PlayerProvider, usePlayer } from "@/lib/player-context";

// Root-level search params: the currently playing track and its progress.
// Held at the root so they survive route changes — a refresh of `/library`
// or `/components/...` while audio is playing resumes from the same spot.
// `track` is the file's path-from-root joined with `/`; `t` is whole seconds
// of progress. Both are optional; missing or non-string/non-number values
// fall back to undefined so a manually-mangled URL just lands on landing.
type RootSearch = {
  track?: string;
  t?: number;
};

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): RootSearch => ({
    track: typeof search.track === "string" ? search.track : undefined,
    t: typeof search.t === "number" ? search.t : undefined,
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    // Toast.Provider holds the queue + animation state for toasts spawned
    // anywhere below; the matching Toast.Viewport is the visual stack.
    // Tooltip.Provider shares the hover-delay budget across adjacent triggers.
    // Both are mounted once at the route tree root.
    //
    // PlayerProvider sits inside the LibraryHandleProvider so the player
    // can resolve track handles from the same library tree, and outside of
    // Toast/Tooltip so a future "Now playing → toast" wiring can fire from
    // inside the player without needing to re-cross provider boundaries.
    <LibraryHandleProvider>
      <PlayerProvider>
        <Toast.Provider>
          <Tooltip.Provider>
            <Outlet />
            <Toast.Viewport />
            <PwaUpdateToast />
            <PersistentMiniPlayer />
            <PersistentFullPlayer />
          </Tooltip.Provider>
          <TanStackRouterDevtools position="top-right" />
        </Toast.Provider>
      </PlayerProvider>
    </LibraryHandleProvider>
  );
}

// Floating MiniPlayer surface — only present when a track is loaded.
// Mobile: full-bleed bar pinned to the bottom edge. Desktop (`md:`+):
// floating card pinned bottom-right with a max width. Matches the
// production-wrapping recipe in the MiniPlayer doc.
function PersistentMiniPlayer() {
  const player = usePlayer();
  if (!player.current) return null;
  // Folder name as the artist line until tag parsing lands. The current
  // track's `folderPath` last segment is the immediate parent — the
  // album folder for an `Artist/Album/Track` layout.
  const parent = player.current.folderPath[player.current.folderPath.length - 1] ?? "";
  const progress = player.durationSec > 0 ? player.progressSec / player.durationSec : 0;
  return (
    <MiniPlayer
      title={player.current.title}
      artist={parent}
      coverUrl={player.current.coverUrl}
      playing={player.playing}
      progress={progress}
      onPlayPause={player.togglePlayPause}
      onPrev={player.playPrev}
      onNext={player.playNext}
      onExpand={player.expand}
      className="fixed inset-x-0 bottom-0 z-40 md:inset-x-auto md:left-auto md:right-4 md:bottom-4 md:max-w-sm"
    />
  );
}

// Pixels of pull past which a release dismisses the FullPlayer. ~120 px is
// the iOS / Vaul-style threshold — long enough not to fire from incidental
// scroll-bounces, short enough to feel responsive. A fast flick (velocity
// detected via use-gesture's `swipe`) dismisses regardless of distance.
const DISMISS_THRESHOLD_PX = 120;

// FullPlayer overlay — slides up from the bottom as a fullscreen takeover
// when the user taps the MiniPlayer's expand affordance. Drawer side="bottom"
// gives the right slide-up animation; we override the default content-driven
// height + rounded corners to occupy the entire viewport. Tapping the
// FullPlayer's collapse chevron (or the backdrop / Esc) hands the screen
// back to whatever route is underneath. On touch, pulling down past the
// threshold (or flicking fast) also dismisses — handled by `useDrag`.
function PersistentFullPlayer() {
  const player = usePlayer();
  const popupRef = useRef<HTMLDivElement>(null);

  // Pull-to-dismiss: touch only (mouse drag would cannibalise click on the
  // transport buttons), axis-locked vertical, threshold-or-swipe to commit.
  // We mutate `style.transform` directly on the popup ref instead of routing
  // through React state so a finger drag doesn't re-render React on every
  // pointermove tick. The Drawer's class-based exit animation kicks in when
  // we call `player.collapse()` and we clear our inline transform so the
  // exit doesn't fight with our drag value.
  const bind = useDrag(
    ({ active, last, movement: [, my], swipe: [, swipeY], cancel }) => {
      const el = popupRef.current;
      if (!el) return;
      // Block upward pull — the drawer enters from the bottom, dragging up
      // would yank it past the top edge with no purpose. Cancel resets the
      // gesture cleanly so we don't strand the popup mid-drag.
      if (my < 0) {
        cancel();
        el.style.transition = "transform 200ms ease-out";
        el.style.transform = "";
        return;
      }
      if (active) {
        el.style.transition = "none";
        el.style.transform = `translateY(${my}px)`;
        return;
      }
      if (last) {
        const shouldDismiss = swipeY === 1 || my > DISMISS_THRESHOLD_PX;
        el.style.transition = "transform 200ms ease-out";
        el.style.transform = "";
        if (shouldDismiss) player.collapse();
      }
    },
    {
      // Touch only — desktop users dismiss via the chevron / Esc / backdrop
      // click, all of which are already wired by Drawer.
      pointer: { touch: true },
      // Axis-lock to vertical so a horizontal flick (e.g. on the scrubber
      // slider) never registers as a dismiss intent.
      axis: "y",
      // Suppress drag-as-tap on quick presses — without this every play /
      // pause / skip tap would also trigger a 0-distance "drag end".
      filterTaps: true,
    },
  );

  if (!player.current) return null;
  const parent = player.current.folderPath[player.current.folderPath.length - 1] ?? "";
  return (
    <Drawer
      open={player.expanded}
      onOpenChange={(open) => {
        if (!open) player.collapse();
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Popup
          ref={popupRef}
          side="bottom"
          // Override the bottom-side defaults: full viewport height, no
          // rounded top, no internal padding so the FullPlayer paints
          // edge-to-edge.
          className="h-dvh max-h-none w-full max-w-none rounded-none border-t-0 p-0 gap-0 touch-pan-y"
          {...bind()}
        >
          <FullPlayer
            title={player.current.title}
            artist={parent}
            coverUrl={player.current.coverUrl}
            playing={player.playing}
            progressSec={player.progressSec}
            durationSec={player.durationSec}
            repeat={player.repeat}
            shuffle={player.shuffle}
            onPlayPause={player.togglePlayPause}
            onPrev={player.playPrev}
            onNext={player.playNext}
            onSeek={player.seek}
            onCycleRepeat={player.cycleRepeat}
            onToggleShuffle={player.toggleShuffle}
            onCollapse={player.collapse}
          />
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer>
  );
}
