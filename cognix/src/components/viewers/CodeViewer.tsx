import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  content: string;
  language: string | null;
}

export default function CodeViewer({ content, language }: CodeViewerProps) {
  return (
    <div className="code-viewer">
      <SyntaxHighlighter
        language={language ?? "text"}
        style={oneDark}
        showLineNumbers
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          padding: "16px",
          background: "transparent",
          fontSize: "13px",
          minHeight: "100%",
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
