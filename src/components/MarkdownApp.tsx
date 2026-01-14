"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2, Sun, Moon, Download, Info, X } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownPreview from "./MarkdownPreview";
import ExportModal from "./ExportModal";
import { useTheme } from "@/context/ThemeContext";

const DEFAULT_CONTENT = ``;

const EMPTY_STATE_TEXT = "Begin writing your record.";

export default function MarkdownApp() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [focusMode, setFocusMode] = useState<"none" | "editor" | "preview">("none");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [lastModified, setLastModified] = useState<Date>(new Date());
  const { theme, toggleTheme } = useTheme();

  const [filename, setFilename] = useState("Untitled");
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const createdDate = useState<Date>(() => new Date())[0];

  useEffect(() => {
    if (content !== DEFAULT_CONTENT) {
      setIsSaved(false);
      setLastModified(new Date());
      const timer = setTimeout(() => setIsSaved(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [content]);

  const toggleFocusMode = () => {
    if (focusMode === "none") {
      setFocusMode("editor");
    } else if (focusMode === "editor") {
      setFocusMode("preview");
    } else {
      setFocusMode("none");
    }
  };

  const showEditor = focusMode !== "preview";
  const showPreview = focusMode !== "editor";

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Top Utility Bar */}
      <header 
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ 
          background: "var(--bg-primary)", 
          borderColor: "var(--border-primary)" 
        }}
      >
        <div className="flex items-center gap-3">
          {isEditingFilename ? (
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onBlur={() => setIsEditingFilename(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingFilename(false);
                if (e.key === "Escape") setIsEditingFilename(false);
              }}
              autoFocus
              className="text-sm font-medium bg-transparent border-b outline-none"
              style={{ 
                color: "var(--text-primary)",
                borderColor: "var(--accent)"
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingFilename(true)}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-secondary)" }}
              title="Click to rename"
            >
              {filename}
            </button>
          )}
          <span 
            className="status-text"
            style={{ color: isSaved ? "var(--text-ghost)" : "var(--accent)" }}
          >
            {isSaved ? "Saved" : "Editing..."}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Metadata Toggle */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Document Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Focus Mode Toggle */}
          <button
            onClick={toggleFocusMode}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title={focusMode === "none" ? "Focus Mode" : "Exit Focus Mode"}
          >
            {focusMode === "none" ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Export Document"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Metadata Panel */}
      {showMetadata && (
        <div 
          className="px-4 py-3 border-b"
          style={{ 
            background: "var(--bg-secondary)", 
            borderColor: "var(--border-primary)" 
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <span className="pane-label block mb-1">TITLE</span>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {filename}
                </span>
              </div>
              <div>
                <span className="pane-label block mb-1">CREATED</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {createdDate.toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  })}
                </span>
              </div>
              <div>
                <span className="pane-label block mb-1">MODIFIED</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {lastModified.toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowMetadata(false)}
              className="p-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-ghost)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {showEditor && (
          <div
            className={`focus-transition flex flex-col ${
              showPreview ? "w-1/2" : "w-full"
            } ${focusMode === "editor" ? "px-4" : ""}`}
            style={{ background: "var(--bg-secondary)" }}
          >
            {/* Pane Label */}
            <div className="px-4 pt-2 pb-1">
              <span className="pane-label">
                編集 <span style={{ opacity: 0.6 }}>Edit</span>
              </span>
            </div>
            <MarkdownEditor 
              value={content} 
              onChange={setContent} 
              placeholder={EMPTY_STATE_TEXT}
            />
          </div>
        )}

        {/* Vertical Divider */}
        {showEditor && showPreview && (
          <div className="vertical-divider" />
        )}

        {showPreview && (
          <div 
            className={`focus-transition flex flex-col ${
              showEditor ? "w-1/2" : "w-full"
            } ${focusMode === "preview" ? "px-4" : ""}`}
            style={{ background: "var(--bg-primary)" }}
          >
            {/* Pane Label */}
            <div className="px-4 pt-2 pb-1">
              <span className="pane-label">
                表示 <span style={{ opacity: 0.6 }}>Preview</span>
              </span>
            </div>
            <MarkdownPreview content={content} />
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer 
        className="px-4 py-1.5 flex items-center justify-end gap-4 border-t"
        style={{ 
          background: "var(--bg-primary)", 
          borderColor: "var(--border-subtle)" 
        }}
      >
        <span className="status-text">
          {charCount} characters
        </span>
        <span className="status-text">
          {wordCount} words
        </span>
      </footer>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          content={content}
          filename={filename}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
