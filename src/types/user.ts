export type UserRole = "admin" | "owner" | "editor" | "viewer" | "commenter";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// Document-level access (for shared documents)
export interface DocumentAccess {
  oderId: string; // Document owner
  sharedWith: SharedUser[];
}

export interface SharedUser {
  oderId: string;
  email: string;
  accessLevel: "editor" | "viewer" | "commenter";
  addedAt: Date;
  addedBy: string;
}
