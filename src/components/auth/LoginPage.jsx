
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  FileText,
  Search,
  Star,
  Pin,
  CheckSquare,
  LoaderCircle,
} from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

// Connect Notespace to the Cloudflare Worker OTP service.
async function callOtpService(payload) {
  const url = import.meta.env.VITE_OTP_WORKER_URL;

  if (!url) {
    throw new Error(
      "OTP Worker URL is missing. Check .env.local and restart Vite."
    );
  }

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Could not reach the OTP Worker. Check its URL and CORS settings."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The OTP service returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "OTP request failed. Please try again."
    );
  }

  return result;
}

export default function LoginPage({ dark, onToggleTheme }) {
  const { loginWithFirebaseUser } = useAuth();

  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpType, setOtpType] = useState("email"); // 'email' | 'totp'
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaHint, setMfaHint] = useState(null);

  // Sign in or create an account.
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (tab === "register") {
        const result = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        if (name.trim()) {
          await updateProfile(result.user, {
            displayName: name.trim(),
          });
        }

        setSuccessMessage("Account created. Sign in to request your verification code.");
        setTab("login");
        setPassword("");
        return;
      }

      // First, verify credentials with Firebase.
      const result = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // If account does not require native MFA, proceed with email OTP.
      const idToken = await result.user.getIdToken();

      await callOtpService({
        action: "send",
        idToken,
      });

      setOtpCode("");
      setOtpType("email");
      setMfaResolver(null);
      setMfaHint(null);
      setOtpStep(true);
      setSuccessMessage("A verification code has been sent to your email.");
    } catch (err) {
      // Handle Firebase Multi-Factor Authentication (TOTP Authenticator)
      if (err.code === "auth/multi-factor-auth-required") {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          const totpHint =
            resolver.hints.find(
              (h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID
            ) || resolver.hints[0];

          setMfaResolver(resolver);
          setMfaHint(totpHint);
          setOtpType("totp");
          setOtpCode("");
          setOtpStep(true);
          setSuccessMessage(
            "Two-Factor Authentication: Enter the 6-digit code from your authenticator app."
          );
          return;
        } catch (resolverErr) {
          setError(
            resolverErr.message ||
              "Could not initialize two-factor authentication."
          );
          return;
        }
      }

      const messages = {
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/email-already-in-use":
          "An account with this email already exists.",
        "auth/weak-password": "Please choose a stronger password.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
      };

      setError(
        messages[err.code] ||
          err.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Verify the email OTP or Firebase MFA TOTP before logging in.
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanCode = otpCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Native Multi-Factor Authentication (TOTP)
      if (mfaResolver && mfaHint) {
        try {
          const assertion = TotpMultiFactorGenerator.assertionForSignIn(
            mfaHint.uid,
            cleanCode
          );
          const userCredential = await mfaResolver.resolveSignIn(assertion);
          loginWithFirebaseUser(userCredential.user);
          return;
        } catch (mfaErr) {
          if (
            mfaErr.code === "auth/invalid-verification-code" ||
            mfaErr.code === "auth/invalid-verification-id"
          ) {
            const invalidCodeError = new Error(
              "Invalid 6-digit authenticator code. Make sure your device's date & time are set automatically and enter the current code from your authenticator app."
            );
            invalidCodeError.cause = mfaErr;
            throw invalidCodeError;
          }
          const wrappedError = new Error(mfaErr.message || "Verification failed.");
          wrappedError.cause = mfaErr;
          throw wrappedError;
        }
      }

      // 2. Standard Email OTP flow
      const user = auth?.currentUser;

      if (!user) {
        throw new Error(
          "Your sign-in session expired. Please sign in again."
        );
      }

      const idToken = await user.getIdToken();

      await callOtpService({
        action: "verify",
        idToken,
        code: cleanCode,
      });

      // Confirm login with user object
      loginWithFirebaseUser(user);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Google sign-in (with MFA support).
  async function handleGoogleSignIn() {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await signInWithPopup(auth, googleProvider);

      if (res?.user) {
        loginWithFirebaseUser(res.user);
      }
    } catch (err) {
      if (err.code === "auth/multi-factor-auth-required") {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          const totpHint =
            resolver.hints.find(
              (h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID
            ) || resolver.hints[0];

          setMfaResolver(resolver);
          setMfaHint(totpHint);
          setOtpType("totp");
          setOtpCode("");
          setOtpStep(true);
          setSuccessMessage(
            "Two-Factor Authentication: Enter the 6-digit code from your authenticator app."
          );
          return;
        } catch (resolverErr) {
          setError(
            resolverErr.message ||
              "Could not initialize two-factor authentication."
          );
          return;
        }
      }

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else {
        setError(
          err.message ||
            "Google sign-in failed. Please use email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Send a password-reset email.
  async function handleForgotPassword() {
    setError("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMessage("If the account exists, a password-reset email has been sent.");
    } catch (err) {
      setError(
        err.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : err.message || "Could not send the password-reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`login-page-container ${dark ? "dark" : ""}`}>
      <main className="auth-screen">
        <section className="auth-brand-panel" aria-labelledby="showcase-heading">
          <header className="auth-brand-header">
            <div className="login-brand" aria-label="Notespace">
              <div className="login-brand-icon">
                <FileText size={20} strokeWidth={2} />
              </div>
              <span className="login-brand-name">
                Note<span className="brand-accent">space</span>
              </span>
            </div>
            <span className="auth-brand-caption">A calmer space for your ideas</span>
          </header>

          <div className="showcase-copy auth-brand-copy">
              <p className="showcase-eyebrow">Your ideas, in good company</p>
              <h1 id="showcase-heading" className="showcase-headline">
                Your thoughts, beautifully organized.
              </h1>
              <p className="showcase-subhead">
                A thoughtful place for your notes, plans, and everyday sparks of inspiration.
              </p>
          </div>

          <div className="workspace-preview auth-workspace-preview" aria-label="Notespace workspace preview">
              <div className="preview-window-bar">
                <div className="preview-window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="preview-window-title">Notespace</span>
                <span className="preview-window-avatar">A</span>
              </div>

              <div className="preview-workspace">
                <aside className="preview-sidebar">
                  <div className="preview-mini-brand">
                    <FileText size={13} />
                    <strong>Notespace</strong>
                  </div>
                  <div className="preview-search">
                    <Search size={12} />
                    <span>Search notes</span>
                  </div>
                  <div className="preview-nav-item is-active">
                    <FileText size={13} />
                    <span>All Notes</span>
                    <small>12</small>
                  </div>
                  <div className="preview-nav-item">
                    <Star size={13} />
                    <span>Favorites</span>
                  </div>
                  <div className="preview-nav-item">
                    <Pin size={13} />
                    <span>Pinned</span>
                  </div>
                  <div className="preview-nav-item">
                    <CheckSquare size={13} />
                    <span>Tasks</span>
                  </div>
                  <div className="preview-folder-label">FOLDERS</div>
                  <div className="preview-folder-row"><span className="preview-folder-dot dot-violet" />Projects</div>
                  <div className="preview-folder-row"><span className="preview-folder-dot dot-blue" />Personal</div>
                </aside>

                <div className="preview-main">
                  <div className="preview-main-header">
                    <div>
                      <span className="preview-kicker">YOUR WORKSPACE</span>
                      <strong>All notes</strong>
                    </div>
                    <span className="preview-new-note">+ New note</span>
                  </div>
                  <div className="preview-alphabet" aria-hidden="true">
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                      <span className={letter === "A" ? "is-active" : ""} key={letter}>
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div className="preview-note-grid">
                    <article className="preview-note-card">
                      <div className="preview-note-meta"><span className="preview-note-dot violet" />PROJECTS <Star size={11} /></div>
                      <strong>Product roadmap</strong>
                      <p>Ideas for the next chapter of our work.</p>
                      <div className="preview-note-footer"><span>Today</span><span className="preview-note-tag">Planning</span></div>
                    </article>
                    <article className="preview-note-card">
                      <div className="preview-note-meta"><span className="preview-note-dot blue" />PERSONAL</div>
                      <strong>Reading list</strong>
                      <p>Books and articles worth coming back to.</p>
                      <div className="preview-note-footer"><span>Yesterday</span><span className="preview-note-tag">Ideas</span></div>
                    </article>
                    <article className="preview-note-card preview-document-card">
                      <div className="preview-document-icon"><FileText size={17} /></div>
                      <div>
                        <strong>Project brief.pdf</strong>
                        <p>PDF · 2.4 MB</p>
                      </div>
                      <span className="preview-document-open">Open</span>
                    </article>
                  </div>
                  <div className="preview-status-line">
                    <span className="preview-status-dot" />
                    All changes saved
                  </div>
                </div>
              </div>
          </div>
        </section>

        <section className="auth-form-side" aria-label="Account access">
          <header className="auth-form-topbar">
            <div className="login-brand auth-mobile-brand" aria-label="Notespace">
              <div className="login-brand-icon">
                <FileText size={19} strokeWidth={2} />
              </div>
              <span className="login-brand-name">
                Note<span className="brand-accent">space</span>
              </span>
            </div>
            <button
              type="button"
              className="login-theme-toggle-btn"
              onClick={onToggleTheme}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{dark ? "Light mode" : "Dark mode"}</span>
            </button>
          </header>

          <div className="auth-form-content">
            <div className="login-glass-card">
              <div className="card-top-header">
                <h2 className="card-heading">
                  {otpStep
                    ? (otpType === "totp" ? "Two-Factor Verification" : "Check your email")
                    : tab === "login"
                      ? "Welcome back"
                      : "Create your account"}
                </h2>
                <p className="card-subheading">
                  {otpStep
                    ? (otpType === "totp"
                        ? "Enter the 6-digit code from your authenticator app."
                        : "Enter the verification code sent to your email.")
                    : tab === "login"
                      ? "Sign in to continue to your workspace."
                      : "Create an account to get started with Notespace."}
                </p>
              </div>

              {error && (
                <div className="login-error-alert" role="alert">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="login-success-alert" role="status">
                  {successMessage}
                </div>
              )}

              <form
                onSubmit={otpStep ? handleVerifyOtp : handleSubmit}
                className="login-form-body"
              >
                {otpStep ? (
                  <>
                    <div className="form-field-group">
                      <label htmlFor="email-otp">
                        {otpType === "totp"
                          ? "Authenticator verification code"
                          : "Email verification code"}
                      </label>
                      <div className="input-field-shell">
                        {otpType === "totp" ? (
                          <Lock size={17} className="field-icon" />
                        ) : (
                          <Mail size={17} className="field-icon" />
                        )}
                        <input
                          id="email-otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          required
                          autoFocus
                        />
                      </div>
                      <p className="field-help-text">
                        {otpType === "totp"
                          ? "Open Google Authenticator, Microsoft Authenticator, or Authy to get your verification code."
                          : "Check your inbox for your Notespace verification code."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="primary-btn login-submit-btn"
                      disabled={loading || otpCode.length !== 6}
                    >
                      {loading ? <LoaderCircle className="login-loading-icon" size={17} /> : null}
                      <span>{loading ? "Verifying..." : "Verify and continue"}</span>
                      {!loading && <ArrowRight size={17} />}
                    </button>

                    <button
                      type="button"
                      className="login-back-link"
                      onClick={() => {
                        setOtpStep(false);
                        setOtpCode("");
                        setMfaResolver(null);
                        setMfaHint(null);
                        setOtpType("email");
                        setPassword("");
                        setError("");
                        setSuccessMessage("");
                      }}
                      disabled={loading}
                    >
                      Back to sign in
                    </button>
                  </>
                ) : (
                  <>
                    {tab === "register" && (
                      <div className="form-field-group">
                        <label htmlFor="register-full-name">Full name</label>
                        <div className="input-field-shell">
                          <User size={17} className="field-icon" />
                          <input
                            id="register-full-name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-field-group">
                      <label htmlFor="login-email-input">Email address</label>
                      <div className="input-field-shell">
                        <Mail size={17} className="field-icon" />
                        <input
                          id="login-email-input"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <div className="field-label-row">
                        <label htmlFor="login-password-input">Password</label>
                        {tab === "login" && (
                          <button
                            type="button"
                            className="forgot-password-btn"
                            onClick={handleForgotPassword}
                            disabled={loading}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="input-field-shell">
                        <Lock size={17} className="field-icon" />
                        <input
                          id="login-password-input"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={tab === "register" ? "At least 6 characters" : "Enter your password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={tab === "register" ? 6 : undefined}
                          required
                          autoComplete={tab === "register" ? "new-password" : "current-password"}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-login-submit"
                      className="primary-btn login-submit-btn"
                      disabled={loading}
                    >
                      {loading ? <LoaderCircle className="login-loading-icon" size={17} /> : null}
                      <span>
                        {loading
                          ? tab === "login" ? "Signing in..." : "Creating account..."
                          : tab === "login" ? "Sign In" : "Create Account"}
                      </span>
                      {!loading && <ArrowRight size={17} />}
                    </button>

                    {tab === "login" && (
                      <>
                        <div className="auth-divider">
                          <span>or continue with</span>
                        </div>
                        <button
                          type="button"
                          className="google-button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                        >
                          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Continue with Google</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </form>

              {!otpStep && (
                <div className="login-switch-footer">
                  {tab === "login" ? (
                    <p>
                      New to Notespace?{" "}
                      <button
                        type="button"
                        id="tab-sign-up"
                        aria-label="Create Account"
                        className="login-switch-btn"
                        onClick={() => {
                          setTab("register");
                          setError("");
                          setSuccessMessage("");
                        }}
                      >
                        Create an account
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <button
                        type="button"
                        id="tab-sign-in"
                        className="login-switch-btn"
                        onClick={() => {
                          setTab("login");
                          setError("");
                          setSuccessMessage("");
                        }}
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
