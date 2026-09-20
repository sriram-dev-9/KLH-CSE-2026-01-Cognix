// Core data model for the in-memory representation of the picked folder.
// We only store lightweight metadata + handles up front; actual file
// contents are read lazily when a file is opened (see utils/fileSystem.ts).

export interface FileEntry {
  kind: "file";
  name: string;
  path: string;
  handle: FileSystemFileHandle;
}

export interface FolderEntry {
  kind: "directory";
  name: string;
  path: string;
  handle: FileSystemDirectoryHandle;
  children: TreeEntry[];
  // Whether this folder's children have been enumerated yet.
  loaded: boolean;
}

export type TreeEntry = FileEntry | FolderEntry;

export type ViewerCategory =
  | "markdown"
  | "text"
  | "code"
  | "json"
  | "html"
  | "css"
  | "image"
  | "pdf"
  | "document"
  | "unsupported";

export interface LoadedFile {
  entry: FileEntry;
  category: ViewerCategory;
  language: string | null;
  size: number;
  // Exactly one of these is populated depending on category.
  textContent: string | null;
  objectUrl: string | null;
  error: string | null;
}
