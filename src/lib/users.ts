import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { AppUser, UserRole, ApprovalStatus } from "@/types/user";

const USERS_COLLECTION = "users";

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | null): Date => {
  return timestamp ? timestamp.toDate() : new Date();
};

// Create a new user (called after Firebase Auth signup)
export const createUser = async (
  uid: string,
  email: string,
  displayName: string | null
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  
  // Check if any users exist - first user becomes admin
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
  const isFirstUser = usersSnapshot.empty;

  await setDoc(userRef, {
    uid,
    email,
    displayName,
    role: isFirstUser ? "admin" : "owner",
    status: isFirstUser ? "approved" : "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(isFirstUser && {
      approvedBy: "system",
      approvedAt: serverTimestamp(),
    }),
  });
};

// Get user by ID
export const getUser = async (uid: string): Promise<AppUser | null> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    status: data.status,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    approvedBy: data.approvedBy,
    approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
  };
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<AppUser[]> => {
  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      status: data.status,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
    };
  });
};

// Get pending users (admin only)
export const getPendingUsers = async (): Promise<AppUser[]> => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      status: data.status,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  });
};

// Approve user (admin only)
export const approveUser = async (
  uid: string,
  adminUid: string,
  role: UserRole = "owner"
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: "approved",
    role,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Reject user (admin only)
export const rejectUser = async (uid: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
};

// Update user role (admin only)
export const updateUserRole = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
};

// Update user status (admin only)
export const updateUserStatus = async (
  uid: string,
  status: ApprovalStatus
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Check if user is admin
export const isAdmin = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user?.role === "admin" && user?.status === "approved";
};

// Check if user is approved
export const isApproved = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user?.status === "approved";
};

// Check if user can create documents (admin and owner only)
export const canCreateDocuments = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user?.status === "approved" && (user?.role === "admin" || user?.role === "owner");
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: "Admin",
    owner: "Owner",
    editor: "Editor",
    viewer: "Viewer",
    commenter: "Commenter",
  };
  return roleNames[role] || role;
};

// Get role description
export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    admin: "Full platform access, can manage all users and documents",
    owner: "Can create documents and manage access to their files",
    editor: "Can edit documents shared with them",
    viewer: "Can only view documents shared with them",
    commenter: "Can view and comment on documents shared with them",
  };
  return descriptions[role] || "";
};
