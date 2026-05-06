import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LandingScreen } from "@/components/features/landing-screen";
import { useLibraryPicker } from "@/lib/library-picker";
import { useLibraries } from "@/lib/library-handle";
import { countTracks } from "@/lib/library";

// `?stay=1` opts out of the auto-redirect to /library that would otherwise
// fire whenever an active library is set. Set by the library screen's
// "Home" affordance so the user can deliberately land here without being
// bounced straight back.
type Search = { stay?: boolean };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    stay: search.stay === true || search.stay === "true" || search.stay === 1 ? true : undefined,
  }),
  component: HomePage,
});

function HomePage() {
  const picker = useLibraryPicker();
  const {
    libraries,
    pendingLibraries,
    activeId,
    hydrating,
    setActiveId,
    addLibrary,
    removeLibrary,
    resumePending,
  } = useLibraries();
  const navigate = useNavigate();
  const { stay } = Route.useSearch();

  // Hydration window — IDB load + permission probes are in flight. Render
  // nothing for the brief moment to avoid flashing the landing CTAs before
  // we know whether the user has stored libraries to resume.
  if (hydrating) return null;

  // Auto-redirect when an active library is set, unless the user
  // explicitly asked to stay via the home button.
  if (activeId && !stay) return <Navigate to="/library" />;

  const onAddFolder = async () => {
    const next = await picker.pick();
    if (!next) return;
    const id = await addLibrary(next);
    if (id) void navigate({ to: "/library" });
  };

  const onOpen = (id: string) => {
    setActiveId(id);
    void navigate({ to: "/library" });
  };

  const onResume = async (id: string) => {
    const ok = await resumePending(id);
    if (ok) void navigate({ to: "/library" });
  };

  return (
    <LandingScreen
      onAddFolder={onAddFolder}
      picking={picker.picking}
      supported={picker.supported}
      error={picker.error}
      libraries={libraries.map((l) => ({
        id: l.id,
        name: l.handle.name,
        trackCount: countTracks(l.tree),
        coverUrl: l.tree.coverUrl,
      }))}
      pendingLibraries={pendingLibraries.map((p) => ({ id: p.id, name: p.handle.name }))}
      onOpen={onOpen}
      onResume={onResume}
      onRemove={(id) => void removeLibrary(id)}
    />
  );
}
