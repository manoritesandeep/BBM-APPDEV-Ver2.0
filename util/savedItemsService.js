import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  serverTimestamp,
  writeBatch,
} from "@react-native-firebase/firestore";
import { db } from "./firebaseConfig";

const COLLECTION_NAME = "savedItems";

/**
 * Add a product to saved items
 * @param {string} userId - User ID
 * @param {object} product - Product object from DUMMY_PRODUCTS
 * @returns {Promise<object>} - Saved item document
 */
export const addToSavedItems = async (userId, product) => {
  try {
    // Check if item is already saved
    const existingItem = await checkIfItemSaved(userId, product.id);
    if (existingItem) {
      throw new Error("Item is already saved");
    }

    // Create saved item document
    const savedItemData = {
      userId,
      productId: product.id, // Use 'id' field from DUMMY_PRODUCTS
      productNum: product.productNum,
      productName: product.productName,
      HSN: product.HSN || "",
      sizes: product.sizes || "",
      colour: product.colour || "",
      subCategory: product.subCategory || "",
      category: product.category || "",
      brand: product.brand || "",
      imageUrl: product.imageUrl || "",
      rating: product.rating || 0,
      rentable: product.rentable || false,
      material: product.material || "",
      savedPrice: product.price || 0,
      savedDiscount: product.discount || 0,
      savedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), savedItemData);

    return {
      id: docRef.id,
      ...savedItemData,
      savedAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error adding to saved items:", error);
    throw error;
  }
};

/**
 * Remove a product from saved items
 * @param {string} userId - User ID
 * @param {number} productId - Product ID to remove
 */
export const removeFromSavedItems = async (userId, productId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("productId", "==", productId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Item not found in saved items");
    }

    // Delete all matching documents (should be only one)
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
    });

    await batch.commit();
  } catch (error) {
    console.error("Error removing from saved items:", error);
    throw error;
  }
};

/**
 * Get all saved items for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of saved items
 */
export const getSavedItems = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("savedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const savedItems = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      savedItems.push({
        id: document.id,
        ...data,
        savedAt: data.savedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return savedItems;
  } catch (error) {
    console.error("Error getting saved items:", error);
    throw error;
  }
};

/**
 * Check if a specific item is already saved
 * @param {string} userId - User ID
 * @param {number} productId - Product ID to check
 * @returns {Promise<boolean>} - True if item is saved
 */
export const checkIfItemSaved = async (userId, productId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("productId", "==", productId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if item is saved:", error);
    return false;
  }
};

/**
 * Clear all saved items for a user
 * @param {string} userId - User ID
 */
export const clearAllSavedItems = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
    });

    await batch.commit();
  } catch (error) {
    console.error("Error clearing saved items:", error);
    throw error;
  }
};

/**
 * Get saved items count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of saved items
 */
export const getSavedItemsCount = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting saved items count:", error);
    return 0;
  }
};
