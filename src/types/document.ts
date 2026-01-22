export type CollaboratorRole = "editor" | "commenter" | "viewer";

export interface Collaborator {
  userId: string;
  email: string;
  role: CollaboratorRole;
  addedAt: Date;
  addedBy: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: {
    userId: string;
    email: string;
    displayName: string | null;
  };
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string; // Owner
  collaborators: Collaborator[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentInput {
  title: string;
  content: string;
  userId: string;
  collaborators?: Collaborator[];
}
