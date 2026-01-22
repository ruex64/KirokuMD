import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import { Document, DocumentInput, Collaborator, CollaboratorRole } from "@/types/document";
import { createVersion, deleteAllVersions, getLatestVersionNumber } from "./versions";

const COLLECTION_NAME = "documents";

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | null): Date => {
  return timestamp ? timestamp.toDate() : new Date();
};

// Convert collaborator timestamps
const convertCollaborators = (collaborators: any[] = []): Collaborator[] => {
  return collaborators.map((c) => ({
    ...c,
    addedAt: c.addedAt?.toDate ? c.addedAt.toDate() : new Date(c.addedAt),
  }));
};

// Create a new document
export async function createDocument(
  input: DocumentInput,
  createdBy?: { userId: string; email: string; displayName: string | null }
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...input,
    collaborators: input.collaborators || [],
    currentVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create initial version
  if (createdBy) {
    await createVersion(docRef.id, input.title, input.content, 1, createdBy);
  }

  return docRef.id;
}

// Get all documents for a user (owned or collaborated)
export async function getUserDocuments(userId: string): Promise<Document[]> {
  // Get owned documents
  const ownedQuery = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  const ownedSnapshot = await getDocs(ownedQuery);
  const ownedDocs = ownedSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      userId: data.userId,
      collaborators: convertCollaborators(data.collaborators),
      currentVersion: data.currentVersion || 1,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  });

  // Note: Firestore doesn't support array-contains with object matching well
  // For a production app, you'd use a subcollection or separate index
  // For now, we'll fetch all docs where user is a collaborator by getting all and filtering
  // In production, consider using a separate collaborations collection
  
  return ownedDocs;
}

// Get documents shared with user (as collaborator)
export async function getSharedDocuments(userEmail: string): Promise<Document[]> {
  // This is a simplified approach - in production use a separate index
  const allDocsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("updatedAt", "desc")
  );
  
  const snapshot = await getDocs(allDocsQuery);
  const sharedDocs: Document[] = [];
  
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const collaborators = data.collaborators || [];
    const isCollaborator = collaborators.some((c: any) => c.email === userEmail);
    
    if (isCollaborator) {
      sharedDocs.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        collaborators: convertCollaborators(collaborators),
        currentVersion: data.currentVersion || 1,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      });
    }
  });
  
  return sharedDocs;
}

// Get a single document by ID
export async function getDocument(documentId: string): Promise<Document | null> {
  const docRef = doc(db, COLLECTION_NAME, documentId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title,
    content: data.content,
    userId: data.userId,
    collaborators: convertCollaborators(data.collaborators),
    currentVersion: data.currentVersion || 1,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
}

// Check if user has access to document
export function hasDocumentAccess(
  document: Document,
  userId: string,
  userEmail: string
): { hasAccess: boolean; role: "owner" | CollaboratorRole | null } {
  if (document.userId === userId) {
    return { hasAccess: true, role: "owner" };
  }
  
  const collaborator = document.collaborators?.find((c) => c.email === userEmail);
  if (collaborator) {
    return { hasAccess: true, role: collaborator.role };
  }
  
  return { hasAccess: false, role: null };
}

// Update a document (with optional version creation)
export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, "title" | "content">>,
  createNewVersion?: {
    userId: string;
    email: string;
    displayName: string | null;
  }
): Promise<number> {
  const docRef = doc(db, COLLECTION_NAME, documentId);
  
  let newVersionNumber = 0;
  
  if (createNewVersion && (updates.title || updates.content)) {
    // Get current version number and increment
    const latestVersion = await getLatestVersionNumber(documentId);
    newVersionNumber = latestVersion + 1;
    
    // Get current document data to fill in any missing fields
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.data();
    
    const title = updates.title || currentData?.title || "Untitled";
    const content = updates.content ?? currentData?.content ?? "";
    
    // Create new version
    await createVersion(
      documentId,
      title,
      content,
      newVersionNumber,
      createNewVersion
    );
    
    // Update document with new version number
    await updateDoc(docRef, {
      ...updates,
      currentVersion: newVersionNumber,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Simple update without version
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
  
  return newVersionNumber;
}

// Add collaborator to document
export async function addCollaborator(
  documentId: string,
  collaborator: Omit<Collaborator, "addedAt">
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, documentId);
  await updateDoc(docRef, {
    collaborators: arrayUnion({
      ...collaborator,
      addedAt: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  });
}

// Remove collaborator from document
export async function removeCollaborator(
  documentId: string,
  collaboratorEmail: string
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updatedCollaborators = (data.collaborators || []).filter(
      (c: any) => c.email !== collaboratorEmail
    );
    
    await updateDoc(docRef, {
      collaborators: updatedCollaborators,
      updatedAt: serverTimestamp(),
    });
  }
}

// Update collaborator role
export async function updateCollaboratorRole(
  documentId: string,
  collaboratorEmail: string,
  newRole: CollaboratorRole
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updatedCollaborators = (data.collaborators || []).map((c: any) =>
      c.email === collaboratorEmail ? { ...c, role: newRole } : c
    );
    
    await updateDoc(docRef, {
      collaborators: updatedCollaborators,
      updatedAt: serverTimestamp(),
    });
  }
}

// Delete a document (and all its versions)
export async function deleteDocument(documentId: string): Promise<void> {
  // Delete all versions first
  await deleteAllVersions(documentId);
  
  // Then delete the document
  const docRef = doc(db, COLLECTION_NAME, documentId);
  await deleteDoc(docRef);
}
