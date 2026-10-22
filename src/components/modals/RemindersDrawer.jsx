import { useNotes } from "../../context/useNotes";
import { getReminderCountdown, isReminderDue } from "../../utils/dates";
import { X, Bell, Clock, Calendar, Check, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";

export default function RemindersDrawer({ isOpen, onClose }) {
  const {
    upcomingReminders,
    setSelectedId,
    snoozeNoteReminder,
    clearNoteReminder,
    requestNotificationPermission,
  } = useNotes();

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-panel reminders-drawer" role="dialog" aria-modal="true">
        <header className="drawer-header">
          <div className="drawer-title">
            <div className="drawer-icon-badge">
              <Bell size={18} />
            </div>
            <div>
              <h3>Reminders & Alerts</h3>
              <p className="drawer-subtitle">
                {upcomingReminders.length} active scheduled reminder
                {upcomingReminders.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </header>

        <div className="drawer-body">
          {typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission !== "granted" && (
              <div className="notification-permission-prompt">
                <AlertTriangle size={18} className="prompt-icon" />
                <div>
                  <strong>Enable browser alerts</strong>
                  <p>Get notified on your desktop even when the app is in the background.</p>
                </div>
                <button
                  type="button"
                  className="permission-btn"
                  onClick={requestNotificationPermission}
                >
                  Enable
                </button>
              </div>
            )}

          {upcomingReminders.length === 0 ? (
            <div className="empty-drawer-state">
              <div className="empty-icon-wrap">
                <Clock size={32} />
              </div>
              <h4>No Active Reminders</h4>
              <p>Set a reminder on any note to get alerted when it's time to focus.</p>
            </div>
          ) : (
            <div className="reminders-list">
              {upcomingReminders.map((note) => {
                const countdown = getReminderCountdown(note.reminder);
                const isOverdue = isReminderDue(note.reminder);

                return (
                  <div
                    key={note.id}
                    className={`reminder-item-card ${isOverdue ? "is-overdue" : ""}`}
                  >
                    <div className="reminder-card-top">
                      <span className={`reminder-pill ${isOverdue ? "pill-overdue" : "pill-upcoming"}`}>
                        {isOverdue ? "Overdue" : countdown?.text || "Scheduled"}
                      </span>
                      <span className="reminder-datetime">
                        <Calendar size={13} /> {note.reminder.date} at {note.reminder.time || "09:00"}
                      </span>
                    </div>

                    <h4
                      className="reminder-note-title"
                      onClick={() => {
                        setSelectedId(note.id);
                        onClose();
                      }}
                    >
                      {note.title || "Untitled Note"}
                    </h4>

                    <div className="reminder-actions-row">
                      <button
                        type="button"
                        className="reminder-action-btn snooze-btn"
                        onClick={() => snoozeNoteReminder(note.id, 15)}
                        title="Snooze 15 minutes"
                      >
                        <RotateCcw size={13} /> +15m
                      </button>
                      <button
                        type="button"
                        className="reminder-action-btn snooze-btn"
                        onClick={() => snoozeNoteReminder(note.id, 60)}
                        title="Snooze 1 hour"
                      >
                        <RotateCcw size={13} /> +1h
                      </button>
                      <button
                        type="button"
                        className="reminder-action-btn dismiss-btn"
                        onClick={() => clearNoteReminder(note.id)}
                        title="Dismiss reminder"
                      >
                        <Check size={13} /> Dismiss
                      </button>
                      <button
                        type="button"
                        className="reminder-action-btn open-btn"
                        onClick={() => {
                          setSelectedId(note.id);
                          onClose();
                        }}
                        title="Open note"
                      >
                        Open <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
