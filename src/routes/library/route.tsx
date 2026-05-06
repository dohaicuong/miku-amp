import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useLibraries } from "@/lib/library-handle";

export const Route = createFileRoute("/library")({
  component: LibraryLayout,
});

function LibraryLayout() {
  const { libraries, hydrating } = useLibraries();
  // Don't decide while the IDB rehydration is in flight — bouncing during
  // that window would yank a returning user to the landing screen for a
  // frame even when their library is about to land in state.
  if (hydrating) return null;
  // No granted libraries at all = no possible target. Bounce back to
  // landing where the picker / resume CTAs live. (We don't gate on
  // `activeId` here — the splat route reads the library id from the
  // URL and syncs `activeId` via setActiveId.)
  if (libraries.length === 0) return <Navigate to="/" />;
  return <Outlet />;
}
