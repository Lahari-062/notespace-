import { useState } from "react";
import { useNotes } from "../../context/useNotes";
import {
  X,
  Folder,
  Briefcase,
  User,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Heart,
  Star,
  Compass,
  Code,
  Trash2,
  Check,
} from "lucide-react";

const FOLDER_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

const FOLDER_ICONS = [
  { name: "Folder", icon: Folder },
  { name: "Briefcase", icon: Briefcase },
  { name: "User", icon: User },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "CheckSquare", icon: CheckSquare },
  { name: "BookOpen", icon: BookOpen },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Compass", icon: Compass },
  { name: "Code", icon: Code },
];

function FolderFormContent({ folderToEdit, onClose }) {
  const { createFolder, updateFolder, deleteFolder } = useNotes();
  const [name, setName] = useState(folderToEdit?.name || "");
  const [color, setColor] = useState(folderToEdit?.color || FOLDER_COLORS[0]);
  const [icon, setIcon] = useState(folderToEdit?.icon || "Folder");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (folderToEdit) {
      updateFolder(folderToEdit.id, { name: name.trim(), color, icon });
    } else {
      createFolder({ name: name.trim(), color, icon });
    }
    onClose();
  }

  function handleDelete() {
    if (folderToEdit) {
      if (window.confirm(`Delete folder "${folderToEdit.name}"? Notes inside will remain in workspace.`)) {
        deleteFolder(folderToEdit.id);
        onClose();
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="folder-form">
      <div className="form-group">
        <label htmlFor="folder-name-input">Folder Name</label>
        <input
          id="folder-name-input"
          type="text"
          placeholder="e.g. Travel Plans, Marketing, Research"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>

      <div className="form-group">
        <label>Color Accent</label>
        <div className="color-swatch-row">
          {FOLDER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`folder-color-chip ${color === c ? "is-selected" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title={c}
            >
              {color === c && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Folder Icon</label>
        <div className="icon-select-grid">
          {FOLDER_ICONS.map(({ name: iconName, icon: IconComponent }) => (
            <button
              key={iconName}
              type="button"
              className={`icon-option-btn ${icon === iconName ? "is-selected" : ""}`}
              onClick={() => setIcon(iconName)}
              title={iconName}
            >
              <IconComponent size={18} />
            </button>
          ))}
        </div>
      </div>

      <footer className="modal-footer folder-footer">
        {folderToEdit && (
          <button type="button" className="danger-outline-btn" onClick={handleDelete}>
            <Trash2 size={16} /> Delete Folder
          </button>
        )}
        <div className="folder-footer-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-btn">
            {folderToEdit ? "Save Changes" : "Create Folder"}
          </button>
        </div>
      </footer>
    </form>
  );
}

export default function FolderModal({ isOpen, folderToEdit, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog folder-modal" role="dialog" aria-modal="true">
        <header className="modal-header">
          <div className="folder-modal-title">
            <div className="folder-icon-preview" style={{ backgroundColor: `${folderToEdit?.color || FOLDER_COLORS[0]}20`, color: folderToEdit?.color || FOLDER_COLORS[0] }}>
              <Folder size={20} />
            </div>
            <h2>{folderToEdit ? "Edit Folder" : "New Folder"}</h2>
          </div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        <FolderFormContent
          key={folderToEdit ? folderToEdit.id : "new-folder"}
          folderToEdit={folderToEdit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
