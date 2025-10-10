import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../../store/theme-context";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";
import { formatProductName } from "../../util/formatProductName";
import { useI18n } from "../../store/i18n-context";

/**
 * CategoryCard - Displays a category with preview images of 3-4 representative products
 *
 * This component is designed to optimize browsing experience by showing categories as cards
 * with product previews, reducing cloud costs and improving data loads by loading only
 * category-level data initially.
 *
 * @param {string} category - The category name to display
 * @param {Array} productGroups - Array of product groups belonging to this category
 * @param {Function} onPress - Callback when category card is pressed
 * @param {number} productCount - Total number of products in this category
 */
function CategoryCard({ category, productGroups, onPress, productCount }) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  // Get up to 4 products for preview (one from each group)
  const previewProducts = productGroups.slice(0, 4).map((group) => {
    return Array.isArray(group) ? group[0] : group;
  });

  // Calculate actual count
  const totalCount = productCount || productGroups.length;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: scaleSize(12),
      marginHorizontal: spacing.sm,
      marginVertical: spacing.xs,
      padding: spacing.sm,
      ...deviceAdjustments.shadow,
      elevation: 3,
    },
    header: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    categoryTitle: {
      ...typography.h5,
      color: colors.accent700,
      fontWeight: "bold",
      flex: 1,
    },
    countBadge: {
      backgroundColor: colors.primary500,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs * 0.5,
      borderRadius: scaleSize(12),
      minWidth: scaleSize(40),
      alignItems: "center",
    },
    countText: {
      ...typography.caption,
      color: colors.white,
      fontWeight: "bold",
      fontSize: scaleSize(11),
    },
    previewContainer: {
      ...layout.flexRow,
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    previewImageWrapper: {
      flex: 1,
      aspectRatio: 1,
      marginHorizontal: spacing.xs * 0.25,
      borderRadius: scaleSize(8),
      overflow: "hidden",
      backgroundColor: colors.surface,
      ...deviceAdjustments.shadow,
    },
    previewImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    placeholderImage: {
      width: "100%",
      height: "100%",
      backgroundColor: colors.primary100,
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: scaleSize(10),
    },
    footer: {
      ...layout.flexRow,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border || colors.primary200,
    },
    viewMoreText: {
      ...typography.button,
      color: colors.primary500,
      fontWeight: "600",
      fontSize: scaleSize(13),
    },
    viewMoreIcon: {
      marginLeft: spacing.xs * 0.5,
      color: colors.primary500,
    },
  });

  const formattedCategory = category ? formatProductName(category) : "";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category, productGroups)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${formattedCategory} category with ${totalCount} products`}
      accessibilityHint="Double tap to view all products in this category"
      accessibilityRole="button"
    >
      {/* Header with category name and count */}
      <View style={styles.header}>
        <Text
          style={styles.categoryTitle}
          numberOfLines={1}
          allowFontScaling={true}
        >
          {formattedCategory}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText} allowFontScaling={false}>
            {totalCount}
          </Text>
        </View>
      </View>

      {/* Preview images grid (2x2 or 1x4 based on count) */}
      <View style={styles.previewContainer}>
        {previewProducts.length > 0 ? (
          previewProducts.map((product, index) => (
            <View
              key={`${product.id}-${index}`}
              style={styles.previewImageWrapper}
            >
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.previewImage}
                  defaultSource={require("../../assets/placeholder.png")}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          // Fallback for empty category
          <View style={styles.previewImageWrapper}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Products</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer with "View More" text */}
      <View style={styles.footer}>
        <Text style={styles.viewMoreText} allowFontScaling={true}>
          {t("home.viewAllProducts") || "View All Products"}
        </Text>
        <Text style={styles.viewMoreIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default CategoryCard;
