"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserDocuments, getSharedDocuments, deleteDocument } from "@/lib/documents";
import { Document } from "@/types/document";
import { 
  Plus, 
  FileText, 
  Trash2, 
  LogOut, 
  Sun, 
  Moon,
  Search,
  MoreVertical,
  Shield
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"owned" | "shared">("owned");
  const { user, appUser, isApproved, isAdmin, canCreateDocuments, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

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

    const fetchDocuments = async () => {
      try {
        const [ownedDocs, shared] = await Promise.all([
          getUserDocuments(user.uid),
          getSharedDocuments(user.email || ""),
        ]);
        setDocuments(ownedDocs);
        setSharedDocuments(shared);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, appUser, isApproved, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter((doc) => doc.id !== docId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const filteredDocuments = (activeTab === "owned" ? documents : sharedDocuments).filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-10 border-b"
        style={{ 
          background: "var(--bg-primary)", 
          borderColor: "var(--border-primary)" 
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 
            className="text-lg font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            KirokuMD
          </h1>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2 transition-opacity hover:opacity-70"
                style={{ color: "var(--accent)" }}
                title="Admin panel"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

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

            <button
              onClick={handleSignOut}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div 
          className="flex gap-1 mb-6 p-1 w-fit"
          style={{ background: "var(--bg-secondary)" }}
        >
          <button
            onClick={() => setActiveTab("owned")}
            className="px-4 py-1.5 text-sm transition-colors"
            style={{ 
              background: activeTab === "owned" ? "var(--bg-primary)" : "transparent",
              color: activeTab === "owned" ? "var(--text-primary)" : "var(--text-muted)"
            }}
          >
            My Documents
            {documents.length > 0 && (
              <span className="ml-1.5 text-xs">({documents.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className="px-4 py-1.5 text-sm transition-colors"
            style={{ 
              background: activeTab === "shared" ? "var(--bg-primary)" : "transparent",
              color: activeTab === "shared" ? "var(--text-primary)" : "var(--text-muted)"
            }}
          >
            Shared with me
            {sharedDocuments.length > 0 && (
              <span className="ml-1.5 text-xs">({sharedDocuments.length})</span>
            )}
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-ghost)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-3 py-2 text-sm border outline-none"
              style={{ 
                background: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            />
          </div>

          {activeTab === "owned" && canCreateDocuments && (
            <Link
              href="/editor/new"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ 
                background: "var(--accent)",
                color: "var(--bg-primary)"
              }}
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </Link>
          )}
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div 
            className="text-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            {searchQuery ? (
              <p>No documents found matching your search.</p>
            ) : activeTab === "shared" ? (
              <div>
                <FileText 
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: "var(--text-ghost)" }}
                />
                <p>No shared documents yet.</p>
              </div>
            ) : (
              <div>
                <FileText 
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: "var(--text-ghost)" }}
                />
                <p className="mb-4">
                  {canCreateDocuments 
                    ? "No documents yet." 
                    : "No documents available. Ask an owner to share documents with you."}
                </p>
                {canCreateDocuments && (
                  <Link
                    href="/editor/new"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm"
                    style={{ color: "var(--accent)" }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create your first document</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative border transition-colors"
                style={{ 
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)"
                }}
              >
                <Link
                  href={`/editor/${doc.id}`}
                  className="block p-4"
                >
                  <h3 
                    className="font-medium mb-2 truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {doc.title || "Untitled"}
                  </h3>
                  <p 
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {doc.content.substring(0, 100) || "Empty document"}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: "var(--text-ghost)" }}
                  >
                    Updated {formatDate(doc.updatedAt)}
                  </p>
                </Link>

                {/* Actions - only show delete for owned documents */}
                {activeTab === "owned" && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteConfirm(deleteConfirm === doc.id ? null : doc.id);
                      }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {deleteConfirm === doc.id && (
                      <div 
                        className="absolute right-0 top-8 border py-1 min-w-[120px]"
                        style={{ 
                          background: "var(--bg-primary)",
                          borderColor: "var(--border-primary)"
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(doc.id);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors hover:opacity-70"
                          style={{ color: "var(--accent)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
