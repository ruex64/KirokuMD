"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  getDocument, 
  createDocument, 
  updateDocument,
  hasDocumentAccess,
} from "@/lib/documents";
import { getLatestVersionNumber } from "@/lib/versions";
import { Document, Collaborator, DocumentVersion } from "@/types/document";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import ExportModal from "@/components/ExportModal";
import ShareModal from "@/components/ShareModal";
import VersionHistoryModal from "@/components/VersionHistoryModal";
import VersionPreviewModal from "@/components/VersionPreviewModal";
import {
  ArrowLeft,
  Sun,
  Moon,
  Download,
  Save,
  Maximize,
  Minimize,
  Check,
  Share2,
  Eye,
  History,
} from "lucide-react";
import Link from "next/link";

type ViewMode = "split" | "editor" | "preview";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, appUser, isApproved, canCreateDocuments } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const docId = params.id as string;
  const isNew = docId === "new";

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [currentDocId, setCurrentDocId] = useState<string | null>(
    isNew ? null : docId
  );
  const [accessRole, setAccessRole] = useState<"owner" | "editor" | "commenter" | "viewer" | null>(null);

  // Track last saved content for auto-save versioning
  const lastSavedContent = useRef<string>("");
  const lastSavedTitle = useRef<string>("");
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if user can edit
  const canEdit = accessRole === "owner" || accessRole === "editor";

  // Load document if editing existing
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check approval status
    if (appUser) {
      if (appUser.status === "pending") {
        router.push("/pending");
        return;
      }
      if (appUser.status === "rejected") {
        router.push("/access-denied");
        return;
      }
    }

    if (!isApproved) {
      return; // Wait for approval status to load
    }

    if (!isNew) {
      const loadDocument = async () => {
        try {
          const doc = await getDocument(docId);
          if (doc) {
            const access = hasDocumentAccess(doc, user.uid, user.email || "");
            if (access.hasAccess) {
              setTitle(doc.title);
              setContent(doc.content);
              setCollaborators(doc.collaborators || []);
              setAccessRole(access.role);
              setCurrentVersion(doc.currentVersion || 1);
              // Initialize refs for tracking changes
              lastSavedContent.current = doc.content;
              lastSavedTitle.current = doc.title;
            } else {
              // No access to document
              router.push("/dashboard");
            }
          } else {
            // Document not found
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error loading document:", error);
          router.push("/dashboard");
        } finally {
          setLoading(false);
        }
      };
      loadDocument();
    } else {
      // New document - only admin/owner can create
      if (!canCreateDocuments) {
        router.push("/dashboard");
        return;
      }
      setAccessRole("owner");
      setLoading(false);
    }
  }, [user, appUser, isApproved, canCreateDocuments, docId, isNew, router]);

  // Refresh document data (for share modal updates)
  const refreshDocument = async () => {
    if (currentDocId) {
      const doc = await getDocument(currentDocId);
      if (doc) {
        setCollaborators(doc.collaborators || []);
      }
    }
  };

  // Auto-save with debounce
  const saveDocument = useCallback(async (createNewVersion: boolean = true) => {
    if (!user || !canEdit) return;

    // Check if content actually changed (for versioning)
    const contentChanged = content !== lastSavedContent.current || title !== lastSavedTitle.current;

    setSaving(true);
    try {
      if (currentDocId) {
        // Update existing document
        const versionInfo = createNewVersion && contentChanged ? {
          userId: user.uid,
          email: user.email || "",
          displayName: user.displayName,
        } : undefined;

        const newVersion = await updateDocument(
          currentDocId, 
          { title, content },
          versionInfo
        );
        
        if (newVersion > 0) {
          setCurrentVersion(newVersion);
        }
        
        // Update refs
        lastSavedContent.current = content;
        lastSavedTitle.current = title;
      } else {
        // Create new document with initial version
        const newDocId = await createDocument(
          {
            title,
            content,
            userId: user.uid,
          },
          {
            userId: user.uid,
            email: user.email || "",
            displayName: user.displayName,
          }
        );
        setCurrentDocId(newDocId);
        setAccessRole("owner");
        setCurrentVersion(1);
        lastSavedContent.current = content;
        lastSavedTitle.current = title;
        // Update URL without full navigation
        window.history.replaceState(null, "", `/editor/${newDocId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSaving(false);
    }
  }, [user, canEdit, currentDocId, title, content]);

  // Auto-save with debounce (creates version after 30 seconds of inactivity)
  useEffect(() => {
    if (!canEdit || !currentDocId) return;

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer for auto-save (30 second debounce)
    autoSaveTimer.current = setTimeout(() => {
      const hasChanges = content !== lastSavedContent.current || title !== lastSavedTitle.current;
      if (hasChanges) {
        saveDocument(true);
      }
    }, 30000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, title, canEdit, currentDocId, saveDocument]);

  // Handle version rollback
  const handleRollback = (version: DocumentVersion) => {
    setTitle(version.title);
    setContent(version.content);
    setShowVersionHistory(false);
    setPreviewVersion(null);
    // Save immediately with new version
    setTimeout(() => saveDocument(true), 100);
  };

  // Handle version preview
  const handlePreviewVersion = (version: DocumentVersion) => {
    setPreviewVersion(version);
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveDocument();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDocument]);

  const cycleViewMode = () => {
    const modes: ViewMode[] = ["split", "editor", "preview"];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  if (loading) {
    return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="shrink-0 h-12 flex items-center justify-between px-4 border-b"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <input
            type="text"
            value={title}
            onChange={(e) => canEdit && setTitle(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
            placeholder="Untitled"
            readOnly={!canEdit}
          />

          {!canEdit && (
            <span 
              className="flex items-center gap-1 text-xs px-2 py-0.5"
              style={{ 
                background: "var(--bg-secondary)",
                color: "var(--text-muted)"
              }}
            >
              <Eye className="w-3 h-3" />
              {accessRole === "commenter" ? "Commenter" : "View only"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Save status */}
          <span 
            className="text-xs mr-2"
            style={{ color: "var(--text-ghost)" }}
          >
            {saving ? "Saving..." : saved ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : null}
          </span>

          {canEdit && (
            <button
              onClick={() => saveDocument(true)}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Save (Ctrl+S)"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
            </button>
          )}

          {/* Version history button */}
          {currentDocId && (
            <button
              onClick={() => setShowVersionHistory(true)}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Version history"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Share button - only for owner */}
          {accessRole === "owner" && currentDocId && (
            <button
              onClick={() => setShowShare(true)}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={cycleViewMode}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title={`View mode: ${viewMode}`}
          >
            {viewMode === "split" ? (
              <Maximize className="w-4 h-4" />
            ) : (
              <Minimize className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setShowExport(true)}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>

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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div
            className={`flex flex-col ${
              viewMode === "split" ? "w-1/2 border-r" : "w-full"
            }`}
            style={{ 
              borderColor: "var(--border-primary)",
              background: "var(--bg-secondary)" 
            }}
          >
            {viewMode === "split" && (
              <div
                className="shrink-0 px-3 py-1.5 text-xs font-medium border-b"
                style={{ 
                  borderColor: "var(--border-primary)",
                  color: "var(--accent)"
                }}
              >
                Editor
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor 
                value={content} 
                onChange={canEdit ? setContent : () => {}}
                readOnly={!canEdit}
              />
            </div>
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            className={`flex flex-col ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
            style={{ background: "var(--bg-primary)" }}
          >
            {viewMode === "split" && (
              <div
                className="shrink-0 px-3 py-1.5 text-xs font-medium border-b"
                style={{ 
                  borderColor: "var(--border-primary)",
                  color: "var(--accent)"
                }}
              >
                Preview
              </div>
            )}
            <div className="flex-1 overflow-auto p-6">
              <MarkdownPreview content={content} />
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          content={content}
          filename={title || "untitled"}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Share Modal */}
      {showShare && currentDocId && user && (
        <ShareModal
          documentId={currentDocId}
          documentTitle={title}
          collaborators={collaborators}
          currentUserId={user.uid}
          onClose={() => setShowShare(false)}
          onUpdate={refreshDocument}
        />
      )}

      {/* Version History Modal */}
      {showVersionHistory && currentDocId && (
        <VersionHistoryModal
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          documentId={currentDocId}
          currentContent={content}
          onRollback={handleRollback}
          onPreview={handlePreviewVersion}
        />
      )}

      {/* Version Preview Modal */}
      {previewVersion && (
        <VersionPreviewModal
          isOpen={!!previewVersion}
          onClose={() => setPreviewVersion(null)}
          version={previewVersion}
          onRollback={handleRollback}
          isLatest={previewVersion.versionNumber === currentVersion}
        />
      )}
    </div>
  );
}
