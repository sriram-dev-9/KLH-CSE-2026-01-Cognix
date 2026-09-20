import { useState } from "react";

interface ImageViewerProps {
  src: string;
  name: string;
}

export default function ImageViewer({ src, name }: ImageViewerProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="empty-state">
        <p>This image could not be displayed.</p>
        <span className="empty-state__hint">It may be corrupted or in an unsupported format.</span>
      </div>
    );
  }

  return (
    <div className="image-viewer">
      <img src={src} alt={name} onError={() => setBroken(true)} />
    </div>
  );
}
