import { db } from "./firebaseConfig";
// React Native Firebase v22 modular API imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "@react-native-firebase/firestore";

/**
 * Create a new document in a collection.
 * @param {string} collectionName
 * @param {object} data
 * @param {string} [docId] Optional: set docId, else auto-generated
 * @returns {Promise<string>} The document ID
 */
export async function createDocument(collectionName, data, docId) {
  if (docId) {
    await setDoc(doc(db, collectionName, docId), data);
    return docId;
  } else {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  }
}

/**
 * Read all documents from a collection.
 * @param {string} collectionName
 * @returns {Promise<Array>} Array of documents with id
 */
export async function readCollection(collectionName) {
  try {
    if (!db) {
      throw new Error(
        "Firebase database not initialized. Check your Firebase configuration."
      );
    }
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error(`Failed to read collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Read a single document by ID.
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<object|null>}
 */
export async function readDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update a document.
 * @param {string} collectionName
 * @param {string} docId
 * @param {object} updates
 */
export async function updateDocument(collectionName, docId, updates) {
  await updateDoc(doc(db, collectionName, docId), updates);
}

/**
 * Delete a document.
 * @param {string} collectionName
 * @param {string} docId
 */
export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

/**
 * Query documents with where clause.
 * @param {string} collectionName
 * @param {Array} whereClauses - e.g. [['field', '==', value]]
 * @returns {Promise<Array>}
 */
export async function queryCollection(collectionName, whereClauses = []) {
  let q = collection(db, collectionName);
  if (whereClauses.length) {
    q = query(
      collection(db, collectionName),
      ...whereClauses.map(([field, op, val]) => where(field, op, val))
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// // // Example Usage:
// import {
//   createDocument,
//   readCollection,
//   readDocument,
//   updateDocument,
//   deleteDocument,
//   queryCollection,
// } from "../util/firestoreUtils";

// // Create
// await createDocument("products", { name: "Drill", price: 100 });

// // Read all
// const products = await readCollection("products");

// // Read one
// const product = await readDocument("products", "docId123");

// // Update
// await updateDocument("products", "docId123", { price: 120 });

// // Delete
// await deleteDocument("products", "docId123");

// // Query
// const cheapProducts = await queryCollection("products", [["price", "<", 200]]);
