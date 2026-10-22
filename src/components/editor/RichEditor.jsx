import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
  Palette,
  Highlighter,
  Clock,
} from "lucide-react";
import "./RichEditor.css";

const PRESET_COLORS = [
  { name: "Default", color: "inherit" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Sky", color: "#0ea5e9" },
  { name: "Purple", color: "#a855f7" },
];

const PRESET_HIGHLIGHTS = [
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bae6fd" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Orange", color: "#fed7aa" },
  { name: "Purple", color: "#e9d5ff" },
];

export default function RichEditor({
  content = "",
  value,
  onChange,
  placeholder = "Write your thoughts here...",
}) {
  // Support both 'value' and 'content' props seamlessly
  const effectiveContent = value !== undefined ? value : content;

  const [, setTick] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: effectiveContent || "",
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
      setTick((t) => t + 1);
    },
  });

  useEffect(() => {
    if (editor && effectiveContent !== undefined && effectiveContent !== editor.getHTML()) {
      editor.commands.setContent(effectiveContent || "", { emitUpdate: false });
    }
  }, [effectiveContent, editor]);

  const text = editor ? editor.getText() : "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const readingTime = Math.ceil(words / 200);
  const stats = { words, characters, readingTime };

  if (!editor) {
    return <div className="rich-editor-loading">Loading editor tools...</div>;
  }

  return (
    <div className="rich-editor-wrapper">
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
        <div className="toolbar-group">
          <button
            type="button"
            className={`tool-btn ${editor.isActive("bold") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("italic") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("underline") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("strike") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            aria-label="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className={`tool-btn ${editor.isActive("heading", { level: 1 }) ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
            aria-label="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            aria-label="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("heading", { level: 3 }) ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
            aria-label="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className={`tool-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            aria-label="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            aria-label="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("taskList") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Task Checklist"
            aria-label="Task Checklist"
          >
            <CheckSquare size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
            aria-label="Quote"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            className={`tool-btn ${editor.isActive("codeBlock") ? "is-active" : ""}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
            aria-label="Code Block"
          >
            <Code size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider Line"
            aria-label="Divider"
          >
            <Minus size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Color Popover Toggle */}
        <div className="color-tool-wrapper">
          <button
            type="button"
            className={`tool-btn ${showColorPicker ? "is-active" : ""}`}
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            title="Text Color"
            aria-label="Text Color"
          >
            <Palette size={16} />
          </button>

          {showColorPicker && (
            <div className="editor-popover">
              <span className="popover-title">Text Color</span>
              <div className="popover-swatches">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className="swatch-btn"
                    style={{ backgroundColor: c.color === "inherit" ? "var(--text)" : c.color }}
                    title={c.name}
                    onClick={() => {
                      if (c.color === "inherit") {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor(c.color).run();
                      }
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
              <label className="custom-color-picker">
                Custom color
                <input
                  type="color"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                    setShowColorPicker(false);
                  }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Highlight Popover Toggle */}
        <div className="color-tool-wrapper">
          <button
            type="button"
            className={`tool-btn ${showHighlightPicker ? "is-active" : ""}`}
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            title="Highlight Text"
            aria-label="Highlight Text"
          >
            <Highlighter size={16} />
          </button>

          {showHighlightPicker && (
            <div className="editor-popover">
              <span className="popover-title">Highlight Color</span>
              <div className="popover-swatches">
                {PRESET_HIGHLIGHTS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className="swatch-btn"
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                    onClick={() => {
                      editor.chain().focus().setHighlight({ color: c.color }).run();
                      setShowHighlightPicker(false);
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                className="popover-clear-btn"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightPicker(false);
                }}
              >
                Clear Highlight
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
          aria-label="Clear formatting"
        >
          <RemoveFormatting size={16} />
        </button>

        <div className="toolbar-spacer" />

        <div className="toolbar-group history-group">
          <button
            type="button"
            className="tool-btn"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      <div className="rich-editor-body" onClick={() => editor.chain().focus()}>
        <EditorContent editor={editor} />
      </div>

      <div className="rich-editor-stats" aria-live="polite">
        <div className="stats-counters">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.characters} chars</span>
        </div>
        <div className="reading-time">
          <Clock size={12} />
          <span>{stats.readingTime} min read</span>
        </div>
      </div>
    </div>
  );
}
