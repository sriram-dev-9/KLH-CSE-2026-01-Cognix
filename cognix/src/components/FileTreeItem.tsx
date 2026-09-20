import type { FolderEntry, TreeEntry } from "../types/file";
import { getExtension } from "../utils/fileType";

interface FileTreeItemProps {
  entry: TreeEntry;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onToggleFolder: (folder: FolderEntry) => void;
  onSelectFile: (path: string) => void;
  loadingPath: string | null;
}

const FOLDER_ICON_OPEN = "📂";
const FOLDER_ICON_CLOSED = "📁";

function fileIconFor(name: string): string {
  const ext = getExtension(name);
  switch (ext) {
    case "md":
    case "markdown":
      return "📝";
    case "json":
      return "🧾";
    case "html":
    case "htm":
      return "🌐";
    case "css":
    case "scss":
      return "🎨";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
    case "ico":
      return "🖼️";
    case "pdf":
      return "📕";
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "py":
    case "java":
    case "c":
    case "cpp":
    case "h":
    case "hpp":
    case "rs":
    case "go":
    case "php":
    case "rb":
    case "swift":
    case "sh":
    case "bash":
    case "sql":
    case "yaml":
    case "yml":
    case "xml":
      return "📄";
    default:
      return "📄";
  }
}

export default function FileTreeItem({
  entry,
  depth,
  selectedPath,
  expandedPaths,
  onToggleFolder,
  onSelectFile,
  loadingPath,
}: FileTreeItemProps) {
  const indentStyle = { paddingLeft: `${depth * 16 + 10}px` };

  if (entry.kind === "directory") {
    const isExpanded = expandedPaths.has(entry.path);
    return (
      <div className="tree-node">
        <button
          type="button"
          className="tree-row tree-row--folder"
          style={indentStyle}
          onClick={() => onToggleFolder(entry)}
          title={entry.name}
        >
          <span className="tree-row__chevron">{isExpanded ? "▾" : "▸"}</span>
          <span className="tree-row__icon">
            {isExpanded ? FOLDER_ICON_OPEN : FOLDER_ICON_CLOSED}
          </span>
          <span className="tree-row__label">{entry.name}</span>
          {loadingPath === entry.path && <span className="tree-row__spinner" />}
        </button>
        {isExpanded && (
          <div className="tree-children">
            {entry.children.length === 0 && entry.loaded ? (
              <div className="tree-row tree-row--empty" style={{ paddingLeft: `${(depth + 1) * 16 + 10}px` }}>
                empty
              </div>
            ) : (
              entry.children.map((child) => (
                <FileTreeItem
                  key={child.path}
                  entry={child}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  expandedPaths={expandedPaths}
                  onToggleFolder={onToggleFolder}
                  onSelectFile={onSelectFile}
                  loadingPath={loadingPath}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === entry.path;
  return (
    <button
      type="button"
      className={`tree-row tree-row--file${isSelected ? " tree-row--selected" : ""}`}
      style={indentStyle}
      onClick={() => onSelectFile(entry.path)}
      title={entry.name}
    >
      <span className="tree-row__chevron tree-row__chevron--spacer" />
      <span className="tree-row__icon">{fileIconFor(entry.name)}</span>
      <span className="tree-row__label">{entry.name}</span>
    </button>
  );
}
