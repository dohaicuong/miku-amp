/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

/*
 * Hand-rolled types for File System Access API surface that hasn't landed
 * in lib.dom.d.ts yet (`showDirectoryPicker`, `queryPermission`,
 * `requestPermission`). We use these everywhere we deal with the picker
 * and stored handles. If `@types/wicg-file-system-access` ever becomes
 * standard, this block can drop out.
 */
type FileSystemPermissionMode = "read" | "readwrite";
type FileSystemPermissionState = "granted" | "denied" | "prompt";

interface FileSystemHandle {
  queryPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<FileSystemPermissionState>;
  requestPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<FileSystemPermissionState>;
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: FileSystemPermissionMode;
  startIn?:
    | FileSystemHandle
    | "desktop"
    | "documents"
    | "downloads"
    | "music"
    | "pictures"
    | "videos";
}

interface Window {
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
}
