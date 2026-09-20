import type { LoadedFile } from "../types/file";
import { formatBytes } from "../utils/fileSystem";
import { getExtension } from "../utils/fileType";
import MarkdownViewer from "./viewers/MarkdownViewer";
import CodeViewer from "./viewers/CodeViewer";
import TextViewer from "./viewers/TextViewer";
import JsonViewer from "./viewers/JsonViewer";
import HtmlViewer from "./viewers/HtmlViewer";
import ImageViewer from "./viewers/ImageViewer";
import PdfViewer from "./viewers/PdfViewer";
import DocumentViewer from "./viewers/DocumentViewer";
import UnsupportedViewer from "./viewers/UnsupportedViewer";

interface FileViewerProps {
  loaded: LoadedFile | null;
  isLoading: boolean;
  loadError: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  markdown: "Markdown",
  text: "Plain text",
  code: "Source code",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  image: "Image",
  pdf: "PDF",
  document: "Document",
  unsupported: "Unsupported",
};

export default function FileViewer({ loaded, isLoading, loadError }: FileViewerProps) {
  if (loadError) {
    return (
      <section className="viewer">
        <div className="viewer__body">
          <div className="empty-state">
            <p>Something went wrong opening this file.</p>
            <span className="empty-state__hint">{loadError}</span>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="viewer">
        <div className="viewer__body">
          <div className="empty-state">
            <p>Loading file…</p>
          </div>
        </div>
      </section>
    );
  }

  if (!loaded) {
    return (
      <section className="viewer">
        <div className="viewer__body">
          <div className="empty-state">
            <p>Select a file from the explorer</p>
            <span className="empty-state__hint">Its contents will render here.</span>
          </div>
        </div>
      </section>
    );
  }

  const ext = getExtension(loaded.entry.name);

  return (
    <section className="viewer">
      <div className="viewer__header">
        <div className="viewer__title">
          <span className="viewer__filename">{loaded.entry.name}</span>
          <span className="viewer__badge">{CATEGORY_LABEL[loaded.category]}</span>
        </div>
        <div className="viewer__meta">
          {loaded.entry.path}
          {loaded.size > 0 && ` · ${formatBytes(loaded.size)}`}
        </div>
      </div>
      <div className="viewer__body">
        {loaded.error ? (
          <div className="empty-state">
            <p>Couldn't preview this file.</p>
            <span className="empty-state__hint">{loaded.error}</span>
          </div>
        ) : (
          <>
            {loaded.category === "markdown" && loaded.textContent !== null && (
              <MarkdownViewer content={loaded.textContent} />
            )}
            {loaded.category === "text" && loaded.textContent !== null && (
              <TextViewer content={loaded.textContent} />
            )}
            {loaded.category === "code" && loaded.textContent !== null && (
              <CodeViewer content={loaded.textContent} language={loaded.language} />
            )}
            {loaded.category === "css" && loaded.textContent !== null && (
              <CodeViewer content={loaded.textContent} language={loaded.language} />
            )}
            {loaded.category === "json" && loaded.textContent !== null && (
              <JsonViewer content={loaded.textContent} />
            )}
            {loaded.category === "html" && loaded.textContent !== null && (
              <HtmlViewer content={loaded.textContent} />
            )}
            {loaded.category === "image" && loaded.objectUrl && (
              <ImageViewer src={loaded.objectUrl} name={loaded.entry.name} />
            )}
            {loaded.category === "pdf" && loaded.objectUrl && (
              <PdfViewer src={loaded.objectUrl} name={loaded.entry.name} />
            )}
            {loaded.category === "document" && loaded.textContent !== null && (
              <DocumentViewer content={loaded.textContent} />
            )}
            {loaded.category === "unsupported" && (
              <UnsupportedViewer name={loaded.entry.name} extension={ext} size={loaded.size} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
