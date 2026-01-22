import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { DocumentVersion } from "@/types/document";

const COLLECTION_NAME = "documentVersions";
const MAX_VERSIONS = 25;

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | null): Date => {
  return timestamp ? timestamp.toDate() : new Date();
};

// Convert Firestore document to DocumentVersion
const convertVersion = (id: string, data: any): DocumentVersion => {
  return {
    id,
    documentId: data.documentId,
    versionNumber: data.versionNumber,
    title: data.title,
    content: data.content,
    createdAt: convertTimestamp(data.createdAt),
    createdBy: {
      userId: data.createdBy?.userId || "",
      email: data.createdBy?.email || "",
      displayName: data.createdBy?.displayName || null,
    },
  };
};

// Create a new version for a document
export async function createVersion(
  documentId: string,
  title: string,
  content: string,
  versionNumber: number,
  createdBy: { userId: string; email: string; displayName: string | null }
): Promise<string> {
  // Add the new version
  const versionRef = await addDoc(collection(db, COLLECTION_NAME), {
    documentId,
    versionNumber,
    title,
    content,
    createdBy,
    createdAt: serverTimestamp(),
  });

  // Clean up old versions if we exceed the limit
  await pruneOldVersions(documentId);

  return versionRef.id;
}

// Get version history for a document (most recent first)
export async function getVersionHistory(
  documentId: string
): Promise<DocumentVersion[]> {
  const versionsQuery = query(
    collection(db, COLLECTION_NAME),
    where("documentId", "==", documentId),
    orderBy("versionNumber", "desc"),
    limit(MAX_VERSIONS)
  );

  const snapshot = await getDocs(versionsQuery);
  return snapshot.docs.map((doc) => convertVersion(doc.id, doc.data()));
}

// Get a specific version by ID
export async function getVersion(
  versionId: string
): Promise<DocumentVersion | null> {
  const versionRef = doc(db, COLLECTION_NAME, versionId);
  const snapshot = await getDoc(versionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return convertVersion(snapshot.id, snapshot.data());
}

// Get the latest version number for a document
export async function getLatestVersionNumber(
  documentId: string
): Promise<number> {
  const versionsQuery = query(
    collection(db, COLLECTION_NAME),
    where("documentId", "==", documentId),
    orderBy("versionNumber", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(versionsQuery);
  
  if (snapshot.empty) {
    return 0;
  }

  return snapshot.docs[0].data().versionNumber || 0;
}

// Delete old versions beyond the limit
async function pruneOldVersions(documentId: string): Promise<void> {
  const versionsQuery = query(
    collection(db, COLLECTION_NAME),
    where("documentId", "==", documentId),
    orderBy("versionNumber", "desc")
  );

  const snapshot = await getDocs(versionsQuery);
  
  if (snapshot.size <= MAX_VERSIONS) {
    return; // Nothing to prune
  }

  // Get versions to delete (beyond MAX_VERSIONS)
  const versionsToDelete = snapshot.docs.slice(MAX_VERSIONS);
  
  // Use batch delete for efficiency
  const batch = writeBatch(db);
  versionsToDelete.forEach((versionDoc) => {
    batch.delete(versionDoc.ref);
  });

  await batch.commit();
}

// Delete all versions for a document (when document is deleted)
export async function deleteAllVersions(documentId: string): Promise<void> {
  const versionsQuery = query(
    collection(db, COLLECTION_NAME),
    where("documentId", "==", documentId)
  );

  const snapshot = await getDocs(versionsQuery);
  
  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((versionDoc) => {
    batch.delete(versionDoc.ref);
  });

  await batch.commit();
}

// Get version count for a document
export async function getVersionCount(documentId: string): Promise<number> {
  const versionsQuery = query(
    collection(db, COLLECTION_NAME),
    where("documentId", "==", documentId)
  );

  const snapshot = await getDocs(versionsQuery);
  return snapshot.size;
}

// Compare two versions (returns diff info)
export function compareVersions(
  version1: DocumentVersion,
  version2: DocumentVersion
): {
  titleChanged: boolean;
  contentLengthDiff: number;
} {
  return {
    titleChanged: version1.title !== version2.title,
    contentLengthDiff: version2.content.length - version1.content.length,
  };
}
