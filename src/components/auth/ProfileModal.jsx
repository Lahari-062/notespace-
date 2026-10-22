import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNotes } from "../../context/useNotes";
import {
  X,
  User,
  Mail,
  LogOut,
  Check,
  KeyRound,
} from "lucide-react";

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { notes = [] } = useNotes();

  const [name, setName] = useState(currentUser?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [toasts, setToasts] = useState([]);

  if (!isOpen || !currentUser) return null;

  const isDemo = currentUser.email === "alex@notespace.io" || currentUser.id === "user-demo";

  function addToast(message, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // Workspace statistics
  const stats = {
    total: notes.filter((n) => !n.isArchived && !n.isTrash).length,
    favorites: notes.filter((n) => n.isFavorite && !n.isTrash).length,
    tasksCount: notes.reduce((acc, note) => {
      return acc + (note.content?.match(/<li data-type="taskItem"/g) || []).length;
    }, 0),
    tasksCompleted: notes.reduce((acc, note) => {
      return acc + (note.content?.match(/<li data-type="taskItem" data-checked="true"/g) || []).length;
    }, 0),
  };

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim() });
    setStatusMessage({ text: "Profile updated successfully!", type: "success" });
    addToast("Profile updated", "success");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordSection(false);
      setStatusMessage({ text: "Password changed successfully!", type: "success" });
      addToast("Password changed successfully", "success");
    } catch (err) {
      setStatusMessage({ text: err.message || "Failed to change password.", type: "error" });
    }
  }

  function handleLogout() {
    logout();
    onClose();
  }

  const joinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog profile-modal" role="dialog" aria-modal="true" style={{ maxWidth: "540px" }}>
        <header className="modal-header">
          <div className="profile-header-info">
            <div className="profile-large-avatar">{currentUser.avatar || "U"}</div>
            <div>
              <h2>{currentUser.name}</h2>
              <span className="profile-badge">
                {currentUser.isGuest ? "Guest Session" : isDemo ? "Demo Account" : "Personal Workspace"}
              </span>
            </div>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        {statusMessage.text && (
          <div className={`auth-status-banner banner-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="profile-content">
          {/* Workspace Metrics */}
          <div className="workspace-metrics-card">
            <h4>Workspace Usage</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span>Active Notes</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="metric-item">
                <span>Favorites</span>
                <strong>{stats.favorites}</strong>
              </div>
              <div className="metric-item">
                <span>Completed Tasks</span>
                <strong>
                  {stats.tasksCompleted} / {stats.tasksCount}
                </strong>
              </div>
              <div className="metric-item">
                <span>Joined</span>
                <strong>{joinDate}</strong>
              </div>
            </div>
          </div>

          {/* Edit Display Name */}
          <form onSubmit={handleSaveProfile} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="profile-name">Display Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email Address</label>
              <div className="input-with-icon disabled-input">
                <Mail size={16} />
                <input id="profile-email" type="email" value={currentUser.email} disabled />
              </div>
            </div>

            <button type="submit" className="secondary-btn save-profile-btn">
              <Check size={16} /> Save Changes
            </button>
          </form>

          {/* Change Password Section */}
          {!currentUser.isGuest && (
            <div className="password-accordion">
              <button
                type="button"
                className="accordion-toggle-btn"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <KeyRound size={16} />
                <span>Change Password</span>
              </button>

              {showPasswordSection && (
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label htmlFor="current-pw">Current Password</label>
                    <input
                      id="current-pw"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-pw">New Password</label>
                    <input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <button type="submit" className="primary-btn">
                    Update Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <footer className="modal-footer profile-footer">
          <button type="button" className="danger-outline-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
          <button type="button" className="primary-btn" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>

      {/* Floating Notifications */}
      {toasts.length > 0 && (
        <div className="twofactor-toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`twofactor-toast toast-${toast.type}`}>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
