import { useNotes } from "../../context/useNotes";
import NoteCard from "./NoteCard";
import { Plus, Search, Trash2, Pin, Sparkles } from "lucide-react";

export default function NotesGrid() {
  const {
    filteredNotes,
    activeView,
    search,
    createNote,
    emptyTrash,
    viewMode,
    sortBy,
    activeLetterFilter,
    setActiveLetterFilter,
    notes,
  } = useNotes();

  const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

  // If in standard views, separate pinned notes
  const isTrash = activeView === "Trash";
  const isArchive = activeView === "Archive";
  const isPinnedView = activeView === "Pinned";

  const pinnedNotes = !isTrash && !isArchive && !isPinnedView
    ? filteredNotes.filter((n) => n.pinned)
    : [];

  const otherNotes = !isTrash && !isArchive && !isPinnedView && pinnedNotes.length > 0
    ? filteredNotes.filter((n) => !n.pinned)
    : filteredNotes;

  // Empty state messages
  if (filteredNotes.length === 0) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <div className="empty-state-icon">
            {search ? (
              <Search size={36} />
            ) : isTrash ? (
              <Trash2 size={36} />
            ) : (
              <Sparkles size={36} />
            )}
          </div>

          <h3>
            {search
              ? `No notes matching "${search}"`
              : isTrash
              ? "Trash is empty"
              : isArchive
              ? "No archived notes"
              : `No notes in ${activeView}`}
          </h3>

          <p>
            {search
              ? "Try searching with different keywords or clearing your active filters."
              : isTrash
              ? "Notes moved to trash will appear here and can be recovered anytime."
              : isArchive
              ? "Archive notes to clear workspace clutter while keeping them accessible."
              : "Capture your ideas, brainstorm projects, and organize your tasks."}
          </p>

          {!isTrash && !isArchive && (
            <button
              type="button"
              className="primary-btn empty-create-btn"
              onClick={() => createNote()}
            >
              <Plus size={18} /> Create New Note
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`notes-container view-${viewMode}`}>
      {/* Alphabetical Order Quick Jump Navigation Bar */}
      {!isTrash && !isArchive && (sortBy === "az" || sortBy === "za") && (
        <div className="notesgrid-alphabet-bar">
          <div className="alphabet-bar-header">
            <span className="alphabet-bar-title">
              <strong>Alphabetical Order ({sortBy === "az" ? "A &rarr; Z" : "Z &rarr; A"})</strong>
            </span>
            {activeLetterFilter !== "All" && (
              <button
                type="button"
                className="clear-grid-letter-btn"
                onClick={() => setActiveLetterFilter("All")}
              >
                Clear "{activeLetterFilter}" filter
              </button>
            )}
          </div>
          <div className="alphabet-pills-row">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                className={`grid-letter-pill ${activeLetterFilter === letter ? "is-active" : ""}`}
                onClick={() => setActiveLetterFilter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trash Top Banner */}
      {isTrash && (
        <div className="trash-header-banner">
          <p>
            Deleted notes stay in Trash until permanently deleted. You can restore notes anytime.
          </p>
          <button
            type="button"
            className="danger-btn empty-trash-btn"
            onClick={emptyTrash}
          >
            <Trash2 size={15} /> Empty Trash
          </button>
        </div>
      )}

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <section className="notes-section pinned-section">
          <div className="section-title-row">
            <span className="section-label">
              <Pin size={14} className="pin-section-icon" /> Pinned Notes
            </span>
            <span className="section-count">{pinnedNotes.length}</span>
          </div>

          <div className="notes-grid">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* Other / Main Notes Section */}
      <section className="notes-section main-notes-section">
        {pinnedNotes.length > 0 && (
          <div className="section-title-row">
            <span className="section-label">Other Notes</span>
            <span className="section-count">{otherNotes.length}</span>
          </div>
        )}

        <div className="notes-grid">
          {otherNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}

          {!isTrash && !isArchive && (
            <button
              type="button"
              className="add-note-ghost-card"
              onClick={() => createNote()}
            >
              <div className="ghost-icon-wrap">
                <Plus size={24} />
              </div>
              <strong>Create a new note</strong>
              <span>Start with a fresh idea</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
