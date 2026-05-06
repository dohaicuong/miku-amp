import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useLibraries } from "@/lib/library-handle";

// `/library/` — bare. The URL encodes the active library id as its first
// path segment (`/library/<id>`), so we rewrite the bare URL to include
// that id. The /library layout has already guaranteed at least one granted
// library exists by the time this renders.
export const Route = createFileRoute("/library/")({
  component: BareLibraryRoute,
});

function BareLibraryRoute() {
  const { libraries, activeId } = useLibraries();
  const target = activeId ?? libraries[0]?.id;
  if (!target) return null;
  return <Navigate to="/library/$" params={{ _splat: target }} replace />;
}
