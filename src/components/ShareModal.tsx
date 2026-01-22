"use client";

import { useState } from "react";
import { X, UserPlus, Trash2, Users } from "lucide-react";
import { Collaborator, CollaboratorRole } from "@/types/document";
import { 
  addCollaborator, 
  removeCollaborator, 
  updateCollaboratorRole 
} from "@/lib/documents";

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  collaborators: Collaborator[];
  currentUserId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareModal({
  documentId,
  documentTitle,
  collaborators,
  currentUserId,
  onClose,
  onUpdate,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      return;
    }

    // Check if already a collaborator
    if (collaborators.some((c) => c.email === email)) {
      setError("This user is already a collaborator");
      return;
    }

    setLoading(true);
    try {
      await addCollaborator(documentId, {
        userId: "", // Will be filled when user accesses
        email: email.trim().toLowerCase(),
        role,
        addedBy: currentUserId,
      });
      setEmail("");
      setRole("viewer");
      onUpdate();
    } catch (err) {
      setError("Failed to add collaborator");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail: string) => {
    setLoading(true);
    try {
      await removeCollaborator(documentId, collaboratorEmail);
      onUpdate();
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (collaboratorEmail: string, newRole: CollaboratorRole) => {
    setLoading(true);
    try {
      await updateCollaboratorRole(documentId, collaboratorEmail, newRole);
      onUpdate();
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setLoading(false);
    }
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
        className="relative w-full max-w-md border"
        style={{ 
          background: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div>
            <h2 
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Share Document
            </h2>
            <p 
              className="text-xs mt-0.5 truncate max-w-[250px]"
              style={{ color: "var(--text-muted)" }}
            >
              {documentTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollaborator} className="p-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 text-sm border outline-none"
              style={{ 
                background: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
              disabled={loading}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              className="px-2 py-2 text-sm border outline-none cursor-pointer"
              style={{ 
                background: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
              disabled={loading}
            >
              <option value="viewer">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ 
                background: "var(--accent)",
                color: "var(--bg-primary)"
              }}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <p 
              className="text-xs mt-2"
              style={{ color: "var(--accent)" }}
            >
              {error}
            </p>
          )}
        </form>

        {/* Collaborators List */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {collaborators.length === 0 ? (
            <div 
              className="text-center py-6"
              style={{ color: "var(--text-muted)" }}
            >
              <Users 
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "var(--text-ghost)" }}
              />
              <p className="text-sm">No collaborators yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.email}
                  className="flex items-center justify-between py-2 px-3"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {collaborator.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <select
                      value={collaborator.role}
                      onChange={(e) => handleRoleChange(collaborator.email, e.target.value as CollaboratorRole)}
                      disabled={loading}
                      className="px-2 py-1 text-xs border outline-none cursor-pointer disabled:opacity-50"
                      style={{ 
                        background: "var(--bg-primary)",
                        borderColor: "var(--border-primary)",
                        color: "var(--text-primary)"
                      }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.email)}
                      disabled={loading}
                      className="p-1 transition-opacity hover:opacity-70 disabled:opacity-50"
                      style={{ color: "var(--accent)" }}
                      title="Remove collaborator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-4 py-3 border-t text-xs"
          style={{ 
            borderColor: "var(--border-primary)",
            color: "var(--text-ghost)"
          }}
        >
          <p><strong>Viewer:</strong> Can view the document</p>
          <p><strong>Commenter:</strong> Can view and comment</p>
          <p><strong>Editor:</strong> Can view and edit</p>
        </div>
      </div>
    </div>
  );
}
