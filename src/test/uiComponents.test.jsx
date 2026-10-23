import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider } from "../context/NotesContext";
import LoginPage from "../components/auth/LoginPage";
import ProfileModal from "../components/auth/ProfileModal";
import NotesGrid from "../components/notes/NotesGrid";
import NoteEditorModal from "../components/editor/NoteEditorModal";
import PdfViewerModal from "../components/modals/PdfViewerModal";
import { useNotes } from "../context/useNotes";

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(),
  };
});

vi.mock("../firebase", () => ({
  auth: { currentUser: null },
  googleProvider: {},
}));

describe("UI Authentication Components", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    auth.currentUser = null;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("LoginPage Component", () => {
    it("should render the Notespace brand and sign-in form", () => {
      render(
        <AuthProvider>
          <LoginPage dark={false} onToggleTheme={() => {}} />
        </AuthProvider>
      );

      expect(screen.getByRole("heading", { level: 2, name: /^Welcome back$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^Email Address$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    });

    it("should switch between Sign In and Create Account", () => {
      render(
        <AuthProvider>
          <LoginPage dark={false} onToggleTheme={() => {}} />
        </AuthProvider>
      );

      const signUpTab = screen.getByRole("button", { name: /Create Account/i });
      fireEvent.click(signUpTab);

      expect(screen.getByRole("heading", { level: 2, name: /Create your account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();

      const signInTab = document.getElementById("tab-sign-in");
      fireEvent.click(signInTab);
      expect(screen.getByRole("heading", { level: 2, name: /^Welcome back$/i })).toBeInTheDocument();
    });

    it("should show and hide the password", () => {
      render(
        <AuthProvider>
          <LoginPage dark={false} onToggleTheme={() => {}} />
        </AuthProvider>
      );

      const passwordInput = screen.getByLabelText(/^Password$/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      fireEvent.click(screen.getByRole("button", { name: /Show password/i }));
      expect(passwordInput).toHaveAttribute("type", "text");
      fireEvent.click(screen.getByRole("button", { name: /Hide password/i }));
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should require email OTP before completing sign in", async () => {
      const user = {
        uid: "firebase-test-user",
        displayName: "Alex Morgan",
        email: "alex@notespace.io",
        getIdToken: vi.fn().mockResolvedValue("test-id-token"),
      };
      signInWithEmailAndPassword.mockImplementation(async () => {
        auth.currentUser = user;
        return { user };
      });
      vi.stubEnv("VITE_OTP_WORKER_URL", "https://otp.test");
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <AuthProvider>
          <LoginPage dark={false} onToggleTheme={() => {}} />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/^Email Address$/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const submitBtn = document.getElementById("btn-login-submit");

      fireEvent.change(emailInput, { target: { value: "alex@notespace.io" } });
      fireEvent.change(passwordInput, { target: { value: "demo123" } });
      fireEvent.click(submitBtn);

      const otpInput = await screen.findByLabelText(/Email verification code/i);
      expect(localStorage.getItem("notespace_active_user_v2")).toBeNull();
      fireEvent.change(otpInput, { target: { value: "123456" } });
      fireEvent.click(screen.getByRole("button", { name: /Verify and continue/i }));

      await waitFor(() => {
        const stored = localStorage.getItem("notespace_active_user_v2");
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored).email).toBe("alex@notespace.io");
      });
    });
  });

  describe("ProfileModal Component", () => {
    it("should render user profile details, workspace metrics, and change password", () => {
      const demoUser = {
        id: "user-demo",
        name: "Alex Morgan",
        email: "alex@notespace.io",
        avatar: "AM",
      };
      localStorage.setItem("notespace_active_user_v2", JSON.stringify(demoUser));

      render(
        <AuthProvider>
          <NotesProvider>
            <ProfileModal isOpen={true} onClose={() => {}} />
          </NotesProvider>
        </AuthProvider>
      );

      expect(screen.getByRole("heading", { level: 2, name: /Alex Morgan/i })).toBeInTheDocument();
      expect(screen.getByText(/Workspace Usage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Display Name/i)).toHaveValue("Alex Morgan");
      expect(screen.getByRole("button", { name: /Change Password/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign Out/i })).toBeInTheDocument();
    });
  });

  describe("Notes workspace list controls", () => {
    it("searches notes from the notes panel and keeps sorting available", () => {
      render(
        <AuthProvider>
          <NotesProvider>
            <NotesGrid />
          </NotesProvider>
        </AuthProvider>
      );

      const searchInput = screen.getByRole("searchbox", {
        name: /search notes by title, content, or tags/i,
      });
      expect(screen.getByRole("combobox", { name: "Sort notes" })).toBeInTheDocument();

      fireEvent.change(searchInput, {
        target: { value: "no matching note title" },
      });

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /no notes matching "no matching note title"/i,
        })
      ).toBeInTheDocument();
    });

    it("updates the persistent inline editor when a note is selected", () => {
      render(
        <AuthProvider>
          <NotesProvider>
            <div className="notespace-workspace-grid">
              <section className="notespace-workspace-list">
                <NotesGrid />
              </section>
              <section className="notespace-workspace-editor">
                <NoteEditorModal inline />
              </section>
            </div>
          </NotesProvider>
        </AuthProvider>
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: /Welcome to Notespace Workspace/i,
        })
      );

      expect(screen.getByPlaceholderText("Note title...")).toHaveValue(
        "🚀 Welcome to Notespace Workspace"
      );
      expect(document.querySelector(".workspace-editor-host")).toBeInTheDocument();
      expect(document.querySelector(".workspace-editor-host.modal-backdrop")).toBeNull();
      expect(document.querySelector(".modal-backdrop")).toBeNull();
    });

    it("renders the selected PDF inside the workspace panel instead of a modal", () => {
      function PdfViewerHarness() {
        const { openPdfViewer } = useNotes();
        return (
          <>
            <button
              type="button"
              onClick={() =>
                openPdfViewer(
                  "data:application/pdf;base64,JVBERi0xLjQ=",
                  "Workspace PDF",
                  "workspace.pdf"
                )
              }
            >
              Open PDF
            </button>
            <PdfViewerModal inline />
          </>
        );
      }

      render(
        <AuthProvider>
          <NotesProvider>
            <PdfViewerHarness />
          </NotesProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open PDF" }));

      expect(
        screen.getByRole("region", { name: "PDF document viewer" })
      ).toBeInTheDocument();
      expect(document.querySelector(".modal-backdrop")).toBeNull();
      expect(screen.getByText("workspace.pdf")).toBeInTheDocument();
    });
  });
});
