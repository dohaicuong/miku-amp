import { FolderOpenIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";
import { Button } from "@/components/primitives/button";
import { IconButton } from "@/components/primitives/icon-button";
import { DirectoryRow } from "@/components/features/directory-row";

type LibraryEntry = {
  id: string;
  name: string;
  // Recursive track count for the row's subtitle. Optional — pending
  // libraries don't have a tree to count from yet.
  trackCount?: number;
  // Library-root cover URL, when one was detected during the scan. Falls
  // back to the folder icon when omitted.
  coverUrl?: string;
};

type LandingScreenProps = {
  // Fired when the user taps the picker CTA. Caller drives the actual
  // file system picker (see `useLibraryPicker`); this component is
  // presentational.
  onAddFolder: () => void;
  // Disables the picker while the OS dialog is open so double-tap doesn't
  // double-fire.
  picking?: boolean;
  // Hides the CTAs and surfaces a fallback message when the host browser
  // lacks `showDirectoryPicker` (Safari, iOS, older Chromiums).
  supported?: boolean;
  // Last failure surface for the picker. Cleared on the next `pick()`.
  error?: string | null;
  // Granted libraries — each renders an "Open <name>" CTA that switches
  // the active library and routes into /library.
  libraries?: LibraryEntry[];
  // Pending libraries — each renders a "Continue with <name>" CTA that
  // re-requests permission. Permission grants don't survive a reload, so
  // any library not currently granted lands here.
  pendingLibraries?: LibraryEntry[];
  onOpen?: (id: string) => void;
  onResume?: (id: string) => void;
  // When provided, each library entry (granted or pending) renders a
  // trash affordance that drops the entry from storage. The action is
  // intentionally one-tap with no confirm — re-adding the same folder
  // is a single picker prompt away.
  onRemove?: (id: string) => void;
  className?: string;
};

// First-launch surface — the user lands here, the app explains why it's
// asking for a folder, and CTAs open the OS directory picker. When the
// user already has libraries on file, those re-entry CTAs lead.
export function LandingScreen({
  onAddFolder,
  picking = false,
  supported = true,
  error,
  libraries = [],
  pendingLibraries = [],
  onOpen,
  onResume,
  onRemove,
  className,
}: LandingScreenProps) {
  const hasReentry = libraries.length > 0 || pendingLibraries.length > 0;
  return (
    <div
      className={cn(
        "min-h-dvh flex items-center justify-center bg-bg text-fg",
        "px-6 py-12",
        className,
      )}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <img
          src={asset("app-icons/icon-192.png")}
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="h-24 w-24 select-none"
          draggable={false}
        />
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-style-display text-fg">Miku Amp</h1>
          <p className="text-style-body text-fg-muted">
            Local-library music player. Pick a folder of audio files to get started — nothing leaves
            your device.
          </p>
        </div>

        {supported ? (
          <div className="flex w-full flex-col items-stretch gap-3">
            <Button
              // Picker downgrades to secondary once any re-entry CTA is
              // visible — re-entry is the more likely intent for a
              // returning user.
              variant={hasReentry ? "secondary" : "primary"}
              size="lg"
              onClick={onAddFolder}
              disabled={picking}
              aria-busy={picking}
            >
              <FolderOpenIcon weight="bold" />
              {picking ? "Choosing folder…" : "Select folder"}
            </Button>
            {libraries.map((lib) => (
              <LibraryRow
                key={lib.id}
                name={lib.name}
                trackCount={lib.trackCount}
                coverUrl={lib.coverUrl}
                onActivate={() => onOpen?.(lib.id)}
                onRemove={onRemove ? () => onRemove(lib.id) : undefined}
              />
            ))}
            {pendingLibraries.map((lib) => (
              <LibraryRow
                key={lib.id}
                name={lib.name}
                subtitle="Tap to grant access"
                onActivate={() => onResume?.(lib.id)}
                onRemove={onRemove ? () => onRemove(lib.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <UnsupportedNotice />
        )}

        {error ? (
          <p role="alert" className="text-style-caption text-highlight max-w-xs">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// One library entry: a directory row (left-aligned, folder icon /
// cover, name + subtitle) paired with an optional trash affordance. The
// trash button is a sibling rather than a nested control so we don't end
// up with two interactive elements stacked inside each other.
function LibraryRow({
  name,
  trackCount,
  subtitle,
  coverUrl,
  onActivate,
  onRemove,
}: {
  name: string;
  trackCount?: number;
  subtitle?: string;
  coverUrl?: string;
  onActivate: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <DirectoryRow
        name={name}
        trackCount={trackCount}
        subtitle={subtitle}
        coverUrl={coverUrl}
        onClick={onActivate}
        className="flex-1 min-w-0 rounded-md border border-border"
      />
      {onRemove ? (
        <IconButton
          variant="ghost"
          size="lg"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="text-fg-muted hover:text-highlight"
        >
          <TrashIcon weight="bold" />
        </IconButton>
      ) : null}
    </div>
  );
}

// Fallback for browsers without the File System Access API. Names the
// supported routes so the user knows what to do rather than just hitting a
// dead button.
function UnsupportedNotice() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-style-caption text-fg-muted">
      <WarningIcon weight="bold" className="h-5 w-5 text-highlight" />
      <span>
        Your browser doesn't support the file system picker. Try Chrome, Edge, or Brave on desktop /
        Android.
      </span>
    </div>
  );
}
