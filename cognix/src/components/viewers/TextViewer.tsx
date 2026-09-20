interface TextViewerProps {
  content: string;
}

export default function TextViewer({ content }: TextViewerProps) {
  return (
    <div className="text-viewer">
      <pre>{content}</pre>
    </div>
  );
}
