import { useEffect, useRef } from "react";
import { useNotes } from "../../context/useNotes";
import NoteCard from "./NoteCard";
import {
  Plus,
  Search,
  Trash2,
  Pin,
  Sparkles,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

export default function NotesGrid() {
  const {
    filteredNotes,
    activeView,
    setActiveView,
    search,
    setSearch,
    selectedColor,
    setSelectedColor,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    createNote,
    emptyTrash,
    activeLetterFilter,
    setActiveLetterFilter,
  } = useNotes();
  const searchInputRef = useRef(null);

  const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

  function handleCreateNote() {
    if (activeView === "Welcome") setActiveView("All Notes");
    createNote();
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const panelHeader = (
    <header className="notes-panel-header">
      <div className="notes-panel-title-row">
        <div>
          <span className="notes-panel-eyebrow">YOUR NOTES</span>
          <h2>{activeView}</h2>
          <p>
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <button
          type="button"
          className="notes-panel-new-note"
          onClick={handleCreateNote}
          aria-label="Create a new note"
        >
          <Plus size={16} />
          <span>New note</span>
        </button>
      </div>

      <div className="notes-panel-search">
        <Search size={16} aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Search notes... (⌘K)"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search notes by title, content, or tags"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd>⌘K</kbd>
        )}
      </div>

      <div className="notes-panel-controls">
        <label className="notes-panel-control">
          <span>Sort</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort notes"
          >
            <option value="az">Title A–Z</option>
            <option value="za">Title Z–A</option>
            <option value="recent">Recently Updated</option>
            <option value="created">Date Created</option>
            <option value="reminder">Due Date</option>
          </select>
        </label>
        <label className="notes-panel-control notes-panel-color-control">
          <span>Color</span>
          <select
            value={selectedColor}
            onChange={(event) => setSelectedColor(event.target.value)}
            aria-label="Filter by color"
          >
            <option value="all">All colors</option>
            <option value="violet">Violet</option>
            <option value="blue">Blue</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
            <option value="cyan">Cyan</option>
          </select>
        </label>
        <div className="notes-panel-view-toggle" aria-label="Notes layout">
          <button
            type="button"
            className={viewMode === "list" ? "is-active" : ""}
            onClick={() => setViewMode("list")}
            title="List view"
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className={viewMode === "grid" ? "is-active" : ""}
            onClick={() => setViewMode("grid")}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>
    </header>
  );

  if (activeView === "Welcome") {
    return (
      <>
        {panelHeader}
        <div className="workspace-welcome-state">
          <div className="workspace-welcome-icon">
            <Sparkles size={24} />
          </div>
          <span className="notes-panel-eyebrow">A FRESH START</span>
          <h3>Your workspace is ready.</h3>
          <p>Choose a section from the sidebar or open all your notes to get started.</p>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setActiveView("All Notes")}
          >
            Browse All Notes
          </button>
        </div>
      </>
    );
  }

  // Empty state messages
  if (filteredNotes.length === 0) {
    return (
      <>
        {panelHeader}
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

          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {panelHeader}
      <div className={`notes-container view-${viewMode}`}>
      {/* Alphabetical Order Quick Jump Navigation Bar */}
      {!isTrash && !isArchive && (sortBy === "az" || sortBy === "za") && (
        <div className="notesgrid-alphabet-bar">
          <div className="alphabet-bar-header">
            <span className="alphabet-bar-title">
              <strong>Alphabetical Order ({sortBy === "az" ? "A &rarr; Z" : "Z &rarr; A"})</strong>
            </span>
            {activeLetterFilter.toLowerCase() !== "all" && (
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
                className={`grid-letter-pill ${
                  activeLetterFilter.toLowerCase() === letter.toLowerCase()
                    ? "is-active"
                    : ""
                }`}
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

        </div>
      </section>
      </div>
    </>
  );
}
