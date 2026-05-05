import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LandingScreen } from "@/components/features/landing-screen";
import { useLibraryPicker } from "@/lib/library-picker";
import { useLibraryHandle } from "@/lib/library-handle";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const picker = useLibraryPicker();
  const { handle, pendingHandle, hydrating, setHandle, resumePending } = useLibraryHandle();
  const navigate = useNavigate();

  // Hydration window — IDB load + permission probe is in flight. Render
  // nothing for the brief moment to avoid flashing the landing CTA before
  // we know whether the user already has a stored library to resume.
  if (hydrating) return null;

  // Already-granted handle (rare in practice — Chromium resets permission
  // on reload — but possible mid-session). Skip landing entirely.
  // `search: (prev) => prev` keeps any inbound `?track=&t=` so the library
  // route can pick them up and resume playback.
  if (handle) return <Navigate to="/library" search={(prev) => prev} />;

  const onPickFolder = async () => {
    const next = await picker.pick();
    if (!next) return;
    setHandle(next);
    void navigate({ to: "/library", search: (prev) => prev });
  };

  const onResume = async () => {
    const ok = await resumePending();
    if (ok) void navigate({ to: "/library", search: (prev) => prev });
  };

  return (
    <LandingScreen
      onPickFolder={onPickFolder}
      picking={picker.picking}
      supported={picker.supported}
      error={picker.error}
      resumeFolderName={pendingHandle?.name}
      onResume={onResume}
    />
  );
}
