import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { clearLibraryHandle, loadLibraryHandle, saveLibraryHandle } from "./library-storage";

/*
 * Holds the `FileSystemDirectoryHandle` the user grants on the landing
 * screen so all `/library/*` routes can read the same one.
 *
 * Persists across reloads via IndexedDB (`library-storage.ts`). Permission
 * does NOT persist — Chromium resets it to "prompt" on each load — so the
 * provider exposes two slots:
 *
 *   - `handle`         — current permission-granted handle, ready to use.
 *   - `pendingHandle`  — restored from IDB but needs a fresh permission
 *                        grant. The landing screen surfaces a "Continue
 *                        with <name>" CTA that calls `resumePending()` on
 *                        click (a real user gesture is required for
 *                        `requestPermission` to succeed).
 *
 * On mount the provider loads the stored handle, queries its current
 * permission, and routes it to the right slot. A "denied" status drops the
 * handle from IDB silently — the user has to re-pick.
 */
type LibraryHandleContextValue = {
  handle: FileSystemDirectoryHandle | null;
  pendingHandle: FileSystemDirectoryHandle | null;
  // True until the IDB load + permission probe finishes. Lets consumers
  // (the route guard) avoid bouncing the user back to landing during the
  // brief async window before the stored handle is hydrated.
  hydrating: boolean;
  setHandle: (handle: FileSystemDirectoryHandle | null) => void;
  // Re-request permission on `pendingHandle`. Resolves to true on grant,
  // false otherwise. Must be called from a user-gesture event handler.
  resumePending: () => Promise<boolean>;
};

const LibraryHandleContext = createContext<LibraryHandleContextValue | null>(null);

export function LibraryHandleProvider({ children }: { children: ReactNode }) {
  const [handle, setHandleState] = useState<FileSystemDirectoryHandle | null>(null);
  const [pendingHandle, setPendingHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [hydrating, setHydrating] = useState(true);

  // One-shot rehydration on mount — read the stored handle, probe its
  // current permission, route it into the right slot.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadLibraryHandle();
      if (cancelled) return;
      if (!stored) {
        setHydrating(false);
        return;
      }
      const status = await queryRead(stored);
      if (cancelled) return;
      if (status === "granted") {
        setHandleState(stored);
      } else if (status === "prompt") {
        setPendingHandle(stored);
      } else {
        // denied — handle is dead, evict from IDB.
        await clearLibraryHandle();
      }
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setHandle = useCallback((next: FileSystemDirectoryHandle | null) => {
    setHandleState(next);
    setPendingHandle(null);
    if (next) void saveLibraryHandle(next);
    else void clearLibraryHandle();
  }, []);

  const resumePending = useCallback(async (): Promise<boolean> => {
    if (!pendingHandle) return false;
    if (typeof pendingHandle.requestPermission !== "function") return false;
    try {
      const result = await pendingHandle.requestPermission({ mode: "read" });
      if (result === "granted") {
        setHandleState(pendingHandle);
        setPendingHandle(null);
        return true;
      }
    } catch (err) {
      console.warn("[miku-amp] resumePending:", err);
    }
    return false;
  }, [pendingHandle]);

  return (
    <LibraryHandleContext.Provider
      value={{ handle, pendingHandle, hydrating, setHandle, resumePending }}
    >
      {children}
    </LibraryHandleContext.Provider>
  );
}

export function useLibraryHandle(): LibraryHandleContextValue {
  const ctx = useContext(LibraryHandleContext);
  if (!ctx) {
    throw new Error("useLibraryHandle must be used inside <LibraryHandleProvider>");
  }
  return ctx;
}

// `queryPermission` may be missing on older Chromium / non-secure contexts;
// treat that case as "prompt" so we still let the user resume on click.
async function queryRead(
  handle: FileSystemDirectoryHandle,
): Promise<"granted" | "prompt" | "denied"> {
  if (typeof handle.queryPermission !== "function") return "prompt";
  try {
    return await handle.queryPermission({ mode: "read" });
  } catch (err) {
    console.warn("[miku-amp] queryPermission:", err);
    return "prompt";
  }
}
