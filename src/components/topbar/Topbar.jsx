import { useNotes } from "../../context/useNotes";
import { useAuth } from "../../context/useAuth";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Cloud,
  CloudCheck,
  RefreshCw,
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
    syncState,
    upcomingReminders,
    setUploadModalOpen,
  } = useNotes();

  const { currentUser } = useAuth();

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

      {/* Workspace and account actions */}
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
