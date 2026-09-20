interface DocumentViewerProps {
  content: string;
}

export default function DocumentViewer({ content }: DocumentViewerProps) {
  return <iframe className="html-viewer__frame document-viewer" srcDoc={content} sandbox="" title="Document preview" />;
}