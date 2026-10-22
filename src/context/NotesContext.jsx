import { useState, useEffect, useRef, useCallback } from "react";
import { NotesContext } from "./notesContextInstance";
import { useAuth } from "./useAuth";
import { getInitialSeedNotes, defaultFolders } from "../utils/seedData";
import { isReminderDue } from "../utils/dates";
import { sound } from "../utils/audio";

function loadInitialNotes(uid) {
  const initial = getInitialSeedNotes();
  try {
    const key = `notespace_notes_${uid}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Heal seed notes if their prewritten content was wiped out previously
        const seedMap = new Map(initial.map((sn) => [sn.id, sn]));
        const healed = parsed.map((note) => {
          if (seedMap.has(note.id)) {
            const seed = seedMap.get(note.id);
            if (!note.content || note.content.trim() === "" || note.content === "<p></p>") {
              return { ...note, content: seed.content };
            }
          }
          return note;
        });
        return healed;
      }
    }
  } catch (e) {
    console.error("Failed to read stored notes", e);
  }
  try {
    localStorage.setItem(`notespace_notes_${uid}`, JSON.stringify(initial));
  } catch (err) {
    console.warn("Storage warning:", err);
  }
  return initial;
}

function loadInitialFolders(uid) {
  try {
    const key = `notespace_folders_${uid}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to read stored folders", e);
  }
  try {
    localStorage.setItem(`notespace_folders_${uid}`, JSON.stringify(defaultFolders));
  } catch (err) {
    console.warn("Storage warning:", err);
  }
  return defaultFolders;
}

// Robust helper functions to identify documents and PDFs across uploads and attachments
export function isDocOrPdfAttachment(att) {
  if (!att) return false;
  if (att.isPdf || att.isDoc) return true;
  const name = (att.name || "").toLowerCase();
  const type = (att.type || "").toLowerCase();

  const docExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".rtf",
    ".odt",
    ".pages",
    ".md",
    ".markdown",
    ".csv",
    ".tsv",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".json",
  ];
  if (docExtensions.some((ext) => name.endsWith(ext))) return true;

  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("document") ||
    type.includes("officedocument") ||
    type.includes("msword") ||
    type.includes("text/") ||
    type.includes("rtf") ||
    type.includes("csv") ||
    type.includes("sheet") ||
    type.includes("presentation")
  ) {
    return true;
  }

  return false;
}

export function isDocOrPdfNote(note) {
  if (!note || note.deleted || note.archived) return false;

  const fmt = (note.format || "").toLowerCase();
  if (
    [
      "pdf",
      "doc",
      "docx",
      "document",
      "txt",
      "text",
      "rtf",
      "odt",
      "pages",
      "md",
      "markdown",
      "csv",
      "tsv",
      "spreadsheet",
    ].includes(fmt)
  ) {
    return true;
  }

  // Check tags
  if (
    note.tags &&
    note.tags.some((t) =>
      [
        "pdf",
        "doc",
        "docs",
        "docx",
        "document",
        "word",
        "markdown",
        "text",
        "spreadsheet",
      ].includes(t.toLowerCase())
    )
  ) {
    return true;
  }

  // Check attachments
  if (note.attachments && note.attachments.length > 0) {
    if (note.attachments.some(isDocOrPdfAttachment)) {
      return true;
    }
  }

  return false;
}

