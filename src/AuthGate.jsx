import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthScreen from "./AuthScreen";

export default function AuthGate({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(auth));
  const [viewScreen, setViewScreen] = useState("portal"); // 'portal' | 'firebase'

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setFirebaseUser(currentUser);
          setChecking(false);
        },
        (error) => {
          console.warn("[AuthGate] onAuthStateChanged error:", error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn("[AuthGate] Failed to subscribe to auth state:", err);
    }
  }, []);

  if (checking) {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          height: "100vh",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#0f0f17",
          color: "#a5b4fc",
          fontWeight: 600,
          fontSize: "15px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#6558d3",
              color: "white",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
              fontWeight: 800,
              fontSize: "20px",
            }}
          >
            N
          </div>
          Initializing NoteSpace Secure 2FA Workspace...
        </div>
      </div>
    );
  }

  // If user selected the standalone Firebase AuthScreen view
  if (viewScreen === "firebase" && !firebaseUser) {
    return (
      <div>
        <div
          style={{
            padding: "8px 16px",
            background: "#6558d3",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span>Standalone Firebase Screen Mode</span>
          <button
            type="button"
            onClick={() => setViewScreen("portal")}
            style={{
              background: "white",
              color: "#6558d3",
              border: 0,
              padding: "4px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to NoteSpace Pro Portal
          </button>
        </div>
        <AuthScreen onSwitchToPortal={() => setViewScreen("portal")} />
      </div>
    );
  }

  return (
    <>
      {firebaseUser && (
        <div className="auth-user-bar">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
              }}
            />
            Firebase Session: <strong>{firebaseUser.displayName || firebaseUser.email}</strong>
          </span>
          <button type="button" onClick={() => signOut(auth)}>
            Sign out of Firebase
          </button>
        </div>
      )}
      {children}
    </>
  );
}
