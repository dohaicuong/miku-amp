import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FoldersView } from "./-folders-view";
import { useLibraries } from "@/lib/library-handle";

// `/library/$splat` — splat captures `<libraryId>` and any folder path
// after it. We split the splat ourselves: first segment = library id
// (uuid), remaining segments = folder path within that library. Putting
// the id in the URL means a deep-link / refresh / bookmark uniquely
// identifies which library it points to, even with multiple registered.
export const Route = createFileRoute("/library/$")({
  component: LibrarySplatRoute,
});

function LibrarySplatRoute() {
  const { _splat } = Route.useParams();
  const navigate = useNavigate();
  const { libraries, activeId, setActiveId } = useLibraries();

  const segments = (_splat ?? "").split("/").filter(Boolean);
  const libraryId = segments[0];
  const path = segments.slice(1);

  const exists = !!libraryId && libraries.some((l) => l.id === libraryId);

  // Sync URL → active state. When the user lands here via a deep link
  // or bookmark whose id differs from the currently-active library,
  // switch active to match the URL. We don't write to the URL from
  // here — the URL is the source of truth.
  useEffect(() => {
    if (exists && libraryId && libraryId !== activeId) {
      setActiveId(libraryId);
    }
  }, [exists, libraryId, activeId, setActiveId]);

  if (!exists) {
    // Stale or unknown id (library removed, bad link, etc). Bounce to
    // the active library's URL or back to landing.
    const fallback = activeId ?? libraries[0]?.id;
    return fallback ? (
      <Navigate to="/library/$" params={{ _splat: fallback }} replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return (
    <FoldersView
      path={path}
      setPath={(next) => {
        const splat = [libraryId, ...next].join("/");
        void navigate({ to: "/library/$", params: { _splat: splat } });
      }}
      onSwitchLibrary={(id) => {
        // Switching libraries resets the path — the new library's
        // folder structure may not match. The splat route's effect
        // above handles the active-id side effect.
        void navigate({ to: "/library/$", params: { _splat: id } });
      }}
    />
  );
}