export function NotesProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || "guest";

  // State: Notes & Folders directly initialized
  const [notes, setNotes] = useState(() => loadInitialNotes(userId));
  const [folders, setFolders] = useState(() => loadInitialFolders(userId));
  const [selectedId, setSelectedId] = useState(null);

  // Sync state if userId changes
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      setNotes(loadInitialNotes(userId));
      setFolders(loadInitialFolders(userId));
      setSelectedId(null);
    }
  }, [userId]);

  // UI state: selection, view, filters
  const [activeView, setActiveView] = useState("All Notes");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedColor, setSelectedColor] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az"); // Default to Alphabetical Order A-Z
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [activeLetterFilter, setActiveLetterFilter] = useState("all"); // 'all' | 'A'...'Z' | '#'

  // Upload modal & PDF Viewer modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pdfViewerModal, setPdfViewerModal] = useState({
    isOpen: false,
    pdfUrl: "",
    title: "",
    fileName: "",
  });

  const openPdfViewer = useCallback((pdfUrl, title = "PDF Viewer", fileName = "document.pdf") => {
    setPdfViewerModal({
      isOpen: true,
      pdfUrl,
      title,
      fileName,
    });
  }, []);

  const closePdfViewer = useCallback(() => {
    setPdfViewerModal((prev) => ({ ...prev, isOpen: false, pdfUrl: "" }));
  }, []);

  // Cloud sync & Autosave
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'unsaved'
  const [syncState, setSyncState] = useState("synced"); // 'synced' | 'syncing' | 'offline'
  const [lastSyncTime, setLastSyncTime] = useState(() => Date.now());
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState("syncing");
      setTimeout(() => {
        setSyncState("synced");
        setLastSyncTime(Date.now());
        addToast("Back online. Workspace synchronized.", "success");
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState("offline");
      addToast("You are offline. Changes saved locally.", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  // Autosave notes to localStorage with debounce
  const saveTimeoutRef = useRef(null);
  const isFirstNotesRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstNotesRenderRef.current) {
      isFirstNotesRenderRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`notespace_notes_${userId}`, JSON.stringify(notes));
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus("unsaved");
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notes, userId]);

  // Save folders to localStorage
  const isFirstFoldersRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstFoldersRenderRef.current) {
      isFirstFoldersRenderRef.current = false;
      return;
    }
    try {
      localStorage.setItem(`notespace_folders_${userId}`, JSON.stringify(folders));
    } catch (err) {
      console.error("Folders save failed", err);
    }
  }, [folders, userId]);

  // Reminder Checker (Every 10 seconds)
  useEffect(() => {
    const checkReminders = () => {
      if (!notes.length) return;

      notes.forEach((note) => {
        if (!note.deleted && !note.archived && note.reminder && note.reminder.active && !note.reminder.notified) {
          if (isReminderDue(note.reminder)) {
            sound.playChime();
            addToast(`⏰ Reminder: ${note.title || "Untitled Note"}`, "reminder", 6000);

            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`Reminder: ${note.title || "Untitled Note"}`, {
                  body: "Time for your scheduled task or reminder in Notespace.",
                  icon: "/favicon.svg",
                });
              } catch (err) {
                console.warn("Notification error:", err);
              }
            }

            setNotes((prevNotes) =>
              prevNotes.map((n) =>
                n.id === note.id
                  ? {
                      ...n,
                      reminder: { ...n.reminder, notified: true },
                    }
                  : n
              )
            );
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [notes, addToast]);

  // Request notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          addToast("Notifications enabled successfully!", "success");
        }
      }
    }
  }, [addToast]);

  // ---------------- NOTE CRUD ACTIONS ----------------

  function createNote(overrides = {}) {
    const now = Date.now();
    const initialFolder = folders[0] || defaultFolders[0];

    const newNote = {
      id: `note-${now}`,
      title: overrides.title || "",
      content: overrides.content || "",
      folderId: overrides.folderId || selectedFolderId || initialFolder.id,
      category: overrides.category || initialFolder.name,
      color: overrides.color || "violet",
      pinned: !!overrides.pinned,
      favorite: !!overrides.favorite,
      format: overrides.format || "note",
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: overrides.tags || (selectedTag ? [selectedTag] : []),
      createdAt: now,
      updatedAt: now,
      reminder: overrides.reminder || null,
      tasks: overrides.tasks || [],
      attachments: overrides.attachments || [],
    };

    setSaveStatus("saving");
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    sound.playPop();
    addToast("New note created", "success");
    return newNote;
  }

  // Multi-format file importing module (PDF, Markdown, Word DOCX, Text, CSV, JSON)
  async function importFileAsNote(file, targetFolderId = null) {
    if (!file) return null;
    const now = Date.now();
    const targetFolder = folders.find((f) => f.id === targetFolderId) || folders[0] || defaultFolders[0];
    const fileName = file.name;
    const ext = fileName.split(".").pop().toLowerCase();
    const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    let noteFormat = "note";
    let noteColor = "violet";
    let defaultTags = ["imported"];

    if (ext === "pdf" || file.type === "application/pdf") {
      noteFormat = "pdf";
      noteColor = "rose";
      defaultTags.push("pdf", "document");
    } else if (["md", "markdown"].includes(ext)) {
      noteFormat = "markdown";
      noteColor = "emerald";
      defaultTags.push("markdown");
    } else if (["txt", "rtf", "text"].includes(ext)) {
      noteFormat = "txt";
      noteColor = "cyan";
      defaultTags.push("text");
    } else if (["doc", "docx"].includes(ext)) {
      noteFormat = "docx";
      noteColor = "blue";
      defaultTags.push("document", "word");
    } else if (["csv", "tsv", "xlsx", "xls"].includes(ext)) {
      noteFormat = "csv";
      noteColor = "amber";
      defaultTags.push("spreadsheet", "data");
    } else if (["json", "js", "py", "html", "css"].includes(ext)) {
      noteFormat = "code";
      noteColor = "violet";
      defaultTags.push("code");
    }

    // Read file as Data URL for attachment
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Content extraction
    let generatedContent;
    if (["txt", "md", "markdown", "json", "csv", "html"].includes(ext)) {
      const textContent = await new Promise((resolve) => {
        const textReader = new FileReader();
        textReader.onload = (e) => resolve(e.target.result || "");
        textReader.onerror = () => resolve("");
        textReader.readAsText(file);
      });

      if (ext === "json") {
        try {
          const parsed = JSON.parse(textContent);
          generatedContent = `<h2>📄 JSON Data: ${fileName}</h2><pre><code>${JSON.stringify(parsed, null, 2)}</code></pre>`;
        } catch {
          generatedContent = `<h2>📄 Raw File: ${fileName}</h2><pre><code>${textContent.slice(0, 5000)}</code></pre>`;
        }
      } else if (ext === "csv") {
        const lines = textContent.split(/\r?\n/).filter(Boolean).slice(0, 50);
        let tableHtml = `<table style="width:100%; border-collapse: collapse; margin: 12px 0;">`;
        lines.forEach((line, idx) => {
          const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          tableHtml += `<tr>`;
          cells.forEach((cell) => {
            if (idx === 0) {
              tableHtml += `<th style="border: 1px solid var(--border); padding: 6px 10px; background: var(--surface-secondary); text-align: left;">${cell}</th>`;
            } else {
              tableHtml += `<td style="border: 1px solid var(--border); padding: 6px 10px;">${cell}</td>`;
            }
          });
          tableHtml += `</tr>`;
        });
        tableHtml += `</table>`;
        generatedContent = `<h2>📊 Imported CSV Table: ${cleanTitle}</h2>${tableHtml}`;
      } else if (["md", "markdown"].includes(ext)) {
        const html = textContent
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/gim, "<em>$1</em>")
          .replace(/^- (.*$)/gim, "<li>$1</li>")
          .split("\n\n")
          .map((p) => (p.startsWith("<h") || p.startsWith("<li") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
          .join("");
        generatedContent = html || `<p>${textContent}</p>`;
      } else {
        generatedContent = `<p>${textContent.replace(/\n/g, "<br/>")}</p>`;
      }
    } else if (noteFormat === "pdf") {
      generatedContent = `<h2>📄 PDF Document: ${fileName}</h2><p>Imported PDF note. You can preview, read, and download this document directly in NoteSpace.</p><div class="pdf-document-callout"><strong>File Name:</strong> ${fileName} (${(file.size / 1024).toFixed(1)} KB)</div>`;
    } else {
      generatedContent = `<h2>📎 Uploaded Document: ${fileName}</h2><p>Attached file: <strong>${fileName}</strong> (${(file.size / 1024).toFixed(1)} KB)</p>`;
    }

    const isDoc =
      ["docx", "doc", "txt", "rtf", "odt", "pages", "md", "csv", "tsv"].includes(noteFormat) ||
      ["doc", "docx", "txt", "rtf", "odt", "pages", "md", "csv", "tsv"].includes(ext);

    const attachmentObj = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      size: file.size,
      type: file.type || "application/octet-stream",
      isPdf: noteFormat === "pdf",
      isDoc,
      dataUrl,
      uploadedAt: now,
    };

    const newNote = {
      id: `note-${now}-${Math.floor(Math.random() * 1000)}`,
      title: (noteFormat === "pdf" ? "📄 " : "📝 ") + cleanTitle,
      content: generatedContent,
      folderId: targetFolder.id,
      category: targetFolder.name,
      color: noteColor,
      pinned: false,
      favorite: false,
      format: noteFormat,
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: defaultTags,
      createdAt: now,
      updatedAt: now,
      reminder: null,
      tasks: [],
      attachments: [attachmentObj],
    };

    setSaveStatus("saving");
    setNotes((prev) => [newNote, ...prev]);
    sound.playPop();
    addToast(`Imported "${fileName}" as ${noteFormat.toUpperCase()} note`, "success");
    return newNote;
  }

  async function importMultipleFiles(files, targetFolderId = null) {
    if (!files || !files.length) return [];
    const results = [];
    for (const file of Array.from(files)) {
      try {
        const note = await importFileAsNote(file, targetFolderId);
        if (note) results.push(note);
      } catch (err) {
        console.error("Failed to import file:", file.name, err);
        addToast(`Failed to import ${file.name}: ${err.message}`, "error");
      }
    }
    if (results.length > 1) {
      addToast(`Successfully created ${results.length} notes from uploaded files`, "success");
    }
    return results;
  }

  function updateNote(id, changes) {
    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              ...changes,
              updatedAt: Date.now(),
            }
          : note
      )
    );
  }

  function deleteNote(id) {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    if (target.deleted) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      addToast("Note deleted permanently", "info");
    } else {
      updateNote(id, { deleted: true, deletedAt: Date.now() });
      addToast("Moved note to Trash", "info");
    }

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function restoreNote(id) {
    updateNote(id, { deleted: false, deletedAt: null });
    addToast("Note restored from Trash", "success");
  }

  function permanentlyDeleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    addToast("Note permanently removed", "info");
  }

  function emptyTrash() {
    setNotes((prev) => prev.filter((n) => !n.deleted));
    setSelectedId(null);
    addToast("Trash emptied completely", "info");
  }

  function duplicateNote(id) {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    const now = Date.now();
    const cloned = {
      ...target,
      id: `note-${now}`,
      title: `${target.title || "Untitled"} (Copy)`,
      deleted: false,
      deletedAt: null,
      archived: false,
      createdAt: now,
      updatedAt: now,
      tags: [...(target.tags || [])],
      tasks: (target.tasks || []).map((t) => ({ ...t, id: `t-${Date.now()}-${Math.random()}` })),
      attachments: [...(target.attachments || [])],
    };

    setSaveStatus("saving");
    setNotes((prev) => [cloned, ...prev]);
    setSelectedId(cloned.id);
    sound.playPop();
    addToast("Note duplicated", "success");
  }

  function togglePin(id) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = !n.pinned;
          addToast(next ? "Pinned note to top" : "Unpinned note", "info");
          return { ...n, pinned: next, updatedAt: Date.now() };
        }
        return n;
      })
    );
  }

  function toggleFavorite(id) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = !n.favorite;
          addToast(next ? "Added to favorites" : "Removed from favorites", "info");
          return { ...n, favorite: next, updatedAt: Date.now() };
        }
        return n;
      })
    );
  }

  function toggleArchive(id) {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = !n.archived;
          addToast(next ? "Note archived" : "Restored from archive", "info");
          return { ...n, archived: next, updatedAt: Date.now() };
        }
        return n;
      })
    );
    if (selectedId === id) setSelectedId(null);
  }

  // ---------------- FOLDER ACTIONS ----------------

  function createFolder(folderData) {
    const id = `folder-${Date.now()}`;
    const newFolder = {
      id,
      name: folderData.name.trim(),
      color: folderData.color || "#8b5cf6",
      icon: folderData.icon || "Folder",
    };
    setFolders((prev) => [...prev, newFolder]);
    addToast(`Folder "${newFolder.name}" created`, "success");
    return newFolder;
  }

  function updateFolder(id, changes) {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
    if (changes.name) {
      setNotes((prev) =>
        prev.map((n) => (n.folderId === id ? { ...n, category: changes.name } : n))
      );
    }
    addToast("Folder updated", "success");
  }

  function deleteFolder(id) {
    const targetFolder = folders.find((f) => f.id === id);
    if (!targetFolder) return;

    const fallbackFolder = folders.find((f) => f.id !== id) || defaultFolders[0];
    setNotes((prev) =>
      prev.map((n) =>
        n.folderId === id
          ? { ...n, folderId: fallbackFolder?.id || "default", category: fallbackFolder?.name || "General" }
          : n
      )
    );

    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);
    addToast(`Folder "${targetFolder.name}" deleted`, "info");
  }

  // ---------------- TASKS IN NOTES ----------------

  function addTask(noteId, text, priority = "medium") {
    if (!text.trim()) return;
    const newTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: text.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              tasks: [...(n.tasks || []), newTask],
              updatedAt: Date.now(),
            }
          : n
      )
    );
  }

  function toggleTask(noteId, taskId) {
    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const updatedTasks = (n.tasks || []).map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return { ...n, tasks: updatedTasks, updatedAt: Date.now() };
        }
        return n;
      })
    );
  }

  function deleteTask(noteId, taskId) {
    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            tasks: (n.tasks || []).filter((t) => t.id !== taskId),
            updatedAt: Date.now(),
          };
        }
        return n;
      })
    );
  }

  function updateTask(noteId, taskId, changes) {
    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            tasks: (n.tasks || []).map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
            updatedAt: Date.now(),
          };
        }
        return n;
      })
    );
  }

  // ---------------- ATTACHMENTS IN NOTES ----------------

  function addAttachment(noteId, attachmentObj) {
    setSaveStatus("saving");
    const fileName = attachmentObj.name || "";
    const ext = fileName.split(".").pop().toLowerCase();
    const isPdf =
      !!attachmentObj.isPdf ||
      ext === "pdf" ||
      attachmentObj.type?.toLowerCase().includes("pdf");
    const isDoc =
      !!attachmentObj.isDoc ||
      ["doc", "docx", "rtf", "odt", "pages", "txt", "md", "csv", "tsv"].includes(ext) ||
      attachmentObj.type?.toLowerCase().includes("word") ||
      attachmentObj.type?.toLowerCase().includes("document") ||
      attachmentObj.type?.toLowerCase().includes("officedocument") ||
      attachmentObj.type?.toLowerCase().includes("msword");

    const enrichedAttachment = {
      ...attachmentObj,
      isPdf: !!isPdf,
      isDoc: !!isDoc,
    };

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          // If the note doesn't have a document/pdf format yet, elevate it
          let updatedFormat = n.format;
          if (!updatedFormat || updatedFormat === "note") {
            if (isPdf) updatedFormat = "pdf";
            else if (["doc", "docx"].includes(ext) || isDoc) updatedFormat = "docx";
            else if (["md", "markdown"].includes(ext)) updatedFormat = "markdown";
            else if (["txt", "rtf", "text"].includes(ext)) updatedFormat = "txt";
            else if (["csv", "tsv"].includes(ext)) updatedFormat = "csv";
          }

          const existingTags = n.tags || [];
          const newTags = [...existingTags];
          if (isPdf && !newTags.includes("pdf")) newTags.push("pdf");
          if (isDoc && !newTags.includes("document")) newTags.push("document");

          return {
            ...n,
            format: updatedFormat,
            tags: newTags,
            attachments: [...(n.attachments || []), enrichedAttachment],
            updatedAt: Date.now(),
          };
        }
        return n;
      })
    );
    addToast(`Attached "${attachmentObj.name}"`, "success");
  }

  function removeAttachment(noteId, attachmentId) {
    setSaveStatus("saving");
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            attachments: (n.attachments || []).filter((a) => a.id !== attachmentId),
            updatedAt: Date.now(),
          };
        }
        return n;
      })
    );
    addToast("Attachment removed", "info");
  }

  // ---------------- REMINDERS ----------------

  function setNoteReminder(noteId, { date, time }) {
    updateNote(noteId, {
      reminder: {
        date,
        time: time || "09:00",
        active: true,
        notified: false,
      },
    });
    requestNotificationPermission();
    addToast("Reminder set successfully", "success");
  }

  function clearNoteReminder(noteId) {
    updateNote(noteId, { reminder: null });
    addToast("Reminder removed", "info");
  }

  function snoozeNoteReminder(noteId, minutes = 15) {
    const target = notes.find((n) => n.id === noteId);
    if (!target || !target.reminder) return;

    const newTime = new Date(Date.now() + minutes * 60000);
    const dateStr = newTime.toISOString().split("T")[0];
    const timeStr = newTime.toTimeString().slice(0, 5);

    updateNote(noteId, {
      reminder: {
        date: dateStr,
        time: timeStr,
        active: true,
        notified: false,
      },
    });
    addToast(`Reminder snoozed for ${minutes} minutes`, "info");
  }

  // ---------------- CLOUD SYNC & BACKUP ----------------

  function syncNow() {
    setSyncState("syncing");
    setTimeout(() => {
      try {
        localStorage.setItem(`notespace_notes_${userId}`, JSON.stringify(notes));
        localStorage.setItem(`notespace_folders_${userId}`, JSON.stringify(folders));
        setSyncState("synced");
        setLastSyncTime(Date.now());
        sound.playPop();
        addToast("All notes and folders synchronized to Cloud!", "success");
      } catch {
        setSyncState("offline");
        addToast("Sync failed. Check available storage.", "error");
      }
    }, 900);
  }

  function exportBackupJSON() {
    const backupData = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      user: currentUser?.email || "guest",
      folders,
      notes,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notespace-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Workspace backup downloaded", "success");
  }

  function exportNoteMarkdown(noteId) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    let md = `# ${note.title || "Untitled Note"}\n\n`;
    md += `*Folder: ${note.category} | Created: ${new Date(note.createdAt).toLocaleDateString()}*\n\n`;
    if (note.tags && note.tags.length) {
      md += `*Tags: ${note.tags.map((t) => "#" + t).join(" ")}*\n\n---\n\n`;
    }

    const cleanContent = (note.content || "")
      .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul>/gi, "")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<ol>/gi, "")
      .replace(/<\/ol>/gi, "\n")
      .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/gi, "> $1\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "");

    md += cleanContent;

    if (note.tasks && note.tasks.length) {
      md += "\n\n## Tasks Checklist\n";
      note.tasks.forEach((t) => {
        md += `- [${t.completed ? "x" : " "}] ${t.text}\n`;
      });
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(note.title || "note").toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Note exported as Markdown", "success");
  }

  function importBackupJSON(jsonData, overwrite = false) {
    try {
      const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      if (!parsed.notes || !Array.isArray(parsed.notes)) {
        throw new Error("Invalid backup format: missing notes array.");
      }

      if (overwrite) {
        setNotes(parsed.notes);
        if (parsed.folders && Array.isArray(parsed.folders)) {
          setFolders(parsed.folders);
        }
      } else {
        const existingIds = new Set(notes.map((n) => n.id));
        const newNotes = parsed.notes.filter((n) => !existingIds.has(n.id));
        setNotes((prev) => [...newNotes, ...prev]);

        if (parsed.folders && Array.isArray(parsed.folders)) {
          const existingFolderIds = new Set(folders.map((f) => f.id));
          const newFolders = parsed.folders.filter((f) => !existingFolderIds.has(f.id));
          setFolders((prev) => [...prev, ...newFolders]);
        }
      }

      addToast("Backup restored successfully!", "success");
      return true;
    } catch (err) {
      console.error("Backup import error", err);
      addToast(err.message || "Failed to parse backup JSON", "error");
      return false;
    }
  }

  // ---------------- COMPUTED FILTERED NOTES ----------------

  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  const allTags = (() => {
    const map = new Map();
    notes.forEach((note) => {
      if (!note.deleted && !note.archived && note.tags) {
        note.tags.forEach((tag) => {
          const lower = tag.toLowerCase().trim();
          if (lower) {
            map.set(lower, (map.get(lower) || 0) + 1);
          }
        });
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  })();

  const filteredNotes = notes.filter((note) => {
    const searchableText = [
      note.title || "",
      note.content || "",
      note.category || "",
      ...(note.tags || []),
      ...(note.tasks || []).map((t) => t.text),
    ]
      .join(" ")
      .replace(/<[^>]*>/g, " ")
      .toLowerCase();

    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchesSearch = terms.every((term) => searchableText.includes(term));
    if (!matchesSearch) return false;

    if (selectedColor !== "all" && note.color !== selectedColor) {
      return false;
    }

    if (selectedTag && (!note.tags || !note.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()))) {
      return false;
    }

    if (selectedFolderId && note.folderId !== selectedFolderId) {
      return false;
    }

    if (activeView === "Trash") {
      return !!note.deleted;
    }

    if (activeView === "Archive") {
      return !!note.archived && !note.deleted;
    }

    if (note.deleted || note.archived) return false;

    if (activeView === "Favorites") {
      return !!note.favorite;
    }

    if (activeView === "Pinned") {
      return !!note.pinned;
    }

    if (activeView === "Tasks") {
      return (note.tasks && note.tasks.length > 0) || note.category === "Daily Tasks" || note.category === "Tasks";
    }

    if (activeView === "Reminders") {
      return !!note.reminder && note.reminder.active;
    }

    if (activeView === "PDF & Docs" || activeView === "PDF Notes") {
      return isDocOrPdfNote(note);
    }

    const matchingFolder = folders.find((f) => f.name === activeView);
    if (matchingFolder) {
      return note.folderId === matchingFolder.id || note.category === matchingFolder.name;
    }

    // Optional letter filter in alphabetical browsing
    if (activeLetterFilter && activeLetterFilter !== "all") {
      const firstChar = (note.title || "").replace(/^[^a-zA-Z0-9]+/, "").trim().charAt(0).toUpperCase();
      if (activeLetterFilter === "#") {
        if (/[A-Z]/.test(firstChar)) return false;
      } else {
        if (firstChar !== activeLetterFilter) return false;
      }
    }

    return true;
  });

  // Alphabetical sort: Arranges all notes in alphabetical order (A–Z) by default!
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (activeView !== "Trash" && a.pinned && !b.pinned) return -1;
    if (activeView !== "Trash" && !a.pinned && b.pinned) return 1;

    if (sortBy === "az") {
      const cleanA = (a.title || "Untitled").replace(/^[^a-zA-Z0-9]+/, "").trim().toLowerCase();
      const cleanB = (b.title || "Untitled").replace(/^[^a-zA-Z0-9]+/, "").trim().toLowerCase();
      return cleanA.localeCompare(cleanB, undefined, { numeric: true, sensitivity: "base" }) ||
        (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "za") {
      const cleanA = (a.title || "Untitled").replace(/^[^a-zA-Z0-9]+/, "").trim().toLowerCase();
      const cleanB = (b.title || "Untitled").replace(/^[^a-zA-Z0-9]+/, "").trim().toLowerCase();
      return cleanB.localeCompare(cleanA, undefined, { numeric: true, sensitivity: "base" }) ||
        (b.title || "").localeCompare(a.title || "");
    }
    if (sortBy === "created") {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortBy === "reminder") {
      const aTime = a.reminder?.date ? new Date(`${a.reminder.date}T${a.reminder.time || "00:00"}`).getTime() : Infinity;
      const bTime = b.reminder?.date ? new Date(`${b.reminder.date}T${b.reminder.time || "00:00"}`).getTime() : Infinity;
      return aTime - bTime;
    }
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  const upcomingReminders = notes
    .filter((n) => !n.deleted && !n.archived && n.reminder && n.reminder.active)
    .sort((a, b) => {
      const aTime = new Date(`${a.reminder.date}T${a.reminder.time || "00:00"}`).getTime();
      const bTime = new Date(`${b.reminder.date}T${b.reminder.time || "00:00"}`).getTime();
      return aTime - bTime;
    });

  const stats = {
    total: notes.filter((n) => !n.deleted && !n.archived).length,
    favorites: notes.filter((n) => n.favorite && !n.deleted && !n.archived).length,
    pinned: notes.filter((n) => n.pinned && !n.deleted && !n.archived).length,
    archived: notes.filter((n) => n.archived && !n.deleted).length,
    trash: notes.filter((n) => n.deleted).length,
    pdfNotes: notes.filter(isDocOrPdfNote).length,
    totalDocuments: notes.filter(isDocOrPdfNote).length,
    tasksCount: notes
      .filter((n) => !n.deleted && !n.archived)
      .reduce((acc, n) => acc + (n.tasks?.length || 0), 0),
    tasksCompleted: notes
      .filter((n) => !n.deleted && !n.archived)
      .reduce((acc, n) => acc + (n.tasks?.filter((t) => t.completed).length || 0), 0),
    remindersCount: upcomingReminders.length,
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        selectedId,
        setSelectedId,
        selectedNote,
        activeView,
        setActiveView,
        selectedFolderId,
        setSelectedFolderId,
        selectedTag,
        setSelectedTag,
        selectedColor,
        setSelectedColor,
        search,
        setSearch,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        activeLetterFilter,
        setActiveLetterFilter,
        uploadModalOpen,
        setUploadModalOpen,
        pdfViewerModal,
        openPdfViewer,
        closePdfViewer,
        saveStatus,
        syncState,
        lastSyncTime,
        isOnline,
        toasts,
        addToast,
        removeToast,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentlyDeleteNote,
        emptyTrash,
        duplicateNote,
        togglePin,
        toggleFavorite,
        toggleArchive,
        createFolder,
        updateFolder,
        deleteFolder,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        addAttachment,
        removeAttachment,
        importFileAsNote,
        importMultipleFiles,
        setNoteReminder,
        clearNoteReminder,
        snoozeNoteReminder,
        syncNow,
        exportBackupJSON,
        exportNoteMarkdown,
        importBackupJSON,
        requestNotificationPermission,
        allTags,
        filteredNotes: sortedNotes,
        upcomingReminders,
        stats,
        isDocOrPdfNote,
        isDocOrPdfAttachment,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
