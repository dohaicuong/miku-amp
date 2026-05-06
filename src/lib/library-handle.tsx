import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { hydrateCoverUrls, walkLibrary, type FolderNode } from "./library";
import {
  loadActiveLibraryId,
  loadLibraries,
  newLibraryId,
  saveActiveLibraryId,
  saveLibraries,
  type StoredLibrary,
} from "./library-storage";

/*
 * Multi-library provider. Holds every library the user has registered,
 * tracks which one is currently active, and persists each library's
 * folder tree + handle to IndexedDB so route changes and reloads don't
 * trigger a full disk walk.
 *
 * Permission grants don't survive a reload (Chromium resets to "prompt"),
 * so each rehydrated library lands in one of three slots based on a
 * permission probe:
 *
 *   - granted  → `libraries` (active list, ready to use; tree's cover
 *                blob URLs regenerated from cached handles).
 *   - prompt   → `pendingLibraries` (handle is fine, just needs a fresh
 *                user gesture; landing screen surfaces a "Continue with
 *                <name>" CTA per pending entry).
 *   - denied   → silently dropped from IDB.
 *
 * On launch we auto-pick the most-recently-active *granted* library as
 * the active id; pending libraries are surfaced on landing so the user
 * can re-grant any of them in one click.
 */

export type Library = {
  id: string;
  handle: FileSystemDirectoryHandle;
  // Latest scanned tree, in memory. Always populated for granted entries
  // — we walk on add, hydrate from IDB on subsequent loads, and rescan
  // on user request.
  tree: FolderNode;
  scannedAt: number | null;
  lastActiveAt: number;
};

export type PendingLibrary = {
  id: string;
  handle: FileSystemDirectoryHandle;
};

type LibrariesContextValue = {
  libraries: Library[];
  pendingLibraries: PendingLibrary[];
  activeId: string | null;
  // True until the IDB load + permission probes finish.
  hydrating: boolean;
  // Switches the active library. Saved to IDB so a refresh lands on the
  // same one. Also stamps `lastActiveAt` for auto-pick on the next launch.
  setActiveId: (id: string) => void;
  // Picks a folder, scans it, persists, and switches active to the new
  // library. Returns the new id, or null on cancel / error.
  addLibrary: (handle: FileSystemDirectoryHandle) => Promise<string | null>;
  // Drops a library from state and IDB. If the removed library was active,
  // active falls back to the next most-recently-active.
  removeLibrary: (id: string) => Promise<void>;
  // Re-walk a library's folder tree and persist the fresh result.
  rescan: (id: string) => Promise<void>;
  // Re-request permission on a pending library; on grant, the entry moves
  // from `pendingLibraries` to `libraries` (with its cached tree if any).
  // Must be called from a user-gesture event handler.
  resumePending: (id: string) => Promise<boolean>;
};

const LibrariesContext = createContext<LibrariesContextValue | null>(null);

