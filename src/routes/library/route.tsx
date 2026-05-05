import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useLibraryHandle } from "@/lib/library-handle";

export const Route = createFileRoute("/library")({
  component: LibraryLayout,
});

function LibraryLayout() {
  const { handle, hydrating } = useLibraryHandle();
  // Don't decide while the IDB rehydration is in flight — bouncing during
  // that window would yank a returning user to the landing screen for a
  // frame even when their handle is about to land in state.
  if (hydrating) return null;
  // No handle = the user landed here directly (e.g. browser refresh) without
  // a stored handle to resume from. Bounce back to landing — picking (or
  // resuming) the folder there is the only way to proceed. Preserve search
  // (`?track=&t=`) so the resume flow can restore the same playback after
  // the user re-grants permission and bounces back here.
  if (!handle) return <Navigate to="/" search={(prev) => prev} />;
  return <Outlet />;
}
