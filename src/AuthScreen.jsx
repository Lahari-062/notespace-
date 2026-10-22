import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import "./AuthScreen.css";

export default function AuthScreen({ onSwitchToPortal }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent. Check your inbox.");
      } else if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      const errors = {
        "auth/invalid-email": "Enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/email-already-in-use": "This email already has an account.",
        "auth/weak-password": "Use at least 6 characters for your password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/unauthorized-domain": "Add localhost to Firebase authorized domains.",
      };

      setMessage(errors[error.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setMessage(
        error.code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : "Google sign-in failed. Check your Firebase settings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" style={{ maxWidth: "440px" }}>
        <div className="auth-logo">N</div>
        <h1>Welcome to Notespace</h1>
        <p className="auth-subtitle">
          Your thoughts, organized in one place
        </p>

        <button
          className="google-button"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <span className="google-g" aria-hidden="true">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "reset" && (
            <>
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </>
          )}

          {mode === "signin" && (
            <button
              className="forgot-link"
              type="button"
              onClick={() => {
                setMode("reset");
                setMessage("");
              }}
            >
              Forgot password?
            </button>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "reset"
              ? "Send reset email"
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        {mode === "reset" ? (
          <p className="auth-footer">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
              }}
            >
              Back to sign in
            </button>
          </p>
        ) : (
          <p className="auth-footer">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setMessage("");
              }}
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </p>
        )}

        {onSwitchToPortal && (
          <div style={{ marginTop: "16px", textAlign: "center", borderTop: "1px solid #f0f0f5", paddingTop: "12px" }}>
            <button
              type="button"
              onClick={onSwitchToPortal}
              style={{
                background: "transparent",
                border: "none",
                color: "#6558d3",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Go to NoteSpace Pro Portal &rarr;
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
