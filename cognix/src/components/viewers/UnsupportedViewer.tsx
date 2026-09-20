import { formatBytes } from "../../utils/fileSystem";

interface UnsupportedViewerProps {
  name: string;
  extension: string;
  size: number | null;
}

export default function UnsupportedViewer({ name, extension, size }: UnsupportedViewerProps) {
  return (
    <div className="empty-state">
      <p>This file type cannot be previewed.</p>
      <dl className="unsupported-meta">
        <dt>File name</dt>
        <dd>{name}</dd>
        <dt>Extension</dt>
        <dd>{extension ? `.${extension}` : "none"}</dd>
        {size !== null && (
          <>
            <dt>File size</dt>
            <dd>{formatBytes(size)}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
