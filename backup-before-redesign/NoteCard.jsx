import { useNotes } from "../../context/useNotes";
import { formatRelativeTime, getReminderCountdown, isReminderDue } from "../../utils/dates";
import {
  Pin,
  Star,
  Clock,
  CheckSquare,
  Paperclip,
  Bell,
  Archive,
  Trash2,
  RotateCcw,
  Copy,
  MoreVertical,
  FileText,
  FileCheck2,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function NoteCard({ note }) {
  const {
    setSelectedId,
    togglePin,
    toggleFavorite,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    duplicateNote,
    toggleArchive,
    setSelectedTag,
    openPdfViewer,
  } = useNotes();

  const [menuOpen, setMenuOpen] = useState(false);

  // Strip html for clean preview text
  const cleanSnippet = (note.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tasks = note.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const attachments = note.attachments || [];
  const reminderCountdown = getReminderCountdown(note.reminder);
  const isOverdue = isReminderDue(note.reminder);

  const pdfAttachment = attachments.find(
    (a) => a.isPdf || a.type?.toLowerCase().includes("pdf") || a.name?.toLowerCase().endsWith(".pdf")
  );
  const docAttachment = attachments.find(
    (a) =>
      a.isDoc ||
      a.name?.toLowerCase().endsWith(".doc") ||
      a.name?.toLowerCase().endsWith(".docx") ||
      a.name?.toLowerCase().endsWith(".rtf") ||
      a.name?.toLowerCase().endsWith(".odt") ||
      a.type?.toLowerCase().includes("word") ||
      a.type?.toLowerCase().includes("officedocument") ||
      a.type?.toLowerCase().includes("msword")
  );
  const mdAttachment = attachments.find(
    (a) => a.name?.toLowerCase().endsWith(".md") || a.name?.toLowerCase().endsWith(".markdown")
  );
  const csvAttachment = attachments.find(
    (a) => a.name?.toLowerCase().endsWith(".csv") || a.name?.toLowerCase().endsWith(".tsv")
  );
  const txtAttachment = attachments.find(
    (a) => a.name?.toLowerCase().endsWith(".txt") || a.type?.startsWith("text/plain")
  );

  const isPdfNote = note.format === "pdf" || !!pdfAttachment;
  const isDocNote = note.format === "docx" || note.format === "doc" || !!docAttachment;

  return (
    <article
      className={`note-card card-color-${note.color || "violet"} ${
        note.pinned ? "is-pinned" : ""
      } ${note.deleted ? "is-in-trash" : ""} ${isPdfNote ? "is-pdf-card" : ""}`}
    >
      {/* Top Header */}
      <div className="note-card-top">
        <div className="folder-and-format-badges">
          <span className="card-folder-badge">
            <span className={`folder-color-dot dot-${note.color || "violet"}`} />
            {note.category || "General"}
          </span>

          {/* Document Format Badge */}
          {isPdfNote ? (
            <button
              type="button"
              className="card-format-badge badge-pdf"
              onClick={(e) => {
                e.stopPropagation();
                if (pdfAttachment?.dataUrl) {
                  openPdfViewer(pdfAttachment.dataUrl, note.title, pdfAttachment.name);
                } else {
                  setSelectedId(note.id);
                }
              }}
              title="Click to view PDF in full reader"
            >
              <FileCheck2 size={11} />
              <span>PDF</span>
            </button>
          ) : isDocNote ? (
            <span className="card-format-badge badge-docx">DOCX</span>
          ) : note.format === "markdown" || !!mdAttachment ? (
            <span className="card-format-badge badge-md">MD</span>
          ) : note.format === "csv" || !!csvAttachment ? (
            <span className="card-format-badge badge-csv">CSV</span>
          ) : note.format === "txt" || !!txtAttachment ? (
            <span className="card-format-badge badge-txt">TXT</span>
          ) : null}
        </div>

        <div className="card-top-actions">
          {/* Reminder Badge */}
          {note.reminder && note.reminder.active && (
            <span
              className={`card-reminder-pill ${isOverdue ? "pill-overdue" : "pill-upcoming"}`}
              title={`Reminder: ${note.reminder.date} at ${note.reminder.time || "09:00"}`}
            >
              <Bell size={12} />
              <span>{isOverdue ? "Overdue" : reminderCountdown?.text || "Reminder"}</span>
            </span>
          )}

          {!note.deleted && (
            <>
              <button
                type="button"
                className={`card-icon-btn ${note.pinned ? "is-pinned-active" : ""}`}
                title={note.pinned ? "Unpin note" : "Pin note"}
                aria-label="Pin note"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(note.id);
                }}
              >
                <Pin size={15} />
              </button>

              <button
                type="button"
                className={`card-icon-btn ${note.favorite ? "is-fav-active" : ""}`}
                title={note.favorite ? "Remove from favorites" : "Mark as favorite"}
                aria-label="Favorite note"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(note.id);
                }}
              >
                <Star size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Clickable Note Body */}
      <div
  className="note-card-body"
  role="button"
  tabIndex={0}
  onClick={() => setSelectedId(note.id)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedId(note.id);
    }
  }}
>
        <h3 className="note-card-title">{note.title || "Untitled Note"}</h3>

        <p className="note-card-snippet">
          {cleanSnippet || <span className="empty-content-placeholder">No additional text</span>}
        </p>

        {/* Task Checklist mini progress */}
        {tasks.length > 0 && (
          <div className="card-tasks-indicator">
            <CheckSquare size={14} className="task-indicator-icon" />
            <span className="task-indicator-text">
              {completedTasks}/{tasks.length} tasks
            </span>
            <div className="card-task-bar">
              <div
                className="card-task-bar-fill"
                style={{ width: `${Math.round((completedTasks / tasks.length) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Attachments preview indicator */}
        {attachments.length > 0 && (
          <div className="card-attachments-indicator">
            <Paperclip size={13} />
            <span>
              {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {/* Tags list */}
        {note.tags && note.tags.length > 0 && (
          <div className="card-tags-list">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="card-tag-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTag(tag);
                }}
                title={`Filter by tag #${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="note-card-footer">
        <span className="card-updated-time">
          <Clock size={12} /> {formatRelativeTime(note.updatedAt || note.createdAt)}
        </span>

        {note.deleted ? (
          <div className="trash-card-actions">
            <button
              type="button"
              className="card-quick-btn restore-btn"
              onClick={() => restoreNote(note.id)}
              title="Restore note"
            >
              <RotateCcw size={13} /> Restore
            </button>
            <button
              type="button"
              className="card-quick-btn delete-perm-btn"
              onClick={() => permanentlyDeleteNote(note.id)}
              title="Delete permanently"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        ) : (
          <div className="card-menu-container">
            <button
              type="button"
              className="card-icon-btn menu-trigger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="menu-backdrop-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="card-dropdown-menu">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateNote(note.id);
                      setMenuOpen(false);
                    }}
                  >
                    <Copy size={14} /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchive(note.id);
                      setMenuOpen(false);
                    }}
                  >
                    <Archive size={14} /> {note.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    type="button"
                    className="danger-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={14} /> Move to Trash
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
