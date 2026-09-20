interface PdfViewerProps {
  src: string;
  name: string;
}

export default function PdfViewer({ src, name }: PdfViewerProps) {
  return (
    <div className="pdf-viewer">
      <iframe src={src} title={name} className="pdf-viewer__frame" />
    </div>
  );
}
