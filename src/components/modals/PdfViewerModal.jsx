import { useState } from "react";
import { useNotes } from "../../context/useNotes";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function PdfViewerModal({ inline = false }) {
  const { pdfViewerModal, closePdfViewer } = useNotes();
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!pdfViewerModal.isOpen || !pdfViewerModal.pdfUrl) return null;

  function handleOpenNewTab() {
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${pdfViewerModal.pdfUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  }

  function handleZoomIn() {
    setZoomLevel((prev) => Math.min(200, prev + 25));
  }

  function handleZoomOut() {
    setZoomLevel((prev) => Math.max(50, prev - 25));
  }

  return (
    <div
      className={
        inline
          ? "pdf-viewer-inline"
          : "modal-backdrop pdf-viewer-backdrop"
      }
      onMouseDown={(e) => {
        if (!inline && e.target === e.currentTarget) closePdfViewer();
      }}
    >
      <div
        className={
          inline
            ? "pdf-viewer-inline-panel"
            : "modal-dialog pdf-viewer-modal"
        }
        role={inline ? "region" : "dialog"}
        aria-label={inline ? "PDF document viewer" : undefined}
        aria-modal={inline ? undefined : "true"}
      >
        {/* Top Header */}
        <header className="pdf-viewer-header">
          <div className="pdf-viewer-title-group">
            <div className="pdf-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="pdf-doc-title">{pdfViewerModal.title || "PDF Document Viewer"}</h3>
              <span className="pdf-doc-filename">{pdfViewerModal.fileName || "document.pdf"}</span>
            </div>
          </div>

          <div className="pdf-viewer-controls">
            {/* Zoom Controls */}
            <div className="pdf-zoom-toolbar">
              <button
                type="button"
                className="icon-btn zoom-btn"
                onClick={handleZoomOut}
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="zoom-text">{zoomLevel}%</span>
              <button
                type="button"
                className="icon-btn zoom-btn"
                onClick={handleZoomIn}
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* External Tab */}
            <button
              type="button"
              className="icon-btn pdf-action-btn"
              onClick={handleOpenNewTab}
              title="Open in new window / tab"
              aria-label="Open in new tab"
            >
              <ExternalLink size={16} />
            </button>

            {/* Download */}
            <a
              href={pdfViewerModal.pdfUrl}
              download={pdfViewerModal.fileName || "document.pdf"}
              className="icon-btn pdf-action-btn"
              title="Download PDF file"
              aria-label="Download PDF"
            >
              <Download size={16} />
            </a>

            {/* Close */}
            <button
              type="button"
              className="icon-btn close-btn"
              onClick={closePdfViewer}
              aria-label="Close PDF viewer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* PDF Frame / Object Area */}
        <div className="pdf-viewer-viewport">
          <div
            className="pdf-frame-wrapper"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            <object
              data={pdfViewerModal.pdfUrl}
              type="application/pdf"
              className="pdf-embedded-object"
            >
              <iframe
                src={pdfViewerModal.pdfUrl}
                title={pdfViewerModal.title}
                className="pdf-fallback-iframe"
              >
                <p>
                  Your browser does not support embedded PDF viewing.
                  <a href={pdfViewerModal.pdfUrl} download={pdfViewerModal.fileName}>
                    Click here to download the PDF
                  </a>
                </p>
              </iframe>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
}
