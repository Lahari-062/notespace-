import { useState, useRef } from "react";
import { useNotes } from "../../context/useNotes";
import { formatDateTime } from "../../utils/dates";
import {
  X,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function BackupModal({ isOpen, onClose }) {
  const {
    syncState,
    lastSyncTime,
    isOnline,
    syncNow,
    exportBackupJSON,
    importBackupJSON,
    notes,
    folders,
  } = useNotes();

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [overwriteMode, setOverwriteMode] = useState(false);

  if (!isOpen) return null;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const success = importBackupJSON(text, overwriteMode);
        if (success) {
          setImportStatus({ ok: true, msg: "Backup imported successfully!" });
        } else {
          setImportStatus({ ok: false, msg: "Failed to parse backup format." });
        }
      } catch (err) {
        setImportStatus({ ok: false, msg: err.message || "Invalid backup file." });
      }
    };
    reader.readAsText(file);
  }

  // Calculate approximate storage size in bytes
  const storageBytes = JSON.stringify(notes).length + JSON.stringify(folders).length;
  const storageKb = (storageBytes / 1024).toFixed(1);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog backup-modal" role="dialog" aria-modal="true">
        <header className="modal-header">
          <div className="backup-modal-title">
            <div className="backup-icon-preview">
              <Cloud size={20} />
            </div>
            <div>
              <h2>Cloud Storage & Backup</h2>
              <p className="modal-subtitle">
                Synchronize, export, and protect your workspace data
              </p>
            </div>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        <div className="backup-modal-content">
          {/* Cloud Sync Status Card */}
          <div className="sync-status-card">
            <div className="sync-card-header">
              <div className="sync-status-indicator">
                {syncState === "synced" ? (
                  <CloudCheck size={24} className="sync-icon-synced" />
                ) : syncState === "syncing" ? (
                  <RefreshCw size={24} className="sync-icon-syncing spin" />
                ) : (
                  <CloudOff size={24} className="sync-icon-offline" />
                )}
                <div>
                  <strong>
                    {syncState === "synced"
                      ? "Cloud Synchronized"
                      : syncState === "syncing"
                      ? "Syncing in progress..."
                      : "Offline Storage"}
                  </strong>
                  <span>
                    {isOnline
                      ? `Last synchronized: ${formatDateTime(lastSyncTime)}`
                      : "Working offline. Changes will sync when reconnected."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="primary-btn sync-action-btn"
                onClick={syncNow}
                disabled={syncState === "syncing"}
              >
                <RefreshCw size={15} className={syncState === "syncing" ? "spin" : ""} />
                {syncState === "syncing" ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>

          {/* Backup & Restore Grid */}
          <div className="backup-options-grid">
            <div className="backup-option-card">
              <div className="backup-card-icon">
                <Download size={20} />
              </div>
              <h4>Export Workspace Backup</h4>
              <p>
                Download all your notes, custom folders, tasks, and tags as a standardized JSON backup.
              </p>
              <button
                type="button"
                className="secondary-btn export-btn"
                onClick={exportBackupJSON}
              >
                <Download size={15} /> Download Backup (.json)
              </button>
            </div>

            <div className="backup-option-card">
              <div className="backup-card-icon">
                <Upload size={20} />
              </div>
              <h4>Restore from Backup</h4>
              <p>
                Import a previous Notespace backup file to restore notes and folders into your workspace.
              </p>

              <label className="checkbox-label overwrite-checkbox">
                <input
                  type="checkbox"
                  checked={overwriteMode}
                  onChange={(e) => setOverwriteMode(e.target.checked)}
                />
                <span>Replace existing workspace notes</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="secondary-btn import-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} /> Select Backup File
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              className={`backup-status-banner ${
                importStatus.ok ? "banner-success" : "banner-error"
              }`}
            >
              {importStatus.ok ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{importStatus.msg}</span>
            </div>
          )}

          {/* Storage telemetry */}
          <div className="storage-telemetry">
            <HardDrive size={15} />
            <span>
              Local storage usage: <strong>{storageKb} KB</strong> across{" "}
              <strong>{notes.length} notes</strong> and{" "}
              <strong>{folders.length} folders</strong>.
            </span>
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" className="primary-btn" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
