"use client";

import { useState, useEffect } from "react";
import { X, History, RotateCcw, Eye, Clock, User } from "lucide-react";
import { DocumentVersion } from "@/types/document";
import { getVersionHistory } from "@/lib/versions";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentContent: string;
  onRollback: (version: DocumentVersion) => void;
  onPreview: (version: DocumentVersion) => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  documentId,
  currentContent,
  onRollback,
  onPreview,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const history = await getVersionHistory(documentId);
      setVersions(history);
    } catch (error) {
      console.error("Error loading version history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const getContentPreview = (content: string) => {
    const preview = content.slice(0, 100).replace(/\n/g, " ");
    return content.length > 100 ? `${preview}...` : preview;
  };

  const getCharDiff = (version: DocumentVersion) => {
    const diff = version.content.length - currentContent.length;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-lg overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2
              className="text-lg font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Version History
            </h2>
            <span
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              (max 25 versions)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p style={{ color: "var(--text-muted)" }}>Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History
                className="w-12 h-12 mb-3"
                style={{ color: "var(--text-muted)", opacity: 0.5 }}
              />
              <p style={{ color: "var(--text-muted)" }}>No version history yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                Versions are created when you save the document
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedVersion?.id === version.id ? "ring-2" : ""
                  }`}
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "var(--border-primary)",
                    ...(selectedVersion?.id === version.id && {
                      borderColor: "var(--accent)",
                    }),
                  }}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Version header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Version {version.versionNumber}
                          {index === 0 && (
                            <span
                              className="ml-2 text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: "var(--accent)",
                                color: "var(--bg-primary)",
                              }}
                            >
                              Latest
                            </span>
                          )}
                        </span>
                        {getCharDiff(version) && (
                          <span
                            className="text-xs"
                            style={{
                              color: getCharDiff(version)?.startsWith("+")
                                ? "var(--accent)"
                                : "var(--text-muted)",
                            }}
                          >
                            {getCharDiff(version)} chars
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p
                        className="text-sm font-medium truncate mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {version.title}
                      </p>

                      {/* Content preview */}
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {getContentPreview(version.content) || "(empty)"}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                            title={formatDate(version.createdAt)}
                          >
                            {formatRelativeTime(version.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                          <span
                            className="text-xs truncate max-w-32"
                            style={{ color: "var(--text-muted)" }}
                            title={version.createdBy.email}
                          >
                            {version.createdBy.displayName || version.createdBy.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(version);
                        }}
                        className="p-1.5 rounded transition-colors hover:opacity-70"
                        style={{ color: "var(--text-muted)" }}
                        title="Preview this version"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {index !== 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollback(version);
                          }}
                          className="p-1.5 rounded transition-colors hover:opacity-70"
                          style={{ color: "var(--accent)" }}
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {versions.length} version{versions.length !== 1 ? "s" : ""} saved
          </p>
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
        </div>
      </div>
    </div>
  );
}
