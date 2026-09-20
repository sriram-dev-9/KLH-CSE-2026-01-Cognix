import { useState } from "react";
import CodeViewer from "./CodeViewer";

interface HtmlViewerProps {
  content: string;
}

export default function HtmlViewer({ content }: HtmlViewerProps) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="html-viewer">
      <div className="html-viewer__toolbar">
        <button
          type="button"
          className={`toggle-btn${!showSource ? " toggle-btn--active" : ""}`}
          onClick={() => setShowSource(false)}
        >
          Preview
        </button>
        <button
          type="button"
          className={`toggle-btn${showSource ? " toggle-btn--active" : ""}`}
          onClick={() => setShowSource(true)}
        >
          Source
        </button>
      </div>
      {showSource ? (
        <CodeViewer content={content} language="markup" />
      ) : (
        <iframe
          className="html-viewer__frame"
          srcDoc={content}
          sandbox=""
          title="HTML preview"
        />
      )}
    </div>
  );
}
