import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const { register, login, loginAsDemo, loginAsGuest } = useAuth();

  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "register") {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemo() {
    loginAsDemo();
    onClose();
  }

  function handleGuest() {
    loginAsGuest();
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog auth-modal" role="dialog" aria-modal="true" style={{ maxWidth: "460px" }}>
        <header className="modal-header">
          <div className="auth-header-title">
            <div className="auth-logo-badge">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>{tab === "login" ? "Welcome back" : "Create your account"}</h2>
              <p className="modal-subtitle">
                {tab === "login"
                  ? "Access your cloud workspace and synchronized notes"
                  : "Join Notespace to start capturing thoughts and tasks"}
              </p>
            </div>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === "login" ? "is-active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === "register" ? "is-active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                id="auth-password"
                type="password"
                placeholder={tab === "register" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="primary-btn submit-auth-btn" disabled={loading}>
            {loading ? "Processing..." : tab === "login" ? "Sign In to Workspace" : "Create Account"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="demo-actions">
          <button type="button" className="demo-btn" onClick={handleDemo}>
            <Sparkles size={16} className="sparkle-icon" />
            <span>Try Demo Account (Instant Access)</span>
          </button>
          <button type="button" className="guest-btn" onClick={handleGuest}>
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
