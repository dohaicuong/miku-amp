import { ArrowClockwiseIcon, FolderOpenIcon, WarningIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";
import { Button } from "@/components/primitives/button";

type LandingScreenProps = {
  // Fired when the user taps the primary CTA. Caller drives the actual
  // picker (see `useLibraryPicker`); this component is presentational.
  onPickFolder: () => void;
  // Disables the CTA while the OS dialog is open so double-tap doesn't
  // double-fire the picker.
  picking?: boolean;
  // Hides the CTA and surfaces a fallback message when the host browser
  // lacks `showDirectoryPicker` (Safari, iOS, older Chromiums).
  supported?: boolean;
  // Last failure surface. Cleared on the next `pick()`. Empty / undefined
  // for the normal "ready" state.
  error?: string | null;
  // When set, renders a secondary "Continue with <name>" CTA above the
  // primary picker — represents a previously-granted handle restored from
  // IndexedDB whose permission needs a fresh user gesture to re-activate.
  // The label uses the folder's own name to disambiguate which library is
  // being resumed.
  resumeFolderName?: string;
  onResume?: () => void;
  className?: string;
};

// First-launch surface — the user lands here, the app explains why it's
// asking for a folder, and a single CTA opens the OS directory picker.
// Pure presentational: hook the picker logic in via `useLibraryPicker` at
// the route level. Designed for portrait (M500) but holds up on a wide
// container without complaining.
export function LandingScreen({
  onPickFolder,
  picking = false,
  supported = true,
  error,
  resumeFolderName,
  onResume,
  className,
}: LandingScreenProps) {
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
          <div className="flex flex-col items-center gap-3">
            {resumeFolderName && onResume ? (
              <Button variant="primary" size="lg" onClick={onResume}>
                <ArrowClockwiseIcon weight="bold" />
                Continue with {resumeFolderName}
              </Button>
            ) : null}
            <Button
              // When a resume CTA is showing, downgrade the primary picker
              // to secondary — the resume action is the more likely intent
              // for a returning user.
              variant={resumeFolderName ? "secondary" : "primary"}
              size="lg"
              onClick={onPickFolder}
              disabled={picking}
              aria-busy={picking}
            >
              <FolderOpenIcon weight="bold" />
              {picking
                ? "Choosing folder…"
                : resumeFolderName
                  ? "Choose a different folder"
                  : "Choose music folder"}
            </Button>
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
