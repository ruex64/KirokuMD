"use client";

import { X, RotateCcw, Clock, User } from "lucide-react";
import { DocumentVersion } from "@/types/document";
import MarkdownPreview from "./MarkdownPreview";

interface VersionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: DocumentVersion | null;
  onRollback: (version: DocumentVersion) => void;
  isLatest: boolean;
}

export default function VersionPreviewModal({
  isOpen,
  onClose,
  version,
  onRollback,
  isLatest,
}: VersionPreviewModalProps) {
  if (!isOpen || !version) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-lg shadow-lg overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Version {version.versionNumber}
              </h2>
              {isLatest && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg-primary)",
                  }}
                >
                  Current
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(version.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {version.createdBy.displayName || version.createdBy.email}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title display */}
        <div
          className="px-4 py-2 border-b shrink-0"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Title:{" "}
            <span style={{ color: "var(--text-primary)" }}>
              {version.title}
            </span>
          </p>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <MarkdownPreview content={version.content} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t shrink-0"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {version.content.length} characters
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
              }}
            >
              Close
            </button>
            {!isLatest && (
              <button
                onClick={() => onRollback(version)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
                style={{
                  background: "var(--accent)",
                  color: "var(--bg-primary)",
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Restore this version
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
