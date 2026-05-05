/*
 * IndexedDB stash for the library's `FileSystemDirectoryHandle` so a page
 * reload doesn't kick the user back to the landing screen.
 *
 * Permission is *not* persisted — the handle survives the reload but its
 * permission grant resets to "prompt" by default in Chromium. The provider
 * (`library-handle.tsx`) handles re-requesting permission on user gesture
 * via the `Continue with <folder>` CTA on the landing screen.
 */
const DB_NAME = "miku-amp";
const DB_VERSION = 1;
const STORE = "library";
const HANDLE_KEY = "root";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      // Single object store keyed by string. Today only the root handle
      // lives here; later we can keep parsed library + scan timestamp too.
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

export async function saveLibraryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.put(handle, HANDLE_KEY));
  } catch (err) {
    // IDB can be unavailable in private mode / corrupted state. Persistence
    // is a nice-to-have; don't surface the failure to the user.
    console.warn("[miku-amp] saveLibraryHandle:", err);
  }
}

export async function loadLibraryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await withStore<unknown>("readonly", (store) => store.get(HANDLE_KEY));
    return (handle as FileSystemDirectoryHandle | undefined) ?? null;
  } catch (err) {
    console.warn("[miku-amp] loadLibraryHandle:", err);
    return null;
  }
}

export async function clearLibraryHandle(): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(HANDLE_KEY));
  } catch (err) {
    console.warn("[miku-amp] clearLibraryHandle:", err);
  }
}
