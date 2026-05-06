// Audio file extensions we recognise during the folder walk. Matches the
// audiophile-DAP set the M500 supports; case-insensitive comparison.
const AUDIO_EXTS = new Set([
  ".mp3",
  ".m4a",
  ".aac",
  ".alac",
  ".flac",
  ".wav",
  ".aif",
  ".aiff",
  ".ogg",
  ".opus",
  ".wma",
  ".dsf",
  ".dff",
]);

// Filename stems we accept as a folder's cover image, in priority order.
// Lower index = preferred match; e.g. `cover.jpg` wins over `folder.jpg`
// when both exist in the same directory. Match is case-insensitive.
const COVER_STEMS = ["cover", "folder", "album", "front"];
const COVER_RE = new RegExp(`^(${COVER_STEMS.join("|")})\\.(jpg|jpeg|png|webp)$`, "i");

export type AudioTrack = {
  // Identifier of the library root this track belongs to. Lets persisted
  // playback state (track + offset) round-trip through IDB without having
  // to also persist a separate "which library" pointer.
  rootId: string;
  // Original filename including extension (e.g. "01 - World Is Mine.flac").
  filename: string;
  // Filename with extension stripped, used as the visible title until tag
  // parsing lands.
  title: string;
  // Uppercased file extension without the dot (e.g. "FLAC", "MP3"). Lets
  // the track row surface the audio format without parsing tags. When the
  // filename has no extension we fall back to an empty string.
  format: string;
  // Path from the library root, excluding the file itself. Used to render
  // folder breadcrumbs and to derive album / artist heuristically.
  folderPath: string[];
  // The file handle itself — opened lazily by the playback layer.
  handle: FileSystemFileHandle;
  // Persisted alongside the track so cover blob URLs can be regenerated
  // after IDB rehydrate (blob URLs themselves don't survive a reload).
  coverHandle?: FileSystemFileHandle;
  // Cover URL inherited from the parent folder when one was detected
  // during the walk. Lets the player surface artwork without re-walking
  // back up the tree at play time. Re-created from `coverHandle` after a
  // cache hydrate, so it's always live for the current session.
  coverUrl?: string;
};

export type FolderNode = {
  // Identifier of the library root this folder belongs to (same value on
  // every node in a given tree). Read from `rootId` on the top-level node
  // when a route needs to know which library it's looking at.
  rootId: string;
  // The folder's own name. The root's name is whatever the user picked
  // (e.g. "Music"); subfolders carry their dirent name.
  name: string;
  // Path from the library root, *including* this folder's name. Empty array
  // for the root itself.
  path: string[];
  // Subfolders, sorted alphabetically.
  folders: FolderNode[];
  // Audio files directly inside this folder, sorted alphabetically. Files
  // with non-audio extensions are skipped at scan time.
  tracks: AudioTrack[];
  // Persisted alongside the folder so cover blob URLs can be regenerated
  // after an IDB hydrate.
  coverHandle?: FileSystemFileHandle;
  // Blob URL of the folder's cover image, if one was detected during the
  // walk (a `cover.jpg` / `folder.jpg` / `album.jpg` / `front.jpg` sibling
  // of the audio files). Created via `URL.createObjectURL` and never
  // revoked — leaks until next page load. Acceptable for the typical
  // hundred-folder library; revisit if scan ever rebuilds in-place.
  coverUrl?: string;
};

// Recursive walk of a `FileSystemDirectoryHandle`. Errors on individual
// entries (permission, transient I/O) are swallowed so a single bad child
// doesn't abort the whole scan; the rest of the tree comes back as usual.
//
// `rootId` is stamped on every node and track so the resulting tree —
// including any cached copy round-tripped through IDB — knows which
// library it belongs to.
export async function walkLibrary(
  root: FileSystemDirectoryHandle,
  rootId: string,
): Promise<FolderNode> {
  return walk(root, [], rootId);
}

