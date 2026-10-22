import { X, Download } from "lucide-react";

export default function ImageLightbox({ attachment, onClose }) {
  if (!attachment) return null;

  return (
    <div
      className="modal-backdrop lightbox-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lightbox-container" role="dialog" aria-modal="true">
        <header className="lightbox-header">
          <span className="lightbox-filename">{attachment.name}</span>
          <div className="lightbox-actions">
            <a
              href={attachment.dataUrl}
              download={attachment.name}
              className="icon-btn download-btn"
              title="Download image"
            >
              <Download size={18} />
            </a>
            <button
              type="button"
              className="icon-btn close-btn"
              onClick={onClose}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="lightbox-content">
          <img src={attachment.dataUrl} alt={attachment.name} className="lightbox-image" />
        </div>
      </div>
    </div>
  );
}
