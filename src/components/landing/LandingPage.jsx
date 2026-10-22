import { useState, useRef } from "react";
import { useNotes } from "../../context/useNotes";
import { useAuth } from "../../context/useAuth";
import NoteCard from "../notes/NoteCard";
import {
  Plus,
  Upload,
  FileText,
  FileCheck2,
  CheckSquare,
  Bell,
  FolderOpen,
  Search,
  ArrowRight,
  LayoutGrid,
  LogOut,
  Moon,
  Sun,
  X,
  FileUp,
  Star,
  Pin,
} from "lucide-react";

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

export default function LandingPage({
  onEnterWorkspace,
  dark,
  onToggleTheme,
  onOpenProfileModal,
}) {
  const {
    notes,
    filteredNotes,
    createNote,
    setUploadModalOpen,
    activeLetterFilter,
    setActiveLetterFilter,
    stats,
    importMultipleFiles,
    search,
    setSearch,
    setActiveView,
  } = useNotes();

  const { currentUser, logout } = useAuth();
  const fileDropInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Drag and Drop handlers on landing page
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      setUploading(true);
      await importMultipleFiles(files);
      setUploading(false);
    }
  }

  async function handleFileInputChange(e) {
    const files = e.target.files;
    if (files && files.length) {
      setUploading(true);
      await importMultipleFiles(files);
      setUploading(false);
      e.target.value = "";
    }
  }

  // Active notes count
  const nonDeletedNotes = notes.filter((n) => !n.deleted && !n.archived);
  const previewNote = nonDeletedNotes[0];
  const previewContent = (previewNote?.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Group notes count by letter for badge indicators
  const letterCounts = nonDeletedNotes.reduce((acc, note) => {
    const clean = (note.title || "Untitled").replace(/^[^a-zA-Z0-9]+/, "").trim();
    const firstChar = clean.charAt(0).toUpperCase();
    if (/[A-Z]/.test(firstChar)) {
      acc[firstChar] = (acc[firstChar] || 0) + 1;
    } else {
      acc["#"] = (acc["#"] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className={`landing-page-shell ${dark ? "dark" : ""}`}>
      <header className="landing-top-navbar">
        <div className="landing-brand-group">
          <div className="landing-logo-icon" aria-hidden="true">
            <FileText size={21} />
          </div>
          <span className="landing-brand-title">
            Note<span className="brand-accent">space</span>
          </span>
        </div>

        <div className="landing-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="landing-search-input"
            aria-label="Search your notes"
            placeholder="Search your notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-ghost-btn"
            onClick={onToggleTheme}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            id="btn-open-workspace"
            className="landing-primary-nav-btn"
            onClick={onEnterWorkspace}
          >
            <LayoutGrid size={16} />
            <span>Open My Workspace</span>
          </button>

          <div
            className="landing-user-chip"
            onClick={onOpenProfileModal}
            style={{ cursor: "pointer" }}
            title="View Profile & Settings"
            role="button"
            tabIndex={0}
          >
            <div className="user-avatar-dot">{currentUser?.avatar || "U"}</div>
            <span className="user-name-text">{currentUser?.name || "User"}</span>
            <button
              type="button"
              id="btn-landing-logout"
              className="landing-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Sign Out to Login Page"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main-container">
        <section className="landing-hero-banner">
          <div className="hero-text-col landing-hero-copy">
            <div className="hero-welcome-badge">
              <span>YOUR SPACE FOR IDEAS</span>
            </div>
            <h1 className="hero-greeting">
              A calmer space for every thought.
            </h1>
            <p className="hero-tagline">
              Bring notes, documents, and the details of your day together in one thoughtfully organized workspace.
            </p>

            <div className="hero-action-buttons">
              <button
                type="button"
                id="btn-hero-open-workspace"
                className="primary-btn hero-launch-btn"
                onClick={onEnterWorkspace}
              >
                <LayoutGrid size={18} />
                <span>Open My Workspace</span>
              </button>

              <button
                type="button"
                id="btn-hero-upload"
                className="secondary-btn hero-upload-btn"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload size={18} />
                <span>Import documents</span>
              </button>
            </div>

            <button
              type="button"
              className="landing-create-note-link"
              onClick={() => createNote()}
            >
              <Plus size={16} />
              <span>Create a new note</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="landing-product-preview" aria-label="Preview of your Notespace notes">
            <div className="landing-preview-topbar">
              <div className="landing-preview-dots" aria-hidden="true"><i /><i /><i /></div>
              <span>NOTESPACE</span>
              <span className="landing-preview-count">{nonDeletedNotes.length} notes</span>
            </div>
            <div className="landing-preview-content">
              <div className="landing-preview-sidebar" aria-hidden="true">
                <span className="is-active"><FileText size={15} /> All notes</span>
                <span><Star size={15} /> Favorites</span>
                <span><Pin size={15} /> Pinned</span>
                <span><FolderOpen size={15} /> Folders</span>
              </div>
              <div className="landing-preview-notes">
                <div className="landing-preview-heading">
                  <div>
                    <span>YOUR LIBRARY</span>
                    <strong>Recent notes</strong>
                  </div>
                  <button type="button" onClick={onEnterWorkspace}>View all <ArrowRight size={14} /></button>
                </div>
                {nonDeletedNotes.length ? (
                  nonDeletedNotes.slice(0, 3).map((note) => (
                    <article className="landing-preview-note" key={note.id}>
                      <span className="landing-preview-note-icon"><FileText size={15} /></span>
                      <span className="landing-preview-note-title">{note.title?.trim() || "Untitled note"}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </article>
                  ))
                ) : (
                  <div className="landing-preview-empty">
                    <FileText size={19} />
                    <span>Your notes will appear here</span>
                  </div>
                )}
              </div>
              <div className="landing-preview-editor" aria-hidden="true">
                <div className="landing-preview-editor-toolbar">
                  <span>B</span>
                  <i />
                  <span className="is-italic">I</span>
                  <i />
                  <span className="landing-preview-list-icon"><b /><b /><b /></span>
                </div>
                <h3>{previewNote?.title?.trim() || "A note of your own"}</h3>
                {previewContent ? (
                  <p>{previewContent.slice(0, 180)}</p>
                ) : (
                  <div className="landing-preview-editor-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                <div className="landing-preview-save-state"><span /> Your notes, in sync</div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-capabilities" aria-labelledby="landing-capabilities-title">
          <div className="landing-section-heading">
            <span>MADE FOR YOUR WORKFLOW</span>
            <h2 id="landing-capabilities-title">Everything has its place.</h2>
            <p>Simple tools to keep your ideas easy to find and ready when you need them.</p>
          </div>
          <div className="landing-capability-grid">
            <article className="landing-capability-card">
              <span className="landing-capability-icon"><FolderOpen size={19} /></span>
              <h3>Folders that fit your flow</h3>
              <p>Group notes into folders that make sense for your projects and life.</p>
            </article>
            <article className="landing-capability-card">
              <span className="landing-capability-icon"><Search size={19} /></span>
              <h3>Find it in a moment</h3>
              <p>Search across your notes and keep the right detail close at hand.</p>
            </article>
            <article className="landing-capability-card">
              <span className="landing-capability-icon"><Star size={19} /></span>
              <h3>Keep key notes close</h3>
              <p>Favorite or pin the notes you return to most often.</p>
            </article>
            <article className="landing-capability-card">
              <span className="landing-capability-icon"><FileUp size={19} /></span>
              <h3>Bring documents along</h3>
              <p>Import supported documents and keep them alongside your notes.</p>
            </article>
          </div>
        </section>

        <section className="landing-overview-section" aria-label="Workspace overview">
          <div className="landing-section-heading landing-overview-heading">
            <span>YOUR NOTESPACE</span>
            <h2>Your workspace at a glance.</h2>
            <p>Jump straight into the notes, documents, and tasks you care about.</p>
          </div>
          <div className="hero-metrics-grid">
            <div
              className="metric-box box-violet interactive-metric"
              onClick={() => {
                setActiveView("All Notes");
                onEnterWorkspace();
              }}
              title="Click to view all notes in Alphabetical Order"
              role="button"
              tabIndex={0}
            >
              <div className="metric-icon-wrap">
                <FileText size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-number">{stats.total}</span>
                <span className="metric-label">Alphabetical Notes</span>
              </div>
            </div>

            <div
              className="metric-box box-rose interactive-metric"
              onClick={() => {
                setActiveView("PDF & Docs");
                onEnterWorkspace();
              }}
              title="Click to view all PDF notes and document uploads"
              role="button"
              tabIndex={0}
            >
              <div className="metric-icon-wrap">
                <FileCheck2 size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-number">{stats.pdfNotes || 0}</span>
                <span className="metric-label">PDF &amp; Documents</span>
              </div>
            </div>

            <div
              className="metric-box box-emerald interactive-metric"
              onClick={() => {
                setActiveView("Tasks");
                onEnterWorkspace();
              }}
              title="Click to view task checklists"
              role="button"
              tabIndex={0}
            >
              <div className="metric-icon-wrap">
                <CheckSquare size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-number">
                  {stats.tasksCompleted} / {stats.tasksCount}
                </span>
                <span className="metric-label">Tasks Completed</span>
              </div>
            </div>

            <div
              className="metric-box box-amber interactive-metric"
              onClick={() => {
                setActiveView("Reminders");
                onEnterWorkspace();
              }}
              title="Click to view scheduled reminders"
              role="button"
              tabIndex={0}
            >
              <div className="metric-icon-wrap">
                <Bell size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-number">{stats.remindersCount}</span>
                <span className="metric-label">Due Reminders</span>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Format Upload Dropzone Banner */}
        <section
          className={`landing-upload-dropzone-section ${isDragging ? "is-dragover" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileDropInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileDropInputRef}
            style={{ display: "none" }}
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.markdown,.csv,.json,image/*"
            onChange={handleFileInputChange}
          />
          <div className="dropzone-inner-content">
            <div className="dropzone-animated-icon">
              <FileUp size={34} />
            </div>
            <div className="dropzone-text-group">
              <h3>
                {uploading
                  ? "Importing & formatting your notes..."
                  : "Upload PDF Notes & Other Document Formats"}
              </h3>
              <p>
                Drop files here or click to browse. Import supported documents and keep your work together in one place.
              </p>
            </div>
            <div className="supported-formats-pills">
              <span className="format-tag tag-pdf">PDF</span>
              <span className="format-tag tag-docx">DOCX</span>
              <span className="format-tag tag-md">MARKDOWN</span>
              <span className="format-tag tag-txt">TXT</span>
              <span className="format-tag tag-csv">CSV</span>
              <span className="format-tag tag-json">JSON</span>
            </div>
          </div>
        </section>

        {/* Alphabetical Order Browser Header & Letter Jump Bar */}
        <section className="alphabetical-browser-section">
          <div className="browser-header-row">
            <div>
              <div className="browser-eyebrow">
                <span className="alphabet-icon">A &rarr; Z</span>
                <span>ORGANIZED REPOSITORY</span>
              </div>
              <h2 className="browser-title">Your notes, in one place</h2>
              <p className="browser-subtitle">
                Browse alphabetically or jump straight to the note you need.
              </p>
            </div>

            <div className="browser-meta-info">
              <span className="notes-counter-badge">
                Showing {filteredNotes.length} of {stats.total} notes
              </span>
            </div>
          </div>

          {/* Letter Jump Pills Bar (A, B, C... Z, #) */}
          <div className="alphabet-letter-pills-bar" role="navigation" aria-label="Alphabetical jump filter">
            {ALPHABET.map((letter) => {
              const isActive = activeLetterFilter === letter;
              const count = letter === "All" ? nonDeletedNotes.length : (letterCounts[letter] || 0);
              const isDisabled = letter !== "All" && count === 0;

              return (
                <button
                  key={letter}
                  type="button"
                  className={`letter-pill-btn ${isActive ? "is-active" : ""} ${isDisabled ? "is-disabled" : ""}`}
                  onClick={() => setActiveLetterFilter(letter)}
                  disabled={isDisabled}
                  title={letter === "All" ? "View all notes" : `Jump to letter ${letter} (${count} notes)`}
                >
                  <span className="letter-char">{letter}</span>
                  {count > 0 && <span className="letter-count-bubble">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicator */}
          {activeLetterFilter !== "All" && (
            <div className="active-letter-filter-alert">
              <span>
                Filtered by letter: <strong>"{activeLetterFilter}"</strong> ({filteredNotes.length} notes found)
              </span>
              <button
                type="button"
                className="clear-letter-btn"
                onClick={() => setActiveLetterFilter("All")}
              >
                Clear Letter Filter
              </button>
            </div>
          )}

          {/* Notes Grid Display */}
          {filteredNotes.length === 0 ? (
            <div className="empty-alphabetical-state">
              <div className="empty-icon-wrap">
                <FileText size={38} />
              </div>
              <h3>No notes starting with "{activeLetterFilter}"</h3>
              <p>You can create a new note with this letter or upload a document to get started.</p>
              <div className="empty-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => createNote({ title: `${activeLetterFilter} - New Note` })}
                >
                  <Plus size={16} /> Create Note Starting with {activeLetterFilter}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setActiveLetterFilter("All")}
                >
                  View All Notes
                </button>
              </div>
            </div>
          ) : (
            <div className="landing-notes-grid">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Notespace · A little more clarity, every day.
        </p>
      </footer>
    </div>
  );
}