async function walk(
  dir: FileSystemDirectoryHandle,
  prefix: string[],
  rootId: string,
): Promise<FolderNode> {
  const folders: FolderNode[] = [];
  const tracks: AudioTrack[] = [];
  const here = [...prefix, dir.name];

  // Two-phase walk:
  //  1. Collect all child names via `keys()` (lighter-weight than `entries()`
  //     and more reliable on Chromium builds where the entries iterator
  //     silently drops items with certain Unicode in filenames — see
  //     https://github.com/dohaicuong/miku-amp scan-debug logs).
  //  2. Resolve each name to a handle via `getFileHandle` / `getDirectoryHandle`.
  //     Per-name failures are isolated so one bad child doesn't kill the rest.
  const names: string[] = [];
  try {
    for await (const name of dir.keys()) {
      names.push(name);
    }
  } catch (err) {
    console.warn(`[miku-amp] scan keys: ${here.join("/")}:`, err);
  }

  // Cover-art handle picked during the loop — we keep the highest-priority
  // match (lower priority index = preferred; see `COVER_STEMS`) so a folder
  // with both `cover.jpg` and `folder.jpg` resolves to `cover.jpg`.
  let coverPriority = Infinity;
  let coverHandle: FileSystemFileHandle | undefined;

  for (const name of names) {
    try {
      if (isAudioFile(name)) {
        // Optimistic: name looks like an audio file → resolve as file.
        const handle = await dir.getFileHandle(name);
        tracks.push({
          rootId,
          filename: name,
          title: stripExtension(name),
          format: extensionLabel(name),
          folderPath: here,
          handle,
        });
        continue;
      }
      // Cover-art candidate? Stash the handle; we resolve to a blob URL
      // after the loop so we only do it for the chosen winner.
      const matchPriority = coverMatchPriority(name);
      if (matchPriority >= 0 && matchPriority < coverPriority) {
        try {
          coverHandle = await dir.getFileHandle(name);
          coverPriority = matchPriority;
          continue;
        } catch {
          // Fall through — was named like a cover but isn't a file.
        }
      }
      // Either a directory or a non-audio file. Try directory first; fall
      // through to file (and ignore) if it isn't a directory.
      try {
        const subDir = await dir.getDirectoryHandle(name);
        const child = await walk(subDir, here, rootId);
        folders.push(child);
      } catch {
        // Non-audio file (cuesheet, log, booklet, etc.) — skip silently.
      }
    } catch (err) {
      console.warn(`[miku-amp] scan entry: ${here.join("/")}/${name}:`, err);
    }
  }

  let coverUrl: string | undefined;
  if (coverHandle) {
    try {
      const file = await coverHandle.getFile();
      coverUrl = URL.createObjectURL(file);
    } catch (err) {
      console.warn(`[miku-amp] scan cover: ${here.join("/")}:`, err);
    }
  }

  // Stamp the resolved cover onto each track so the player has artwork
  // without walking back up the tree at play time. The cover *handle* is
  // also stamped so a hydrate from IDB can rebuild blob URLs without
  // re-walking the parent folder.
  if (coverHandle) {
    for (const t of tracks) {
      t.coverHandle = coverHandle;
      if (coverUrl) t.coverUrl = coverUrl;
    }
  }

  console.log(
    `[miku-amp] scan: ${here.join("/") || "(root)"}: ${names.length} names, ${tracks.length} audio, ${folders.length} subdirs${coverUrl ? ", cover" : ""}`,
  );

  folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  tracks.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  return {
    rootId,
    name: dir.name,
    path: prefix.length === 0 ? [] : here,
    folders,
    tracks,
    coverHandle,
    coverUrl,
  };
}

// Walks a cached tree and re-creates blob URLs from each `coverHandle`.
// Blob URLs from `URL.createObjectURL` don't survive a page reload, so the
// `coverUrl` stored alongside the handle in IDB is always stale on
// hydrate; this rebuilds it in-place. Tracks pick up the URL from their
// parent folder's resolved cover (same propagation as the live scan).
export async function hydrateCoverUrls(node: FolderNode): Promise<void> {
  let coverUrl: string | undefined;
  if (node.coverHandle) {
    try {
      const file = await node.coverHandle.getFile();
      coverUrl = URL.createObjectURL(file);
    } catch (err) {
      console.warn(`[miku-amp] hydrate cover: ${node.path.join("/") || "(root)"}:`, err);
    }
  }
  node.coverUrl = coverUrl;
  for (const t of node.tracks) {
    t.coverUrl = coverUrl;
  }
  for (const child of node.folders) {
    await hydrateCoverUrls(child);
  }
}

// Returns 0..N (lower = higher priority) for filenames matching one of the
// recognised cover stems, or -1 for a miss. Lets the walk pick the best
// candidate when several cover-style files coexist in a folder.
function coverMatchPriority(name: string): number {
  const m = COVER_RE.exec(name);
  if (!m) return -1;
  return COVER_STEMS.indexOf(m[1].toLowerCase());
}

function isAudioFile(name: string): boolean {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return false;
  return AUDIO_EXTS.has(name.slice(dot).toLowerCase());
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

// Uppercased extension label for the track row's tech-specs line — e.g.
// `"flac"` → `"FLAC"`. Fallback to empty when the filename has no
// extension so the row's tech-specs branch hides cleanly.
function extensionLabel(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "";
}

// Recursive count of all audio files under a node (this folder + every
// descendant). Used by the library views to surface a sense of how much
// is inside before tapping in.
export function countTracks(node: FolderNode): number {
  let total = node.tracks.length;
  for (const child of node.folders) total += countTracks(child);
  return total;
}

// Walk the tree along a breadcrumb path of folder names. Returns null if any
// segment doesn't resolve — the caller treats this as "back to root" rather
// than 404'ing.
export function findFolder(root: FolderNode, path: string[]): FolderNode | null {
  let here: FolderNode = root;
  for (const segment of path) {
    const child = here.folders.find((f) => f.name === segment);
    if (!child) return null;
    here = child;
  }
  return here;
}

// Resolve a track from a slash-joined path (e.g.
// `"Evillious Chronicles/EVILS KINGDOM/01. moonlit bear.flac"`). Returns
// null if the folder chain doesn't resolve or the leaf filename isn't
// audio in that folder. Used to restore a track from the URL after a
// refresh.
//
// The path *may* include the library root's own name as the first segment
// (the player writes it that way so the URL is human-readable). We strip
// it before walking — `findFolder` navigates via subfolders only, so a
// leading root-name segment would otherwise miss every time.
export function findTrackByPath(root: FolderNode, fullPath: string): AudioTrack | null {
  let segments = fullPath.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  if (segments[0] === root.name) segments = segments.slice(1);
  if (segments.length === 0) return null;
  const folderSegments = segments.slice(0, -1);
  const filename = segments[segments.length - 1];
  const folder = findFolder(root, folderSegments);
  if (!folder) return null;
  return folder.tracks.find((t) => t.filename === filename) ?? null;
}
