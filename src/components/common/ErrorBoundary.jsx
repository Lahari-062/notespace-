import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem("notespace_active_user_v2");
    } catch {
      // Ignore storage access issues while resetting the session.
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: "100vh",
            background: "#0d0f17",
            color: "#e2e8f0",
            fontFamily: "Inter, -apple-system, sans-serif",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "540px",
              width: "100%",
              background: "#181b29",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              !
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 8px",
                color: "#f8fafc",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#94a3b8",
                lineHeight: 1.5,
                margin: "0 0 20px",
              }}
            >
              Notespace encountered an unexpected error while rendering.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: "#0a0c13",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "12px",
                  color: "#fca5a5",
                  textAlign: "left",
                  overflowX: "auto",
                  maxHeight: "140px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  marginBottom: "24px",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: "#6c47ff",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetState}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Reset Session & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