export function LibraryHandleProvider({ children }: { children: ReactNode }) {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [pendingLibraries, setPendingLibraries] = useState<PendingLibrary[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);

  // Mirror of the persisted library set so non-React updates (e.g. from
  // an event handler that mutates a tree in place) can call `persist()`
  // without re-deriving the IDB shape from scratch.
  const persistedRef = useRef<StoredLibrary[]>([]);

  // One-shot rehydration on mount.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadLibraries();
      if (cancelled) return;

      const granted: Library[] = [];
      const pending: PendingLibrary[] = [];
      const survivors: StoredLibrary[] = [];

      for (const entry of stored) {
        const status = await queryRead(entry.handle);
        if (cancelled) return;
        if (status === "denied") continue; // evict
        survivors.push(entry);
        if (status === "granted") {
          // Hydrate cover URLs from cached handles (blob URLs don't
          // survive reload). If the entry has no cached tree yet, fall
          // through to a fresh scan — shouldn't happen in practice.
          let tree = entry.tree;
          if (tree) {
            await hydrateCoverUrls(tree);
          } else {
            try {
              tree = await walkLibrary(entry.handle, entry.id);
              entry.scannedAt = Date.now();
              entry.tree = tree;
            } catch (err) {
              console.warn("[miku-amp] initial scan:", err);
              continue;
            }
          }
          granted.push({
            id: entry.id,
            handle: entry.handle,
            tree,
            scannedAt: entry.scannedAt,
            lastActiveAt: entry.lastActiveAt,
          });
        } else {
          // status === "prompt"
          pending.push({ id: entry.id, handle: entry.handle });
        }
      }

      // Persist evictions + any in-flight scans we performed.
      if (survivors.length !== stored.length || stored.some((e) => !e.tree)) {
        await saveLibraries(survivors);
      }
      persistedRef.current = survivors;

      const storedActive = await loadActiveLibraryId();
      const activeIsGranted = granted.some((g) => g.id === storedActive);
      const fallback = pickMostRecentlyActive(granted);
      const nextActive = activeIsGranted ? storedActive : fallback;

      if (cancelled) return;
      setLibraries(granted);
      setPendingLibraries(pending);
      setActiveIdState(nextActive);
      if (nextActive !== storedActive) {
        await saveActiveLibraryId(nextActive);
      }
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-derive the persisted form from current React state and write it.
  // Cheap because state arrays are small (handful of libraries) and trees
  // are already in memory; structured-clone handles the rest.
  const persist = useCallback((nextGranted: Library[], nextPending: PendingLibrary[]) => {
    const merged: StoredLibrary[] = [
      ...nextGranted.map((l) => ({
        id: l.id,
        handle: l.handle,
        tree: l.tree,
        scannedAt: l.scannedAt,
        lastActiveAt: l.lastActiveAt,
      })),
      ...nextPending.map((p) => {
        // Preserve any prior persisted metadata for this id (cached tree,
        // timestamps); fall back to fresh defaults for first-time entries.
        const prior = persistedRef.current.find((e) => e.id === p.id);
        return (
          prior ?? {
            id: p.id,
            handle: p.handle,
            tree: null,
            scannedAt: null,
            lastActiveAt: 0,
          }
        );
      }),
    ];
    persistedRef.current = merged;
    void saveLibraries(merged);
  }, []);

  const setActiveId = useCallback(
    (id: string) => {
      const stamped: Library[] = libraries.map((l) =>
        l.id === id ? { ...l, lastActiveAt: Date.now() } : l,
      );
      setLibraries(stamped);
      setActiveIdState(id);
      void saveActiveLibraryId(id);
      persist(stamped, pendingLibraries);
    },
    [libraries, pendingLibraries, persist],
  );

  const addLibrary = useCallback(
    async (handle: FileSystemDirectoryHandle): Promise<string | null> => {
      const id = newLibraryId();
      try {
        const tree = await walkLibrary(handle, id);
        const next: Library = {
          id,
          handle,
          tree,
          scannedAt: Date.now(),
          lastActiveAt: Date.now(),
        };
        const nextLibraries = [...libraries, next];
        setLibraries(nextLibraries);
        setActiveIdState(id);
        void saveActiveLibraryId(id);
        persist(nextLibraries, pendingLibraries);
        return id;
      } catch (err) {
        console.warn("[miku-amp] addLibrary scan:", err);
        return null;
      }
    },
    [libraries, pendingLibraries, persist],
  );

  const removeLibrary = useCallback(
    async (id: string): Promise<void> => {
      const nextLibraries = libraries.filter((l) => l.id !== id);
      const nextPending = pendingLibraries.filter((p) => p.id !== id);
      setLibraries(nextLibraries);
      setPendingLibraries(nextPending);
      persist(nextLibraries, nextPending);
      if (activeId === id) {
        const fallback = pickMostRecentlyActive(nextLibraries);
        setActiveIdState(fallback);
        await saveActiveLibraryId(fallback);
      }
    },
    [libraries, pendingLibraries, activeId, persist],
  );

  const rescan = useCallback(
    async (id: string): Promise<void> => {
      const target = libraries.find((l) => l.id === id);
      if (!target) return;
      try {
        const tree = await walkLibrary(target.handle, id);
        const next: Library = { ...target, tree, scannedAt: Date.now() };
        const nextLibraries = libraries.map((l) => (l.id === id ? next : l));
        setLibraries(nextLibraries);
        persist(nextLibraries, pendingLibraries);
      } catch (err) {
        console.warn("[miku-amp] rescan:", err);
      }
    },
    [libraries, pendingLibraries, persist],
  );

  const resumePending = useCallback(
    async (id: string): Promise<boolean> => {
      const target = pendingLibraries.find((p) => p.id === id);
      if (!target) return false;
      if (typeof target.handle.requestPermission !== "function") return false;
      try {
        const result = await target.handle.requestPermission({ mode: "read" });
        if (result !== "granted") return false;
      } catch (err) {
        console.warn("[miku-amp] resumePending:", err);
        return false;
      }

      // Permission granted — hydrate from cache if we have one, scan
      // otherwise, then move from pending → granted.
      const prior = persistedRef.current.find((e) => e.id === id);
      let tree: FolderNode | null = prior?.tree ?? null;
      if (tree) {
        await hydrateCoverUrls(tree);
      } else {
        try {
          tree = await walkLibrary(target.handle, id);
        } catch (err) {
          console.warn("[miku-amp] resumePending scan:", err);
          return false;
        }
      }

      const next: Library = {
        id,
        handle: target.handle,
        tree,
        scannedAt: prior?.scannedAt ?? Date.now(),
        lastActiveAt: Date.now(),
      };
      const nextLibraries = [...libraries, next];
      const nextPending = pendingLibraries.filter((p) => p.id !== id);
      setLibraries(nextLibraries);
      setPendingLibraries(nextPending);
      setActiveIdState(id);
      void saveActiveLibraryId(id);
      persist(nextLibraries, nextPending);
      return true;
    },
    [libraries, pendingLibraries, persist],
  );

  return (
    <LibrariesContext.Provider
      value={{
        libraries,
        pendingLibraries,
        activeId,
        hydrating,
        setActiveId,
        addLibrary,
        removeLibrary,
        rescan,
        resumePending,
      }}
    >
      {children}
    </LibrariesContext.Provider>
  );
}

export function useLibraries(): LibrariesContextValue {
  const ctx = useContext(LibrariesContext);
  if (!ctx) {
    throw new Error("useLibraries must be used inside <LibraryHandleProvider>");
  }
  return ctx;
}

// Convenience hook — returns just the active library (or null while
// hydrating / when none are registered).
export function useActiveLibrary(): Library | null {
  const { libraries, activeId } = useLibraries();
  if (!activeId) return null;
  return libraries.find((l) => l.id === activeId) ?? null;
}

function pickMostRecentlyActive(libraries: Library[]): string | null {
  if (libraries.length === 0) return null;
  let best = libraries[0];
  for (const l of libraries) {
    if (l.lastActiveAt > best.lastActiveAt) best = l;
  }
  return best.id;
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
