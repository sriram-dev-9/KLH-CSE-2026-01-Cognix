import type { FolderEntry, TreeEntry } from "../types/file";
import FileTreeItem from "./FileTreeItem";

interface FileTreeProps {
  entries: TreeEntry[];
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onToggleFolder: (folder: FolderEntry) => void;
  onSelectFile: (path: string) => void;
  loadingPath: string | null;
}

export default function FileTree({
  entries,
  selectedPath,
  expandedPaths,
  onToggleFolder,
  onSelectFile,
  loadingPath,
}: FileTreeProps) {
  return (
    <div className="file-tree">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          depth={0}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          loadingPath={loadingPath}
        />
      ))}
    </div>
  );
}
