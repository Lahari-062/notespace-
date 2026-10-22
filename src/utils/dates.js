// Date, relative time, and size formatting utilities

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "Just now";
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function isReminderDue(reminder) {
  if (!reminder || !reminder.date || !reminder.active) return false;
  const reminderTime = new Date(`${reminder.date}T${reminder.time || "09:00"}`).getTime();
  return Date.now() >= reminderTime;
}

export function getReminderCountdown(reminder) {
  if (!reminder || !reminder.date) return null;
  const target = new Date(`${reminder.date}T${reminder.time || "09:00"}`).getTime();
  const diffMs = target - Date.now();

  if (diffMs <= 0) {
    return { text: "Overdue", overdue: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return { text: `In ${diffDays} day${diffDays > 1 ? "s" : ""}`, overdue: false };
  }
  if (diffHours > 0) {
    return { text: `In ${diffHours} hr${diffHours > 1 ? "s" : ""}`, overdue: false };
  }
  const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return { text: `In ${diffMins} min${diffMins > 1 ? "s" : ""}`, overdue: false };
}
