// Seed data for new users and demo account

export const defaultFolders = [
  { id: "folder-personal", name: "Personal", color: "#f59e0b", icon: "User" },
  { id: "folder-work", name: "Work & Projects", color: "#8b5cf6", icon: "Briefcase" },
  { id: "folder-tasks", name: "Daily Tasks", color: "#10b981", icon: "CheckSquare" },
  { id: "folder-ideas", name: "Creative Ideas", color: "#ec4899", icon: "Lightbulb" },
];

export const samplePdfAttachment = {
  id: "att-sample-pdf-1",
  name: "Cloud-Architecture-Overview.pdf",
  size: 8940,
  type: "application/pdf",
  isPdf: true,
  dataUrl:
    "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA5NSA+PgpzdHJlYW0KQlQKL0YxIDIyIFRmCjcyIDcxMCBUZAooTm90ZVNwYWNlIFBERiBOb3RlcyAtIENsb3VkIEFyY2hpdGVjdHVyZSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ0IDAwMDAwIG4gCjAwMDAwMDAzODkgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0NjYKJSVFT0Y=",
  uploadedAt: Date.now() - 3600000 * 5,
};

export const sampleImageAttachment = {
  id: "att-sample-1",
  name: "project-wireframe-sketch.svg",
  size: 3420,
  type: "image/svg+xml",
  dataUrl:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360' viewBox='0 0 600 360'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366f1'/><stop offset='100%' stop-color='%23a855f7'/></linearGradient></defs><rect width='600' height='360' rx='16' fill='%2318181b'/><rect x='20' y='20' width='560' height='60' rx='10' fill='%2327272a'/><circle cx='50' cy='50' r='12' fill='url(%23g)'/><rect x='80' y='42' width='120' height='16' rx='4' fill='%2371717a'/><rect x='20' y='100' width='160' height='240' rx='10' fill='%2327272a'/><rect x='200' y='100' width='380' height='240' rx='10' fill='%2327272a'/><rect x='220' y='120' width='240' height='24' rx='6' fill='url(%23g)'/><rect x='220' y='160' width='340' height='12' rx='4' fill='%2352525b'/><rect x='220' y='184' width='280' height='12' rx='4' fill='%2352525b'/><rect x='220' y='208' width='310' height='12' rx='4' fill='%2352525b'/><text x='300' y='310' font-family='sans-serif' font-size='14' fill='%23a1a1aa' text-anchor='middle'>Notespace Architecture Concept Wireframe</text></svg>",
  uploadedAt: Date.now() - 3600000 * 2,
};

export const sampleDocAttachment = {
  id: "att-sample-2",
  name: "Product-Release-Checklist.txt",
  size: 1420,
  type: "text/plain",
  dataUrl: "data:text/plain;charset=utf-8,Release%20V1.0%20Notes%20%26%20Testing%20Sign-off%0A%0A-%20Performance%20testing%3A%20Passed%0A-%20Dark%20mode%20contrast%3A%20WCAG%20AA%20Compliant%0A-%20Cloud%20sync%20resilience%3A%20Verified",
  uploadedAt: Date.now() - 3600000 * 12,
};

