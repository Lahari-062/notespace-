import { useNotes } from "../../context/useNotes";
import { useAuth } from "../../context/useAuth";
import {
  FileText,
  Star,
  Pin,
  Pencil,
  CheckSquare,
  Bell,
  Archive,
  Trash2,
  Folder,
  Briefcase,
  User,
  BookOpen,
  Lightbulb,
  Heart,
  Compass,
  Code,
  Plus,
  Tag,
  Cloud,
  CloudCheck,
  Settings,
  X,
  Edit2,
  LogIn,
  LogOut,
  Upload,
  FileCheck2,
  House,
} from "lucide-react";

const ICON_MAP = {
  Folder,
  Briefcase,
  User,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Star,
  Heart,
  Compass,
  Code,
};

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  onOpenFolderModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenBackupModal,
}) {
  const {
    activeView,
    setActiveView,
    selectedFolderId,
    setSelectedFolderId,
    selectedTag,
    setSelectedTag,
    setSelectedId,
    closePdfViewer,
    createNote,
    setUploadModalOpen,
    folders,
    allTags,
    stats,
    syncState,
    notes,
  } = useNotes();

  const { currentUser, logout } = useAuth();

  function handleNavClick(view) {
    setActiveView(view);
    setSelectedFolderId(null);
    setSelectedTag(null);
    setSelectedId(null);
    closePdfViewer();
    onCloseMobile?.();
  }

  function handleFolderClick(folder) {
    setActiveView(folder.name);
    setSelectedFolderId(folder.id);
    setSelectedTag(null);
    setSelectedId(null);
    closePdfViewer();
    onCloseMobile?.();
  }

  function handleTagClick(tag) {
    setSelectedId(null);
    if (activeView === "Welcome") {
      setActiveView("All Notes");
    }
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
    closePdfViewer();
    onCloseMobile?.();
  }

  const navItems = [
    { label: "Home", view: "Welcome", icon: House, count: 0 },
    { label: "All Notes", icon: FileText, count: stats.total },
    { label: "PDF & Docs", icon: FileCheck2, count: stats.pdfNotes || 0 },
    { label: "Favorites", icon: Star, count: stats.favorites },
    { label: "Pinned", icon: Pin, count: stats.pinned },
    { label: "Tasks", icon: CheckSquare, count: stats.tasksCount },
    { label: "Reminders", icon: Bell, count: stats.remindersCount },
    { label: "Archive", icon: Archive, count: stats.archived },
    { label: "Trash", icon: Trash2, count: stats.trash },
    { label: "Doodles", icon: Pencil, count: 0 },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={onCloseMobile}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? "is-mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-row">
          <div className="brand-logo-group">
            <div className="brand-gem-icon">
              <FileText size={20} />
            </div>
            <span className="brand-text">
              Note<span className="brand-highlight">space</span>
            </span>
          </div>

          <button
            type="button"
            className="icon-btn mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons: New Note + Upload Files */}
        <div className="sidebar-actions-stack">
          {(activeView === "Welcome" || activeView === "Doodles") && (
            <button
              type="button"
              className="sidebar-create-btn"
              onClick={() => {
                createNote();
                onCloseMobile?.();
              }}
            >
              <Plus size={18} />
              <span>New note</span>
              <kbd>⌘ N</kbd>
            </button>
          )}

          <button
            type="button"
            className="sidebar-upload-btn"
            onClick={() => {
              setUploadModalOpen(true);
              onCloseMobile?.();
            }}
            title="Upload PDF, DOCX, Markdown, Text notes"
          >
            <Upload size={16} />
            <span>Upload Notes / PDF</span>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="sidebar-scrollable-body">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">WORKSPACE</span>
            <nav className="sidebar-nav-list">
              {navItems.map(({ label, view = label, icon: NavIcon, count }) => {
                const isActive = activeView === view && !selectedFolderId;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`nav-button ${isActive ? "is-active" : ""}`}
                    onClick={() => handleNavClick(view)}
                  >
                    <NavIcon size={17} className="nav-icon" />
                    <span className="nav-label">{label}</span>
                    {count > 0 && <span className="nav-badge">{count}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Folders Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">YOUR FOLDERS</span>
              <button
                type="button"
                className="section-add-btn"
                onClick={() => onOpenFolderModal(null)}
                title="Create new folder"
                aria-label="Create folder"
              >
                <Plus size={15} />
              </button>
            </div>

            <nav className="sidebar-nav-list folders-nav-list">
              {folders.map((folder) => {
                const FolderIconComponent = ICON_MAP[folder.icon] || Folder;
                const isFolderActive = selectedFolderId === folder.id;
                const folderNoteCount = notes.filter(
                  (n) => !n.deleted && !n.archived && (n.folderId === folder.id || n.category === folder.name)
                ).length;

                return (
                  <div
                    key={folder.id}
                    className={`folder-nav-item ${isFolderActive ? "is-active" : ""}`}
                  >
                    <button
                      type="button"
                      className="folder-click-btn"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <FolderIconComponent
                        size={16}
                        className="folder-icon"
                        style={{ color: folder.color || "var(--primary)" }}
                      />
                      <span className="nav-label">{folder.name}</span>
                      <span className="nav-badge">{folderNoteCount}</span>
                    </button>

                    <button
                      type="button"
                      className="folder-edit-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFolderModal(folder);
                      }}
                      title="Edit folder"
                      aria-label={`Edit ${folder.name} folder`}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Tags Cloud Section */}
          {allTags.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <span className="sidebar-section-title">TAGS</span>
                {selectedTag && (
                  <button
                    type="button"
                    className="clear-tag-btn"
                    onClick={() => setSelectedTag(null)}
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="tags-cloud">
                {allTags.map(({ name: tagName, count }) => {
                  const isSelected = selectedTag === tagName;
                  return (
                    <button
                      key={tagName}
                      type="button"
                      className={`sidebar-tag-pill ${isSelected ? "is-selected" : ""}`}
                      onClick={() => handleTagClick(tagName)}
                    >
                      <Tag size={11} />
                      <span>{tagName}</span>
                      <small>{count}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Area */}
        <div className="sidebar-footer">
          {/* Cloud Storage & Backup Card */}
          <div className="sidebar-storage-card" onClick={onOpenBackupModal}>
            <div className="storage-card-header">
              <div className="storage-status-icon">
                {syncState === "synced" ? (
                  <CloudCheck size={16} className="text-emerald" />
                ) : (
                  <Cloud size={16} className="text-primary" />
                )}
              </div>
              <div className="storage-card-labels">
                <strong>{syncState === "synced" ? "Cloud Synced" : "Storage & Backup"}</strong>
                <span>{stats.total} notes stored</span>
              </div>
            </div>
            <div className="storage-progress-bar">
              <div
                className="storage-progress-fill"
                style={{ width: `${Math.min(100, Math.max(8, stats.total * 4))}%` }}
              />
            </div>
          </div>

          {/* User Account / Profile Bar */}
          {currentUser ? (
            <div className="user-profile-bar-row">
              <div className="user-profile-bar" onClick={onOpenProfileModal}>
                <div className="user-avatar-circle">{currentUser.avatar || "U"}</div>
                <div className="user-meta-info">
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.email}</span>
                </div>
                <Settings size={15} className="settings-cog-icon" />
              </div>
              <button
                type="button"
                className="sidebar-quick-logout-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                title="Sign Out to Login Page"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="login-prompt-btn"
              onClick={onOpenAuthModal}
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
