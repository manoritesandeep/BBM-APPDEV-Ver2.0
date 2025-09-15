import { useContext, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { SavedItemsContext } from "../../../store/saved-items-context";
import { CartContext } from "../../../store/cart-context";
import { Colors } from "../../../constants/styles";
import { DUMMY_PRODUCTS } from "../../../data/dummy-data";

export function useSavedItemsLogic(showToast) {
  const savedItemsCtx = useContext(SavedItemsContext);
  const cartCtx = useContext(CartContext);

  // Memoize the product lookup function to avoid creating new instances
  const getProductById = useCallback((productId) => {
    return DUMMY_PRODUCTS.find((p) => p.id === productId);
  }, []);

  // Memoize the price comparison function to avoid recalculations
  const getPriceComparison = useCallback(
    (savedItem) => {
      const currentProduct = getProductById(savedItem.productId);

      if (!currentProduct) {
        return {
          status: "unavailable",
          message: "Product unavailable",
          color: Colors.error500,
        };
      }

      const savedPrice = savedItem.savedPrice;
      const currentPrice = currentProduct.price;
      const savedDiscount = savedItem.savedDiscount || 0;
      const currentDiscount = currentProduct.discount || 0;

      if (currentPrice > savedPrice) {
        return {
          status: "increased",
          message: `Price increased from ₹${savedPrice} to ₹${currentPrice}`,
          color: Colors.error500,
          icon: "trending-up",
          badge: "Price ↑",
        };
      } else if (currentPrice < savedPrice) {
        return {
          status: "decreased",
          message: `Price dropped from ₹${savedPrice} to ₹${currentPrice}`,
          color: Colors.success500,
          icon: "trending-down",
          badge: "Price ↓",
        };
      } else if (currentDiscount !== savedDiscount) {
        if (currentDiscount > savedDiscount) {
          return {
            status: "better-discount",
            message: `Better discount now - was ${savedDiscount}% off, now ${currentDiscount}% off!`,
            color: Colors.success500,
            icon: "pricetag",
            badge: "Better Deal!",
          };
        } else if (currentDiscount < savedDiscount) {
          return {
            status: "discount-expired",
            message: `Discount changed - was ${savedDiscount}% off, now ${currentDiscount}% off`,
            color: Colors.warning500,
            icon: "pricetag-outline",
            badge: "Discount Changed",
          };
        }
      }

      return { status: "same", message: null };
    },
    [getProductById]
  );

  const handleAddToCart = useCallback(
    async (savedItem) => {
      try {
        const currentProduct = getProductById(savedItem.productId);

        if (!currentProduct) {
          showToast("Product not available", "error");
          return;
        }

        cartCtx.addToCart(currentProduct);
        await savedItemsCtx.removeFromSaved(savedItem.productId);
        showToast("Added to cart and removed from saved items", "success");
      } catch (error) {
        console.error("Error adding to cart:", error);
        showToast("Failed to add item to cart", "error");
      }
    },
    [getProductById, cartCtx, savedItemsCtx, showToast]
  );

  const handleRemoveFromSaved = useCallback(
    async (productId, productName) => {
      Alert.alert("Remove Item", `Remove ${productName} from saved items?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await savedItemsCtx.removeFromSaved(productId);
              showToast("Removed from saved items", "success");
            } catch (error) {
              console.error("Error removing from saved:", error);
              showToast("Failed to remove item", "error");
            }
          },
        },
      ]);
    },
    [savedItemsCtx, showToast]
  );

  const handleAddAllToCart = useCallback(() => {
    Alert.alert(
      "Add All to Cart",
      `Add all ${savedItemsCtx.savedItems.length} items to cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add All",
          onPress: async () => {
            let successCount = 0;
            const itemsToAdd = [...savedItemsCtx.savedItems];

            for (const savedItem of itemsToAdd) {
              try {
                const currentProduct = getProductById(savedItem.productId);
                if (currentProduct) {
                  cartCtx.addToCart(currentProduct);
                  successCount++;
                }
              } catch (error) {
                console.error("Error adding item to cart:", error);
              }
            }

            if (successCount > 0) {
              try {
                await savedItemsCtx.clearSaved();
                showToast(
                  `Added ${successCount} items to cart and cleared saved list`,
                  "success"
                );
              } catch (error) {
                showToast(`Added ${successCount} items to cart`, "success");
              }
            }
          },
        },
      ]
    );
  }, [savedItemsCtx, getProductById, cartCtx, showToast]);

  const handleClearAll = useCallback(() => {
    Alert.alert("Clear All", "Remove all items from saved list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          try {
            await savedItemsCtx.clearSaved();
            showToast("Cleared all saved items", "success");
          } catch (error) {
            console.error("Error clearing saved items:", error);
            showToast("Failed to clear saved items", "error");
          }
        },
      },
    ]);
  }, [savedItemsCtx, showToast]);

  const handleRefresh = useCallback(async () => {
    try {
      await savedItemsCtx.refreshSavedItems();
    } catch (error) {
      console.error("Error refreshing saved items:", error);
      showToast("Failed to refresh", "error");
    }
  }, [savedItemsCtx, showToast]);

  return useMemo(
    () => ({
      savedItemsCtx,
      getProductById,
      getPriceComparison,
      handleAddToCart,
      handleRemoveFromSaved,
      handleAddAllToCart,
      handleClearAll,
      handleRefresh,
    }),
    [
      savedItemsCtx,
      getProductById,
      getPriceComparison,
      handleAddToCart,
      handleRemoveFromSaved,
      handleAddAllToCart,
      handleClearAll,
      handleRefresh,
    ]
  );
}