export function getInitialSeedNotes() {
  const now = Date.now();
  const tomorrow = new Date(now + 86400000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return [
    {
      id: "note-pdf-1",
      title: "📄 Cloud Architecture & Security Guide.pdf",
      content:
        "<h2>📄 Imported PDF Note: Cloud Architecture Overview</h2><p>This note was generated from an uploaded PDF document. You can preview, view, or download the full PDF document anytime using the built-in document viewer.</p><p><strong>File Specifications:</strong></p><ul><li>Format: <code>application/pdf</code></li><li>Size: 8.9 KB</li><li>Status: Fully Parsed &amp; Indexed</li></ul><p>Use the PDF Action button to view the embedded document in the interactive reader modal.</p>",
      folderId: "folder-work",
      category: "Work & Projects",
      color: "rose",
      pinned: true,
      favorite: true,
      format: "pdf",
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["pdf", "architecture", "security", "documents"],
      createdAt: now - 86400000,
      updatedAt: now - 1200000,
      reminder: null,
      tasks: [
        { id: "t-pdf-1", text: "Review cloud security guidelines in PDF", completed: false },
        { id: "t-pdf-2", text: "Export annotations and summary", completed: false },
      ],
      attachments: [samplePdfAttachment],
    },
    {
      id: "note-1",
      title: "🚀 Welcome to Notespace Workspace",
      content:
        "<h2>Your centralized productivity command center</h2><p>Notespace is designed to help you capture thoughts, organize projects, and stay in flow with a fast, distraction-free environment.</p><blockquote><p>“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra</p></blockquote><h3>Key features you can explore right now:</h3><ul><li><strong>Rich-Text Editor:</strong> Highlight text, customize colors, format quotes, code, and lists.</li><li><strong>Custom Folders &amp; Tags:</strong> Group notes logically and filter in real-time.</li><li><strong>PDF &amp; File Uploads:</strong> Upload PDF notes, markdown, text files, and word documents directly!</li><li><strong>Alphabetical Order:</strong> All your notes are neatly arranged in A–Z alphabetical sequence with instant letter jumps.</li><li><strong>Task Checklists:</strong> Manage to-do lists directly inside your notes with completion progress.</li><li><strong>Timely Reminders:</strong> Set due dates and get browser audio/visual alerts.</li></ul>",
      folderId: "folder-personal",
      category: "Personal",
      color: "violet",
      pinned: true,
      favorite: true,
      format: "note",
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["welcome", "guide", "productivity"],
      createdAt: now - 86400000 * 2,
      updatedAt: now - 1800000,
      reminder: {
        date: tomorrowStr,
        time: "10:00",
        active: true,
        notified: false,
      },
      tasks: [
        { id: "t-1", text: "Explore the Rich-text editor formatting tools", completed: true },
        { id: "t-2", text: "Upload a PDF or Markdown note via the upload module", completed: true },
        { id: "t-3", text: "Browse notes in Alphabetical Order (A–Z)", completed: true },
        { id: "t-4", text: "Toggle dark mode in the top right corner", completed: false },
      ],
      attachments: [sampleImageAttachment],
    },
    {
      id: "note-2",
      title: "🎯 Q4 Product Sprint & Architecture Plan",
      content:
        "<h2>Engineering Milestones & Goals</h2><p>Overview of the upcoming technical enhancements and performance benchmarks.</p><h3>Sprint Objectives:</h3><ol><li>Complete local persistence with robust IndexedDB/localStorage fallback.</li><li>Integrate real-time debounced autosave state feedback (Saving &rarr; Saved).</li><li>Optimize bundle splitting and image preview lightboxes.</li></ol><p>Keep modular architecture clean with separated context providers and reusable UI components.</p>",
      folderId: "folder-work",
      category: "Work & Projects",
      color: "blue",
      pinned: true,
      favorite: false,
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["engineering", "roadmap", "architecture"],
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000 * 4,
      reminder: null,
      tasks: [
        { id: "t-21", text: "Review API schema and auth payload", completed: true },
        { id: "t-22", text: "Run automated test builds", completed: true },
        { id: "t-23", text: "Set up Web Notifications permissions flow", completed: true },
        { id: "t-24", text: "Prepare cloud export JSON schema", completed: false },
      ],
      attachments: [sampleDocAttachment],
    },
    {
      id: "note-3",
      title: "✅ Weekly High-Priority To-Do List",
      content:
        "<h2>Action Items for the Week</h2><p>Focus on high-leverage outcomes. Clear blockers before Thursday afternoon.</p>",
      folderId: "folder-tasks",
      category: "Daily Tasks",
      color: "emerald",
      pinned: false,
      favorite: true,
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["focus", "weekly", "tasks"],
      createdAt: now - 86400000,
      updatedAt: now - 3600000 * 6,
      reminder: {
        date: tomorrowStr,
        time: "15:30",
        active: true,
        notified: false,
      },
      tasks: [
        { id: "t-31", text: "Schedule 1-on-1 team sync", completed: true },
        { id: "t-32", text: "Draft architecture proposal for cloud sync", completed: false },
        { id: "t-33", text: "Organize client feedback survey responses", completed: false },
        { id: "t-34", text: "Clean up project repository branch history", completed: false },
      ],
      attachments: [],
    },
    {
      id: "note-4",
      title: "💡 Brainstorming: Minimalist Mobile Experience",
      content:
        "<h2>User Experience Exploration</h2><p>Ideas for mobile interactions:</p><ul><li>Quick swipe actions to archive or star notes.</li><li>Bottom quick-access toolbar for immediate capture.</li><li>Voice memo transcription integration in future phases.</li></ul><p>Focus heavily on micro-animations and instantaneous search response times.</p>",
      folderId: "folder-ideas",
      category: "Creative Ideas",
      color: "rose",
      pinned: false,
      favorite: false,
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["ideas", "mobile", "ux"],
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000,
      reminder: null,
      tasks: [],
      attachments: [],
    },
    {
      id: "note-5",
      title: "📚 Recommended Books & Reading Notes",
      content:
        "<h2>Productivity & Philosophy</h2><p>Key takeaways from recent reads:</p><p><strong>Deep Work by Cal Newport:</strong> The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.</p><p><strong>Atomic Habits by James Clear:</strong> You do not rise to the level of your goals. You fall to the level of your systems.</p>",
      folderId: "folder-personal",
      category: "Personal",
      color: "amber",
      pinned: false,
      favorite: true,
      archived: false,
      deleted: false,
      deletedAt: null,
      tags: ["books", "quotes", "reading"],
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 2,
      reminder: null,
      tasks: [],
      attachments: [],
    },
  ];
}
