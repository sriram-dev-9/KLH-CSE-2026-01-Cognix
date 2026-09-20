import type { FolderEntry } from "../types/file";
import FileTree from "./FileTree";

interface FileExplorerProps {
  root: FolderEntry | null;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onToggleFolder: (folder: FolderEntry) => void;
  onSelectFile: (path: string) => void;
  onAddFolder: () => void;
  loadingPath: string | null;
  error: string | null;
}

export default function FileExplorer({
  root,
  selectedPath,
  expandedPaths,
  onToggleFolder,
  onSelectFile,
  onAddFolder,
  loadingPath,
  error,
}: FileExplorerProps) {
  return (
    <aside className="explorer">
      <div className="explorer__header">
        <span>File Explorer</span>
      </div>
      <div className="explorer__body">
        {error && <div className="explorer__error">{error}</div>}
        {!error && !root && (
          <div className="empty-state empty-state--sidebar">
            <p>Open a folder to get started</p>
            <button className="btn btn--primary" onClick={onAddFolder}>
              Add Folder
            </button>
          </div>
        )}
        {!error && root && (
          <FileTree
            entries={root.children}
            selectedPath={selectedPath}
            expandedPaths={expandedPaths}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
            loadingPath={loadingPath}
          />
        )}
      </div>
    </aside>
  );
}
