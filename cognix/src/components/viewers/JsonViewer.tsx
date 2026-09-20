import { useMemo } from "react";
import CodeViewer from "./CodeViewer";

interface JsonViewerProps {
  content: string;
}

export default function JsonViewer({ content }: JsonViewerProps) {
  const { formatted, parseError } = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return { formatted: JSON.stringify(parsed, null, 2), parseError: null as string | null };
    } catch (err) {
      return {
        formatted: content,
        parseError: err instanceof Error ? err.message : "Invalid JSON",
      };
    }
  }, [content]);

  return (
    <div className="json-viewer">
      {parseError && (
        <div className="banner banner--warning">
          Could not parse as JSON ({parseError}). Showing raw content below.
        </div>
      )}
      <CodeViewer content={formatted} language="json" />
    </div>
  );
}
