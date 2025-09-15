import React, { memo, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { typography, spacing, layout } from "../../../constants/responsive";
import { formatProductName } from "../../../util/formatProductName";
import { useI18n } from "../../../store/i18n-context";

const SavedItemCard = memo(function SavedItemCard({
  item,
  currentProduct,
  priceInfo,
  onAddToCart,
  onRemove,
}) {
  const { t } = useI18n();
  // Memoize expensive formatting operation
  const formattedName = useMemo(
    () => formatProductName(item.productName),
    [item.productName]
  );

  // Memoize price badge style to prevent recalculation
  const priceBadgeStyle = useMemo(
    () => [styles.priceBadge, { backgroundColor: `${priceInfo.color}15` }],
    [priceInfo.color]
  );

  // Memoize price badge text style
  const priceBadgeTextStyle = useMemo(
    () => [styles.priceBadgeText, { color: priceInfo.color }],
    [priceInfo.color]
  );

  // Memoize callbacks to prevent child re-renders
  const handleAddToCart = useCallback(() => {
    onAddToCart(item);
  }, [onAddToCart, item]);

  const handleRemove = useCallback(() => {
    onRemove(item.productId, item.productName);
  }, [onRemove, item.productId, item.productName]);

  return (
    <View style={styles.savedItem}>
      <Image
        source={{
          uri:
            item.imageUrl || "https://via.placeholder.com/80x80?text=No+Image",
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {formattedName}
        </Text>

        <Text style={styles.itemInfo}>
          {item.brand} • {item.sizes} • {item.category}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            ₹{currentProduct?.price || item.savedPrice}
          </Text>
          {priceInfo.badge && (
            <View style={priceBadgeStyle}>
              <Text style={priceBadgeTextStyle}>{priceInfo.badge}</Text>
            </View>
          )}
        </View>

        <Text style={styles.savedDate}>
          Saved {item.savedAt.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
          disabled={!currentProduct}
        >
          <Ionicons name="cart" size={20} color={Colors.white} />
          <Text style={styles.actionButtonText}>{t("cart.addToCart")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={handleRemove}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error500} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default SavedItemCard;

const styles = StyleSheet.create({
  savedItem: {
    ...layout.flexRow,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    marginRight: spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  itemInfo: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    ...layout.flexRow,
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },
  currentPrice: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginRight: spacing.sm,
  },
  priceBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceBadgeText: {
    ...typography.caption,
    fontWeight: "500",
    fontSize: 10,
  },
  savedDate: {
    ...typography.caption,
    color: Colors.gray500,
  },
  itemActions: {
    alignItems: "center",
  },
  actionButton: {
    ...layout.flexRow,
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  addToCartButton: {
    backgroundColor: Colors.accent500,
  },
  removeButton: {
    backgroundColor: Colors.error50,
    padding: spacing.xs,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: Colors.white,
    fontWeight: "500",
    marginLeft: spacing.xs / 2,
  },
});
