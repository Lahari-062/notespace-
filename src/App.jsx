import { useState, useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";
import { NotesProvider } from "./context/NotesContext";
import { useAuth } from "./context/useAuth";
import { useNotes } from "./context/useNotes";

import LoginPage from "./components/auth/LoginPage";
import LandingPage from "./components/landing/LandingPage";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import NotesGrid from "./components/notes/NotesGrid";
import NoteEditorModal from "./components/editor/NoteEditorModal";

import FolderModal from "./components/modals/FolderModal";
import ProfileModal from "./components/auth/ProfileModal";
import AuthModal from "./components/auth/AuthModal";
import BackupModal from "./components/modals/BackupModal";
import RemindersDrawer from "./components/modals/RemindersDrawer";
import UploadNotesModal from "./components/modals/UploadNotesModal";
import PdfViewerModal from "./components/modals/PdfViewerModal";

import ToastContainer from "./components/common/ToastContainer";
import DoodleCanvas from "./components/DoodleCanvas";

import "./App.css";
import "./ProfessionalRedesign.css";

function NotesAppContent() {
  const { currentUser } = useAuth();

  const {
    activeView,
    createNote,
    selectedNote,
    uploadModalOpen,
    setUploadModalOpen,
  } = useNotes();

  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState("landing");

  // Sidebar
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Modal states
  const [folderModalState, setFolderModalState] = useState({
    isOpen: false,
    folder: null,
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [remindersDrawerOpen, setRemindersDrawerOpen] = useState(false);

  // Theme
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("notespace_theme_v2");

      if (stored) {
        return stored === "dark";
      }

      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  // Apply theme
  useEffect(() => {
    try {
      localStorage.setItem(
        "notespace_theme_v2",
        dark ? "dark" : "light"
      );

      const meta = document.querySelector(
        'meta[name="color-scheme"]'
      );

      if (meta) {
        meta.content = dark ? "dark" : "light";
      }
    } catch (error) {
      console.error("Theme storage error:", error);
    }
  }, [dark]);

  // Keyboard shortcut: Cmd/Ctrl + N
  useEffect(() => {
    function handleKeyDown(event) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        createNote();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [createNote]);

  // Login screen
  if (!currentUser) {
    return (
      <>
        <LoginPage
          dark={dark}
          onToggleTheme={() =>
            setDark((previous) => !previous)
          }
        />

        <ToastContainer />
      </>
    );
  }

  return (
    <div
      className={`app-shell ${currentScreen === "workspace" ? "notespace-app-shell" : ""} ${dark ? "dark" : ""}`}
    >
      {currentScreen === "landing" ? (
        <LandingPage
          onEnterWorkspace={() => setCurrentScreen("workspace")}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          dark={dark}
          onToggleTheme={() =>
            setDark((previous) => !previous)
          }
        />
      ) : (
        <>
          {/* Sidebar Navigation */}
<Sidebar
  mobileOpen={mobileSidebar}
            onCloseMobile={() => setMobileSidebar(false)}
            onOpenFolderModal={(folder) =>
              setFolderModalState({
                isOpen: true,
                folder,
              })
            }
            onOpenProfileModal={() =>
              setProfileModalOpen(true)
            }
            onOpenAuthModal={() =>
              setAuthModalOpen(true)
            }
            onOpenBackupModal={() =>
              setBackupModalOpen(true)
            }
          />

          {/* Main Workspace */}
          <main className="app-main-viewport notespace-workspace-main">
            {/* Topbar */}
            <Topbar
              onOpenMobileSidebar={() =>
                setMobileSidebar(true)
              }
              onOpenRemindersDrawer={() =>
                setRemindersDrawerOpen(true)
              }
              onOpenBackupModal={() =>
                setBackupModalOpen(true)
              }
              onOpenProfileModal={() =>
                setProfileModalOpen(true)
              }
              onOpenAuthModal={() =>
                setAuthModalOpen(true)
              }
              onOpenLanding={() =>
                setCurrentScreen("landing")
              }
              dark={dark}
              onToggleTheme={() =>
                setDark((previous) => !previous)
              }
            />

            {/* Main Content */}
            <section className="app-content-body notespace-workspace-content">
              {activeView === "Doodles" ? (
                /* Separate Doodle Page */
                <div className="doodles-page">
                  <div className="doodles-page-header">
                    <h2>My Doodles</h2>
                    <p>
                      Draw your ideas, diagrams, and quick sketches.
                    </p>
                  </div>

                  <DoodleCanvas saveLabel="Save Doodle" />
                </div>
              ) : (
                /* Existing Notes Workspace */
                <>
                  {/* Existing Notes Grid */}
                  <div
                    className={`notespace-split-workspace notespace-workspace-grid ${
                      selectedNote ? "has-selected-note" : ""
                    }`}
                    aria-label="Notes workspace"
                  >
                    <section
                      className="notespace-notes-panel notespace-workspace-list"
                      aria-label="Notes list"
                    >
                      <NotesGrid />
                    </section>

                    <section
                      className="notespace-editor-panel notespace-workspace-editor"
                      aria-label="Selected note editor"
                    >
                      <NoteEditorModal inline />
                    </section>
                  </div>
                  </>
                )}
            </section>
          </main>
        </>
      )}
                 
      {/* Global Modals: Accessible from both Landing Page and Workspace */}
      {currentScreen === "landing" && <NoteEditorModal />}
      <UploadNotesModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <PdfViewerModal />

      <FolderModal
        isOpen={folderModalState.isOpen}
        folderToEdit={folderModalState.folder}
        onClose={() =>
          setFolderModalState({
            isOpen: false,
            folder: null,
          })
        }
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

      <RemindersDrawer
        isOpen={remindersDrawerOpen}
        onClose={() => setRemindersDrawerOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <NotesAppContent />
      </NotesProvider>
    </AuthProvider>
  );
}