/*
 * IndexedDB persistence for the app:
 *
 *   - `libraries`         — every library the user has registered (id,
 *                           directory handle, cached folder tree, scan
 *                           timestamp, last-active timestamp). Trees are
 *                           cached so route changes and reloads don't
 *                           re-walk the disk.
 *   - `activeLibraryId`   — id of the library currently being browsed.
 *                           Used to auto-pick on first launch among
 *                           multiple stored libraries.
 *   - `playback`          — currently-playing track + offset, scoped to
 *                           a `rootId` so the restore lands in the right
 *                           library after rehydrate.
 *
 * The current folder path is *not* persisted here — it lives in the URL
 * (`/library/A/B`) so refresh, back/forward, and deep links all work
 * natively without our help.
 *
 * Permission grants don't persist — Chromium resets every handle's
 * permission to "prompt" on each load. The provider re-probes on
 * hydrate and surfaces a "Continue with <name>" CTA per library that
 * needs a fresh user gesture.
 */
import type { FolderNode } from "./library";

const DB_NAME = "miku-amp";
const DB_VERSION = 1;
const STORE = "library";

// Legacy key from the single-library era — we read it once on hydrate to
// migrate the lone handle into the new `libraries` list, then delete it.
const LEGACY_HANDLE_KEY = "root";

const LIBRARIES_KEY = "libraries";
const ACTIVE_LIBRARY_KEY = "activeLibraryId";
const PLAYBACK_KEY = "playback";

// Legacy key from the era when the folder path was persisted in IDB. The
// path now lives in the URL (`/library/A/B`); we drop the old entry on
// first load below to keep the store tidy.
const LEGACY_PATH_KEY = "libraryPath";

export type StoredLibrary = {
  id: string;
  handle: FileSystemDirectoryHandle;
  // Cached tree from the last successful walk. Null when the library has
  // been registered but never scanned (shouldn't happen in practice — we
  // scan immediately on add — but covers the in-flight window).
  tree: FolderNode | null;
  // Wall-clock timestamp of the last successful scan, ms since epoch.
  scannedAt: number | null;
  // Wall-clock timestamp of the last time this library was the active one.
  // Used to auto-pick the most recently used library on launch.
  lastActiveAt: number;
};

export type PlaybackState = { rootId: string; trackPath: string; t: number };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = op(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadLibraries(): Promise<StoredLibrary[]> {
  try {
    // Best-effort cleanup of the path key — its current owner is the URL.
    // Fire-and-forget; failure here is harmless.
    void withStore("readwrite", (store) => store.delete(LEGACY_PATH_KEY)).catch(() => {});

    const raw = await withStore<unknown>("readonly", (store) => store.get(LIBRARIES_KEY));
    if (Array.isArray(raw)) return raw as StoredLibrary[];

    // First-run-after-upgrade migration: if a legacy single-handle entry
    // exists, hoist it into the libraries list and drop the legacy key.
    const legacy = await withStore<unknown>("readonly", (store) => store.get(LEGACY_HANDLE_KEY));
    if (legacy && typeof legacy === "object" && "name" in (legacy as object)) {
      const migrated: StoredLibrary = {
        id: newLibraryId(),
        handle: legacy as FileSystemDirectoryHandle,
        tree: null,
        scannedAt: null,
        lastActiveAt: Date.now(),
      };
      await saveLibraries([migrated]);
      await saveActiveLibraryId(migrated.id);
      await withStore("readwrite", (store) => store.delete(LEGACY_HANDLE_KEY));
      return [migrated];
    }
    return [];
  } catch (err) {
    console.warn("[miku-amp] loadLibraries:", err);
    return [];
  }
}

export async function saveLibraries(libraries: StoredLibrary[]): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.put(libraries, LIBRARIES_KEY));
  } catch (err) {
    console.warn("[miku-amp] saveLibraries:", err);
  }
}

export async function loadActiveLibraryId(): Promise<string | null> {
  try {
    const id = await withStore<unknown>("readonly", (store) => store.get(ACTIVE_LIBRARY_KEY));
    return typeof id === "string" ? id : null;
  } catch (err) {
    console.warn("[miku-amp] loadActiveLibraryId:", err);
    return null;
  }
}

export async function saveActiveLibraryId(id: string | null): Promise<void> {
  try {
    if (id === null) {
      await withStore("readwrite", (store) => store.delete(ACTIVE_LIBRARY_KEY));
    } else {
      await withStore("readwrite", (store) => store.put(id, ACTIVE_LIBRARY_KEY));
    }
  } catch (err) {
    console.warn("[miku-amp] saveActiveLibraryId:", err);
  }
}

export async function savePlaybackState(state: PlaybackState): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.put(state, PLAYBACK_KEY));
  } catch (err) {
    console.warn("[miku-amp] savePlaybackState:", err);
  }
}

export async function loadPlaybackState(): Promise<PlaybackState | null> {
  try {
    const state = await withStore<unknown>("readonly", (store) => store.get(PLAYBACK_KEY));
    if (!state || typeof state !== "object") return null;
    const s = state as Partial<PlaybackState>;
    if (
      typeof s.rootId !== "string" ||
      typeof s.trackPath !== "string" ||
      typeof s.t !== "number"
    ) {
      return null;
    }
    return { rootId: s.rootId, trackPath: s.trackPath, t: s.t };
  } catch (err) {
    console.warn("[miku-amp] loadPlaybackState:", err);
    return null;
  }
}

export async function clearPlaybackState(): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(PLAYBACK_KEY));
  } catch (err) {
    console.warn("[miku-amp] clearPlaybackState:", err);
  }
}

// Random-ish id sufficient for our local use — IDB persistence is per-
// origin so collisions across devices don't matter. `crypto.randomUUID`
// when available, otherwise a Math.random fallback.
export function newLibraryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `lib-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
