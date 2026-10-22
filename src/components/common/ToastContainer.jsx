import { useNotes } from "../../context/useNotes";
import { CheckCircle2, AlertCircle, Info, Bell, X, AlertTriangle } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useNotes();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" role="status">
      {toasts.map(({ id, message, type }) => {
        let Icon = Info;
        let iconClass = "toast-info";

        if (type === "success") {
          Icon = CheckCircle2;
          iconClass = "toast-success";
        } else if (type === "error") {
          Icon = AlertCircle;
          iconClass = "toast-error";
        } else if (type === "warning") {
          Icon = AlertTriangle;
          iconClass = "toast-warning";
        } else if (type === "reminder") {
          Icon = Bell;
          iconClass = "toast-reminder";
        }

        return (
          <div key={id} className={`toast-card ${iconClass}`}>
            <Icon size={18} className="toast-icon" />
            <span className="toast-text">{message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
