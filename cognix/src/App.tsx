import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import FileExplorer from "./components/FileExplorer";
import FileViewer from "./components/FileViewer";
import type { FileEntry, FolderEntry, LoadedFile, TreeEntry } from "./types/file";
import {
  buildRootFolder,
  loadFile,
  readDirectoryShallow,
  supportsFileSystemAccess,
  updateFolderChildren,
} from "./utils/fileSystem";

function findEntry(entry: TreeEntry, path: string): TreeEntry | null {
  if (entry.path === path) return entry;
  if (entry.kind === "directory") {
    for (const child of entry.children) {
      const found = findEntry(child, path);
      if (found) return found;
    }
  }
  return null;
}

export default function App() {
  const [fsApiSupported] = useState(() => supportsFileSystemAccess());
  const [root, setRoot] = useState<FolderEntry | null>(null);
  const [explorerError, setExplorerError] = useState<string | null>(null);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);

  // Track the most recently created object URL so we can revoke it when a
  // new file is opened or the app unmounts, avoiding memory leaks.
  const activeObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeObjectUrl.current) {
        URL.revokeObjectURL(activeObjectUrl.current);
      }
    };
  }, []);

  const handleAddFolder = useCallback(async () => {
    if (!fsApiSupported) return;
    setExplorerError(null);
    try {
      const handle = await (window as any).showDirectoryPicker();
      const newRoot = await buildRootFolder(handle);
      setRoot(newRoot);
      setExpandedPaths(new Set());
      setSelectedPath(null);
      setLoadedFile(null);
      setFileLoadError(null);
      if (activeObjectUrl.current) {
        URL.revokeObjectURL(activeObjectUrl.current);
        activeObjectUrl.current = null;
      }
    } catch (err) {
      // AbortError happens when the user cancels the picker — not a real error.
      if (err instanceof DOMException && err.name === "AbortError") return;
      setExplorerError(
        err instanceof Error
          ? `Couldn't open that folder: ${err.message}`
          : "Couldn't open that folder."
      );
    }
  }, [fsApiSupported]);

  const handleToggleFolder = useCallback(
    async (folder: FolderEntry) => {
      const isExpanded = expandedPaths.has(folder.path);
      if (isExpanded) {
        setExpandedPaths((prev) => {
          const next = new Set(prev);
          next.delete(folder.path);
          return next;
        });
        return;
      }

      setExpandedPaths((prev) => new Set(prev).add(folder.path));

      if (!folder.loaded && root) {
        setLoadingPath(folder.path);
        try {
          const children = await readDirectoryShallow(folder.handle, folder.path);
          setRoot((prevRoot) =>
            prevRoot ? updateFolderChildren(prevRoot, folder.path, children) : prevRoot
          );
        } catch (err) {
          setExplorerError(
            err instanceof Error
              ? `Couldn't read "${folder.name}": ${err.message}`
              : `Couldn't read "${folder.name}".`
          );
        } finally {
          setLoadingPath(null);
        }
      }
    },
    [expandedPaths, root]
  );

  const handleSelectFile = useCallback(
    async (path: string) => {
      if (!root) return;
      const found = findEntry(root, path);
      if (!found || found.kind !== "file") return;

      setSelectedPath(path);
      setFileLoading(true);
      setFileLoadError(null);
      setLoadedFile(null);

      try {
        const result = await loadFile(found as FileEntry);

        if (activeObjectUrl.current) {
          URL.revokeObjectURL(activeObjectUrl.current);
          activeObjectUrl.current = null;
        }
        if (result.objectUrl) {
          activeObjectUrl.current = result.objectUrl;
        }

        setLoadedFile(result);
      } catch (err) {
        setFileLoadError(
          err instanceof Error ? err.message : "Failed to open this file."
        );
      } finally {
        setFileLoading(false);
      }
    },
    [root]
  );

  if (!fsApiSupported) {
    return (
      <div className="app app--unsupported">
        <Header onAddFolder={() => {}} folderName={null} />
        <div className="empty-state empty-state--full">
          <p>Your browser doesn't support local folder access.</p>
          <span className="empty-state__hint">
            Cognix relies on the File System Access API, which is currently
            available in Chromium-based browsers such as Chrome, Edge, and
            Brave. Please open this app in one of those browsers.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onAddFolder={handleAddFolder} folderName={root?.name ?? null} />
      <div className="app__body">
        <FileExplorer
          root={root}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onToggleFolder={handleToggleFolder}
          onSelectFile={handleSelectFile}
          onAddFolder={handleAddFolder}
          loadingPath={loadingPath}
          error={explorerError}
        />
        <FileViewer loaded={loadedFile} isLoading={fileLoading} loadError={fileLoadError} />
      </div>
    </div>
  );
}
