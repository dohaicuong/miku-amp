import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-black text-neutral-100">
      <h1 className="text-2xl font-medium tracking-wide">miku-amp</h1>
    </div>
  );
}
