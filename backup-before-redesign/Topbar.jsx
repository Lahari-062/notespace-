import { useEffect, useRef } from "react";
import { useNotes } from "../../context/useNotes";
import { useAuth } from "../../context/useAuth";
import {
  Menu,
  Search,
  X,
  Sun,
  Moon,
  Bell,
  Cloud,
  CloudCheck,
  RefreshCw,
  LayoutGrid,
  List,
  Upload,
  Compass,
} from "lucide-react";

export default function Topbar({
  onOpenMobileSidebar,
  onOpenRemindersDrawer,
  onOpenBackupModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenLanding,
  dark,
  onToggleTheme,
}) {
  const {
    activeView,
    selectedTag,
    setSelectedTag,
    search,
    setSearch,
    sortBy,
    setSortBy,
    selectedColor,
    setSelectedColor,
    viewMode,
    setViewMode,
    syncState,
    upcomingReminders,
    setUploadModalOpen,
  } = useNotes();

  const { currentUser } = useAuth();
  const searchInputRef = useRef(null);

  // Global keyboard shortcuts (Cmd/Ctrl + K for search, Cmd/Ctrl + N for new note)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeRemindersCount = upcomingReminders.length;

  return (
    <header className="app-topbar">
      {/* Left side: Hamburger & Breadcrumbs */}
      <div className="topbar-left-cluster">
        <button
          type="button"
          className="icon-btn mobile-hamburger-btn"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumb-nav">
          <span className="breadcrumb-root">Workspace</span>
          <span className="breadcrumb-separator">/</span>
          <strong className="breadcrumb-current">{activeView}</strong>
          {selectedTag && (
            <span className="breadcrumb-tag-chip">
              #{selectedTag}
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                aria-label="Remove tag filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Center / Search Area */}
      <div className="topbar-search-cluster">
        <div className="search-input-shell">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input-field"
            placeholder="Search notes, tags, tasks... (⌘K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes by title, content, or tags"
          />

          {search ? (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="search-kbd-hint">⌘K</kbd>
          )}
        </div>
      </div>

      {/* Right Controls: Landing, Upload, Filter, View Mode, Reminders, Sync, Theme, Profile */}
      <div className="topbar-right-cluster">
        {/* Landing Hub Link */}
        {onOpenLanding && (
          <button
            type="button"
            className="topbar-landing-link-btn"
            onClick={onOpenLanding}
            title="Return to Landing Page"
          >
            <Compass size={15} />
            <span>Landing Hub</span>
          </button>
        )}

        {/* Upload Notes / Document Module Button */}
        <button
          type="button"
          className="topbar-upload-quick-btn"
          onClick={() => setUploadModalOpen(true)}
          title="Upload PDF, Word, Markdown, or text files"
        >
          <Upload size={15} />
          <span>Upload Files</span>
        </button>

        {/* Sort Dropdown */}
        <div className="topbar-select-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="topbar-sort-select"
            aria-label="Sort notes"
          >
            <option value="az">Title A–Z (Alphabetical)</option>
            <option value="za">Title Z–A</option>
            <option value="recent">Recently Updated</option>
            <option value="created">Date Created</option>
            <option value="reminder">Due Date</option>
          </select>
        </div>

        {/* Color Filter */}
        <div className="topbar-color-filter">
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="topbar-color-select"
            aria-label="Filter by color"
          >
            <option value="all">All Colors</option>
            <option value="violet">Violet</option>
            <option value="blue">Blue</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
            <option value="cyan">Cyan</option>
          </select>
        </div>

        {/* View Mode Toggle (Grid / List) */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "grid" ? "is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "list" ? "is-active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>

        {/* Reminders Button */}
        <button
          type="button"
          className="icon-btn topbar-action-btn reminder-bell-btn"
          onClick={onOpenRemindersDrawer}
          title="Reminders & Alerts"
          aria-label="Reminders"
        >
          <Bell size={18} />
          {activeRemindersCount > 0 && (
            <span className="reminder-alert-badge">{activeRemindersCount}</span>
          )}
        </button>

        {/* Cloud Sync Status Button */}
        <button
          type="button"
          className="icon-btn topbar-action-btn cloud-sync-btn"
          onClick={onOpenBackupModal}
          title="Cloud Backup & Storage"
          aria-label="Cloud sync"
        >
          {syncState === "synced" ? (
            <CloudCheck size={18} className="text-emerald" />
          ) : syncState === "syncing" ? (
            <RefreshCw size={18} className="spin text-primary" />
          ) : (
            <Cloud size={18} />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="icon-btn topbar-action-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle color theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile Avatar / Sign In */}
        {currentUser ? (
          <button
            type="button"
            className="topbar-user-avatar"
            onClick={onOpenProfileModal}
            title={`Account: ${currentUser.name}`}
            aria-label="Open profile modal"
          >
            <span>{currentUser.avatar || "U"}</span>
          </button>
        ) : (
          <button
            type="button"
            className="primary-btn topbar-login-btn"
            onClick={onOpenAuthModal}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
