import { useCallback, useState } from "react";

/*
 * Wraps `window.showDirectoryPicker()` (File System Access API) in a hook
 * shaped for the LandingScreen consumer.
 *
 * Returns a triple-state read:
 *  - `supported`  — false on Safari / iOS / older browsers; LandingScreen
 *                   surfaces a friendly "unsupported" panel instead of the
 *                   CTA when this is false.
 *  - `picking`    — true while the OS dialog is open. Disables the button so
 *                   double-clicks don't spam the API.
 *  - `error`      — last failure string, or null. Cleared on a fresh `pick()`.
 *
 * `pick()` resolves to the chosen `FileSystemDirectoryHandle` on success, or
 * null when the user dismissed the dialog. Any other failure (permission
 * denied, security error) lands in `error` and resolves to null too — the
 * caller doesn't have to discriminate cancel vs. fail.
 */
export type LibraryPicker = {
  supported: boolean;
  picking: boolean;
  error: string | null;
  pick: () => Promise<FileSystemDirectoryHandle | null>;
};

export function useLibraryPicker(): LibraryPicker {
  const supported =
    typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!supported) {
      setError("This browser doesn't support the file system picker.");
      return null;
    }
    setPicking(true);
    setError(null);
    try {
      // `mode: "read"` — we only need to enumerate + read audio files. Bumping
      // to "readwrite" later would require re-prompting the user.
      // Non-null assert: `supported` already gated us above, so the method
      // is present here even though the TS type carries it as optional.
      const handle = await window.showDirectoryPicker!({
        id: "miku-amp-library",
        mode: "read",
      });
      return handle;
    } catch (err) {
      // AbortError = user dismissed the picker; treat as a non-error cancel
      // so the UI doesn't flash a "something went wrong" message.
      if (err instanceof DOMException && err.name === "AbortError") return null;
      setError(err instanceof Error ? err.message : "Couldn't open the folder picker.");
      return null;
    } finally {
      setPicking(false);
    }
  }, [supported]);

  return { supported, picking, error, pick };
}
