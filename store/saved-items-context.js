import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./auth-context";
import {
  addToSavedItems,
  removeFromSavedItems,
  getSavedItems,
  clearAllSavedItems,
} from "../util/savedItemsService";

export const SavedItemsContext = createContext({
  savedItems: [],
  savedItemIds: new Set(),
  isLoading: false,
  addToSaved: (product) => {},
  removeFromSaved: (productId) => {},
  clearSaved: () => {},
  refreshSavedItems: () => {},
  isSaved: (productId) => false,
  getSavedItemsCount: () => 0,
});

function SavedItemsContextProvider({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const [savedItemIds, setSavedItemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);

  // Load saved items when user authenticates
  useEffect(() => {
    if (authCtx.isAuthenticated && authCtx.userId) {
      loadSavedItems();
    } else {
      // Clear saved items when user logs out
      setSavedItems([]);
      setSavedItemIds(new Set());
    }
  }, [authCtx.isAuthenticated, authCtx.userId]);

  const loadSavedItems = async () => {
    if (!authCtx.userId) return;

    setIsLoading(true);
    try {
      const items = await getSavedItems(authCtx.userId);
      setSavedItems(items);
      setSavedItemIds(new Set(items.map((item) => item.productId)));
    } catch (error) {
      console.error("Error loading saved items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToSaved = async (product) => {
    if (!authCtx.userId) {
      throw new Error("User must be authenticated to save items");
    }

    try {
      setIsLoading(true);
      const savedItem = await addToSavedItems(authCtx.userId, product);

      setSavedItems((prev) => [savedItem, ...prev]);
      setSavedItemIds((prev) => new Set([...prev, product.id]));

      return savedItem;
    } catch (error) {
      console.error("Error adding to saved items:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromSaved = async (productId) => {
    if (!authCtx.userId) return;

    try {
      setIsLoading(true);
      await removeFromSavedItems(authCtx.userId, productId);

      setSavedItems((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      setSavedItemIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error("Error removing from saved items:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSaved = async () => {
    if (!authCtx.userId) return;

    try {
      setIsLoading(true);
      await clearAllSavedItems(authCtx.userId);
      setSavedItems([]);
      setSavedItemIds(new Set());
    } catch (error) {
      console.error("Error clearing saved items:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSavedItems = async () => {
    await loadSavedItems();
  };

  const isSaved = (productId) => {
    return savedItemIds.has(productId);
  };

  const getSavedItemsCount = () => {
    return savedItems.length;
  };

  const value = {
    savedItems,
    savedItemIds,
    isLoading,
    addToSaved,
    removeFromSaved,
    clearSaved,
    refreshSavedItems,
    isSaved,
    getSavedItemsCount,
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export default SavedItemsContextProvider;
