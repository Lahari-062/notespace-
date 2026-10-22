import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider, isDocOrPdfAttachment } from "../context/NotesContext";
import { useNotes } from "../context/useNotes";

describe("Notes Workspace & Core Website Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function wrapper({ children }) {
    return (
      <AuthProvider>
        <NotesProvider>{children}</NotesProvider>
      </AuthProvider>
    );
  }

  it("should initialize default notes and compute workspace statistics accurately", () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    expect(result.current.notes).toBeInstanceOf(Array);
    expect(result.current.notes.length).toBeGreaterThan(0);

    const stats = result.current.stats;
    expect(stats.total).toBe(result.current.notes.length);
    expect(typeof stats.favorites).toBe("number");
    expect(typeof stats.tasksCount).toBe("number");
    expect(typeof stats.tasksCompleted).toBe("number");
  });

  it("should create a new note and keep notes organized alphabetically", () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    let createdId;
    act(() => {
      const note = result.current.createNote({
        title: "Alpha Quantum Computing Notes",
        content: "<p>Important research on quantum gates.</p>",
      });
      createdId = note.id;
    });

    expect(createdId).toBeDefined();

    // Verify note is present
    const found = result.current.notes.find((n) => n.id === createdId);
    expect(found).toBeDefined();
    expect(found.title).toBe("Alpha Quantum Computing Notes");

    // Verify that unpinned notes are strictly organized in alphabetical order (A-Z)
    expect(result.current.filteredNotes).toBeDefined();
    const unpinnedNotes = result.current.filteredNotes.filter((n) => !n.pinned);
    const cleanTitles = unpinnedNotes.map((n) =>
      (n.title || "").replace(/^[^a-zA-Z0-9]+/, "").trim().toLowerCase()
    );
    const sortedClean = [...cleanTitles].sort((a, b) => a.localeCompare(b));
    expect(cleanTitles).toEqual(sortedClean);
  });

  it("should support toggling favorite and updating note content", () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    const targetNote = result.current.notes[0];
    const initialFav = !!targetNote.favorite;

    act(() => {
      result.current.toggleFavorite(targetNote.id);
    });

    const updated = result.current.notes.find((n) => n.id === targetNote.id);
    expect(updated.favorite).toBe(!initialFav);

    act(() => {
      result.current.updateNote(targetNote.id, {
        title: "Updated Research Analysis",
      });
    });

    const updatedTitle = result.current.notes.find((n) => n.id === targetNote.id);
    expect(updatedTitle.title).toBe("Updated Research Analysis");
  });

  it("should identify PDF and office documents accurately across formats", () => {
    expect(isDocOrPdfAttachment({ name: "lecture_slides.pdf", type: "application/pdf" })).toBe(true);
    expect(isDocOrPdfAttachment({ name: "syllabus.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBe(true);
    expect(isDocOrPdfAttachment({ name: "data.csv", type: "text/csv" })).toBe(true);
    expect(isDocOrPdfAttachment({ name: "notes.txt", type: "text/plain" })).toBe(true);
    expect(isDocOrPdfAttachment({ name: "diagram.png", type: "image/png" })).toBe(false);
  });

  it("should ensure all prewritten seed notes have non-empty content and title", () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    expect(result.current.notes.length).toBeGreaterThanOrEqual(6);
    result.current.notes.forEach((note) => {
      expect(note.title).toBeTruthy();
      expect(note.title.trim().length).toBeGreaterThan(0);
      expect(note.content).toBeTruthy();
      expect(note.content.trim().length).toBeGreaterThan(0);
    });

    // Verify selecting a note provides selectedNote with full content
    const welcomeNote = result.current.notes.find((n) => n.id === "note-1");
    expect(welcomeNote).toBeDefined();
    act(() => {
      result.current.setSelectedId(welcomeNote.id);
    });
    expect(result.current.selectedNote).toBeDefined();
    expect(result.current.selectedNote.content).toContain("Your centralized productivity command center");
  });

  it("should support tag filtering and clearing active tag", () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    act(() => {
      result.current.setSelectedTag("research");
    });
    expect(result.current.selectedTag).toBe("research");

    act(() => {
      result.current.setSelectedTag(null);
    });
    expect(result.current.selectedTag).toBeNull();
  });
});
