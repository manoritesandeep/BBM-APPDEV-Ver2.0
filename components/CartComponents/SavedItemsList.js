import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SavedItemsContext } from "../../store/saved-items-context";
import { CartContext } from "../../store/cart-context";
import { ProductsContext } from "../../store/products-context";
import { useToast } from "../UI/ToastProvider";
import LoadingState from "../UI/LoadingState";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  layout,
  iconSizes,
  scaleSize,
} from "../../constants/responsive";

function SavedItemsList() {
  const savedItemsCtx = useContext(SavedItemsContext);
  const cartCtx = useContext(CartContext);
  const productsCtx = useContext(ProductsContext);
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  if (savedItemsCtx.savedItems.length === 0) {
    return null;
  }

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleAddToCart = async (savedItem) => {
    try {
      // Find current product data from ProductsContext
      const currentProduct = productsCtx.products.find(
        (p) => p.id === savedItem.productId
      );

      if (!currentProduct) {
        showToast("Product not available", "error");
        return;
      }

      // Add to cart
      cartCtx.addToCart(currentProduct);

      // Remove from saved items
      await savedItemsCtx.removeFromSaved(savedItem.productId);

      showToast("Added to cart and removed from saved list", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add item to cart", "error");
    }
  };

  const handleRemoveFromSaved = async (productId) => {
    try {
      await savedItemsCtx.removeFromSaved(productId);
      showToast("Removed from saved items", "success");
    } catch (error) {
      console.error("Error removing from saved:", error);
      showToast("Failed to remove item", "error");
    }
  };

  const getPriceComparison = (savedItem) => {
    const currentProduct = productsCtx.products.find(
      (p) => p.id === savedItem.productId
    );

    if (!currentProduct) {
      return { status: "unavailable", message: "Product unavailable" };
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
      };
    } else if (currentPrice < savedPrice) {
      return {
        status: "decreased",
        message: `Price dropped from ₹${savedPrice} to ₹${currentPrice}`,
        color: Colors.success500,
        icon: "trending-down",
      };
    } else if (currentDiscount !== savedDiscount) {
      if (currentDiscount > savedDiscount) {
        return {
          status: "better-discount",
          message: `Better discount now - was ${savedDiscount}% off, now ${currentDiscount}% off!`,
          color: Colors.success500,
          icon: "pricetag",
        };
      } else if (currentDiscount < savedDiscount) {
        return {
          status: "discount-expired",
          message: `Discount changed - was ${savedDiscount}% off, now ${currentDiscount}% off`,
          color: Colors.warning500,
          icon: "pricetag-outline",
        };
      }
    }

    return { status: "same", message: null };
  };

  const renderSavedItem = ({ item }) => {
    const priceInfo = getPriceComparison(item);
    const currentProduct = productsCtx.products.find(
      (p) => p.id === item.productId
    );

    return (
      <View style={styles.savedItem}>
        <View style={styles.itemContent}>
          <Image
            source={{
              uri:
                item.imageUrl ||
                "https://via.placeholder.com/60x60?text=No+Image",
            }}
            style={styles.itemImage}
            resizeMode="cover"
          />

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.itemBrand}>
              {item.brand} • {item.sizes}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                ₹{currentProduct?.price || item.savedPrice}
              </Text>
              {priceInfo.message && (
                <View
                  style={[
                    styles.priceChange,
                    { backgroundColor: `${priceInfo.color}15` },
                  ]}
                >
                  <Ionicons
                    name={priceInfo.icon}
                    size={12}
                    color={priceInfo.color}
                  />
                  <Text
                    style={[styles.priceChangeText, { color: priceInfo.color }]}
                  >
                    {priceInfo.status === "increased"
                      ? "↑"
                      : priceInfo.status === "decreased"
                      ? "↓"
                      : priceInfo.status === "better-discount"
                      ? "Better!"
                      : priceInfo.status === "discount-expired"
                      ? "Changed"
                      : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addToCartButton]}
            onPress={() => handleAddToCart(item)}
            disabled={!currentProduct}
          >
            <Ionicons name="cart" size={16} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveFromSaved(item.productId)}
          >
            <Ionicons name="close" size={16} color={Colors.gray600} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayItems = expanded
    ? savedItemsCtx.savedItems
    : savedItemsCtx.savedItems.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handleToggleExpand}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={20} color={Colors.accent500} />
          <Text style={styles.headerTitle}>Saved for later</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {savedItemsCtx.getSavedItemsCount()}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() =>
              navigation.navigate("UserScreen", { screen: "SavedItemsScreen" })
            }
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.gray600}
          />
        </View>
      </TouchableOpacity>

      {/* Items List */}
      {expanded && (
        <View style={styles.itemsList}>
          {savedItemsCtx.isLoading ? (
            <LoadingState type="skeleton-list" />
          ) : (
            <FlatList
              data={displayItems}
              renderItem={renderSavedItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          {!expanded && savedItemsCtx.savedItems.length > 3 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleToggleExpand}
            >
              <Text style={styles.showMoreText}>
                Show {savedItemsCtx.savedItems.length - 3} more
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.accent500}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Preview (when collapsed) */}
      {!expanded && (
        <View style={styles.quickPreview}>
          {savedItemsCtx.savedItems.slice(0, 3).map((item, index) => (
            <Image
              key={item.id}
              source={{
                uri:
                  item.imageUrl ||
                  "https://via.placeholder.com/40x40?text=No+Image",
              }}
              style={[styles.previewImage, { marginLeft: index > 0 ? -8 : 0 }]}
            />
          ))}
          {savedItemsCtx.savedItems.length > 3 && (
            <View style={[styles.previewImage, styles.moreImagesIndicator]}>
              <Text style={styles.moreImagesText}>
                +{savedItemsCtx.savedItems.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default SavedItemsList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  header: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.primary50,
  },
  headerLeft: {
    ...layout.flexRow,
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.accent500,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
  headerActions: {
    ...layout.flexRow,
    alignItems: "center",
  },
  viewAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    marginRight: spacing.xs,
  },
  viewAllText: {
    ...typography.caption,
    color: Colors.accent500,
    fontWeight: "500",
  },
  itemsList: {
    maxHeight: 300,
  },
  savedItem: {
    ...layout.flexRow,
    padding: spacing.md,
    alignItems: "center",
  },
  itemContent: {
    ...layout.flexRow,
    flex: 1,
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemName: {
    ...typography.body,
    fontWeight: "500",
    color: Colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  itemBrand: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    ...layout.flexRow,
    alignItems: "center",
  },
  currentPrice: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginRight: spacing.sm,
  },
  priceChange: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceChangeText: {
    ...typography.caption,
    fontWeight: "500",
    marginLeft: 2,
    fontSize: 10,
  },
  itemActions: {
    ...layout.flexRow,
    alignItems: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  addToCartButton: {
    backgroundColor: Colors.accent500,
  },
  removeButton: {
    backgroundColor: Colors.gray100,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: spacing.md,
  },
  quickPreview: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  moreImagesIndicator: {
    backgroundColor: Colors.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    ...typography.caption,
    color: Colors.gray600,
    fontWeight: "500",
    fontSize: 10,
  },
  showMoreButton: {
    ...layout.flexRow,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: Colors.primary50,
  },
  showMoreText: {
    ...typography.bodySmall,
    color: Colors.accent500,
    fontWeight: "500",
    marginRight: spacing.xs,
  },
});
