import { useState, useRef } from "react";
import { useNotes } from "../../context/useNotes";
import { formatFileSize } from "../../utils/dates";
import {
  X,
  Upload,
  Trash2,
  Folder,
  AlertCircle,
  FileUp,
} from "lucide-react";

export default function UploadNotesModal({ isOpen, onClose }) {
  const { folders, importMultipleFiles } = useNotes();
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id || "");
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    addFilesToQueue(files);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) {
      addFilesToQueue(files);
    }
  }

  function addFilesToQueue(files) {
    setUploadError("");
    const validFiles = files.filter((file) => {
      // 25MB safety limit
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 25MB limit.`);
        return false;
      }
      return true;
    });

    setQueuedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newlyAdded = validFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newlyAdded];
    });
  }

  function removeFileFromQueue(fileName) {
    setQueuedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  async function handleUploadAll() {
    if (!queuedFiles.length) return;
    setIsUploading(true);
    setUploadError("");

    try {
      await importMultipleFiles(queuedFiles, selectedFolderId || folders[0]?.id);
      setQueuedFiles([]);
      onClose();
    } catch (err) {
      setUploadError(err.message || "Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function getFileFormatBadge(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return { label: "PDF", color: "badge-pdf" };
      case "docx":
      case "doc":
        return { label: "DOCX", color: "badge-docx" };
      case "md":
      case "markdown":
        return { label: "MD", color: "badge-md" };
      case "txt":
        return { label: "TXT", color: "badge-txt" };
      case "csv":
      case "tsv":
        return { label: "CSV", color: "badge-csv" };
      case "json":
        return { label: "JSON", color: "badge-json" };
      default:
        return { label: ext.toUpperCase() || "FILE", color: "badge-default" };
    }
  }

  return (
    <div
      className="modal-backdrop upload-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
    >
      <div className="modal-dialog upload-notes-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <header className="modal-header">
          <div className="upload-header-title">
            <div className="upload-header-icon">
              <FileUp size={22} />
            </div>
            <div>
              <h2>Upload Notes &amp; Documents</h2>
              <p className="modal-subtitle">
                Import PDF notes, Word docs, Markdown, text files, and datasets.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn close-btn"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close upload modal"
          >
            <X size={18} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="upload-modal-body">
          {/* Target Folder Selector */}
          <div className="upload-options-row">
            <div className="form-group flex-1">
              <label htmlFor="upload-target-folder">
                <Folder size={14} />
                <span>Save to Folder</span>
              </label>
              <select
                id="upload-target-folder"
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="folder-select-input"
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            className={`upload-dropzone-large ${isDragOver ? "is-dragover" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.markdown,.csv,.json,image/*"
              onChange={handleFileSelect}
            />

            <div className="dropzone-circle-icon">
              <Upload size={28} />
            </div>

            <div className="dropzone-prompt-text">
              <h3>Choose files or drag &amp; drop here</h3>
              <p>Supports PDF, DOCX, Markdown (.md), Plain Text (.txt), CSV, and JSON (up to 25MB per file)</p>
            </div>

            {/* Supported Format Pills */}
            <div className="dropzone-format-tags">
              <span className="format-tag tag-pdf">📕 PDF Notes</span>
              <span className="format-tag tag-docx">📘 Word DOCX</span>
              <span className="format-tag tag-md">📗 Markdown</span>
              <span className="format-tag tag-txt">📙 Text File</span>
              <span className="format-tag tag-csv">📊 Spreadsheet CSV</span>
            </div>
          </div>

          {/* Error Banner */}
          {uploadError && (
            <div className="upload-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Queued Files List */}
          {queuedFiles.length > 0 && (
            <div className="queued-files-section">
              <div className="queued-files-header">
                <strong>Files to Import ({queuedFiles.length})</strong>
                <button
                  type="button"
                  className="clear-queue-btn"
                  onClick={() => setQueuedFiles([])}
                  disabled={isUploading}
                >
                  Clear all
                </button>
              </div>

              <div className="queued-files-list">
                {queuedFiles.map((file) => {
                  const badge = getFileFormatBadge(file.name);
                  return (
                    <div key={file.name} className="queued-file-row">
                      <div className="queued-file-meta">
                        <span className={`format-pill ${badge.color}`}>{badge.label}</span>
                        <div className="queued-file-info">
                          <span className="queued-file-name" title={file.name}>
                            {file.name}
                          </span>
                          <span className="queued-file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="icon-btn remove-queued-btn"
                        onClick={() => removeFileFromQueue(file.name)}
                        disabled={isUploading}
                        title="Remove file"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="modal-footer upload-modal-footer">
          <div className="upload-footer-summary">
            {queuedFiles.length > 0 ? (
              <span>
                {queuedFiles.length} file{queuedFiles.length === 1 ? "" : "s"} ready to convert into alphabetical notes
              </span>
            ) : (
              <span>Select files to begin upload</span>
            )}
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn import-submit-btn"
              onClick={handleUploadAll}
              disabled={!queuedFiles.length || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spin-dot" />
                  <span>Processing &amp; Creating Notes...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Import &amp; Create Notes</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
