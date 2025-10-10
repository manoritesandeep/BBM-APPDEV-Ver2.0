import { useState, useMemo, useCallback, memo, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../constants/styles";
import { formatProductName } from "../../util/formatProductName";
import Button from "./Button";
import CompactSizeSelector from "./CompactSizeSelector";
import { useI18n } from "../../store/i18n-context";
import { useTheme } from "../../store/theme-context";
import { CartContext } from "../../store/cart-context";
import { useToast } from "./ToastProvider";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../constants/responsive";

/**
 * HorizontalProductCard - A reusable horizontal product card component
 *
 * This unified component provides a consistent product display across the app:
 * - Used in Category screens for browsing products by category
 * - Used in Search results for displaying search matches
 * - Horizontal layout for better information density
 * - Supports product groups with size variants
 * - Theme-aware with light/dark mode support
 * - Optimized with memoization for performance
 *
 * @param {Object|Array} productGroup - Single product or array of product variants
 * @param {Function} onPress - Callback when card is pressed
 * @param {Function} onAddToCart - Optional custom add to cart handler
 * @param {string} searchQuery - Optional search term for highlighting
 * @param {boolean} isLast - Whether this is the last item in list
 * @param {boolean} showCategory - Whether to display category badge
 * @param {boolean} showHSN - Whether to display HSN code
 */
function HorizontalProductCard({
  productGroup,
  onPress,
  onAddToCart,
  searchQuery,
  isLast = false,
  showCategory = true,
  showHSN = true,
}) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cartCtx = useContext(CartContext);
  const { showToast } = useToast();

  // Handle both single products and product groups
  const products = Array.isArray(productGroup) ? productGroup : [productGroup];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProduct = products[selectedIndex];

  // Memoize formatted product name to avoid recalculation
  const formattedProductName = useMemo(() => {
    const productName = selectedProduct?.productName || "";
    return formatProductName(productName);
  }, [selectedProduct?.productName]);

  // Memoize image source with improved validation
  const imageSource = useMemo(() => {
    // Check if product has a valid image URL
    if (
      selectedProduct?.imageUrl &&
      selectedProduct.imageUrl.trim() !== "" &&
      selectedProduct.imageUrl !== "placeholder" &&
      selectedProduct.imageUrl !== "null" &&
      selectedProduct.imageUrl !== "undefined"
    ) {
      return { uri: selectedProduct.imageUrl };
    }
    // Use placeholder for missing or invalid images
    return require("../../assets/placeholder.png");
  }, [selectedProduct?.imageUrl]);

  // Memoized callback functions
  const handleSizeSelect = useCallback((index, product) => {
    setSelectedIndex(index);
  }, []);

  const handleCardPress = useCallback(() => {
    onPress(productGroup);
  }, [onPress, productGroup]);

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(selectedProduct);
    } else {
      // Default add to cart behavior
      const cleanProduct = {
        id: selectedProduct.id,
        productName: selectedProduct.productName,
        price: selectedProduct.price,
        discount: selectedProduct.discount || 0,
        imageUrl: selectedProduct.imageUrl,
        category: selectedProduct.category,
        sizes: selectedProduct.sizes,
        HSN: selectedProduct.HSN,
        rating: selectedProduct.rating,
        brand: selectedProduct.brand,
      };
      cartCtx.addToCart(cleanProduct, 1);
      showToast(`${formattedProductName} added to cart`, "success");
    }
  }, [onAddToCart, selectedProduct, cartCtx, formattedProductName, showToast]);

  // Highlight search terms in product name
  const renderProductName = (text, query) => {
    // Ensure text is a string
    const safeText = String(text || "");

    if (!query || !safeText) {
      return safeText;
    }

    const regex = new RegExp(`(${query})`, "gi");
    const parts = safeText.split(regex);

    return parts
      .filter((part) => part && part.length > 0) // Filter out empty strings
      .map((part, index) => (
        <Text
          key={`part-${index}`}
          style={regex.test(part) ? styles.highlightedText : styles.normalText}
        >
          {part}
        </Text>
      ));
  };

  // Calculate responsive dimensions
  const cardWidth = screenWidth - spacing.md * 2;
  const imageSize = scaleSize(95);
  const contentWidth = cardWidth - imageSize - spacing.lg * 2;

  // Dynamic styles based on theme
  const styles = StyleSheet.create({
    card: {
      ...layout.flexRow,
      backgroundColor: colors.card,
      borderRadius: scaleSize(12),
      padding: spacing.md,
      width: cardWidth,
      ...deviceAdjustments.shadow,
      shadowColor: isDark ? colors.gray900 : colors.gray700,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border || colors.primary200,
    },
    lastCard: {
      marginBottom: spacing.lg,
    },
    imageContainer: {
      backgroundColor: colors.surface,
      borderRadius: scaleSize(12),
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
      overflow: "hidden",
      width: imageSize,
      height: imageSize + 10,
      borderWidth: 1,
      borderColor: colors.border || colors.primary100,
    },
    image: {
      width: "100%",
      height: "100%",
      backgroundColor: colors.surface,
    },
    detailsContainer: {
      flex: 1,
      justifyContent: "space-between",
      width: contentWidth,
    },
    productName: {
      ...typography.body,
      fontWeight: "600",
      color: colors.text,
      lineHeight: scaleSize(20),
      marginBottom: spacing.xs,
    },
    normalText: {
      color: colors.text,
    },
    highlightedText: {
      backgroundColor: colors.accent200,
      color: colors.accent700,
      fontWeight: "700",
      borderRadius: scaleSize(3),
      paddingHorizontal: scaleSize(2),
    },
    metaRow: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    categoryContainer: {
      backgroundColor: colors.accent100,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: scaleSize(12),
    },
    category: {
      ...typography.captionSmall,
      color: colors.accent700,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    hsn: {
      ...typography.captionSmall,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    sizeSection: {
      marginBottom: spacing.sm,
    },
    sizeSelector: {
      justifyContent: "flex-start",
    },
    priceRatingRow: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    priceContainer: {
      ...layout.flexRow,
      alignItems: "center",
      flex: 1,
    },
    price: {
      ...typography.subheading,
      fontWeight: "700",
      color: colors.accent700,
      marginRight: spacing.sm,
    },
    discount: {
      ...typography.captionSmall,
      color: colors.error700,
      backgroundColor: colors.error100,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: scaleSize(8),
      fontWeight: "600",
    },
    ratingContainer: {
      ...layout.flexRow,
      alignItems: "center",
      backgroundColor: isDark ? colors.primary200 : colors.primary100,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: scaleSize(12),
    },
    rating: {
      ...typography.captionSmall,
      color: colors.text,
      marginLeft: spacing.xs / 2,
      fontWeight: "600",
    },
    sizeInfo: {
      ...typography.caption,
      color: colors.text,
      fontStyle: "italic",
    },
    bottomRow: {
      ...layout.flexRow,
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftContent: {
      flex: 1,
      justifyContent: "center",
    },
    addToCartButton: {
      minWidth: scaleSize(80),
      maxWidth: scaleSize(120),
      paddingVertical: spacing.xs / 5,
      paddingHorizontal: spacing.sm,
      borderRadius: scaleSize(8),
      ...deviceAdjustments.shadow,
      shadowColor: isDark ? colors.gray900 : colors.gray600,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    addToCartButtonText: {
      ...typography.captionMedium,
      fontWeight: "700",
      color: colors.black,
      textAlign: "center",
    },
  });

  return (
    <Pressable
      style={[styles.card, isLast && styles.lastCard]}
      onPress={handleCardPress}
      android_ripple={{
        color: isDark ? colors.primary300 : colors.primary200,
        borderless: false,
      }}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
          onError={() => {
            console.warn(
              "Failed to load product image:",
              selectedProduct.imageUrl
            );
          }}
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Product Name with Optional Search Highlighting */}
        <Text
          style={styles.productName}
          numberOfLines={2}
          allowFontScaling={true}
        >
          {renderProductName(formattedProductName, searchQuery)}
        </Text>

        {/* Category and HSN Row */}
        {(showCategory || showHSN) && (
          <View style={styles.metaRow}>
            {showCategory && selectedProduct?.category && (
              <View style={styles.categoryContainer}>
                <Text style={styles.category} allowFontScaling={true}>
                  {String(selectedProduct.category)}
                </Text>
              </View>
            )}
            {showHSN && selectedProduct?.HSN && (
              <Text style={styles.hsn} allowFontScaling={true}>
                {`HSN: ${String(selectedProduct.HSN)}`}
              </Text>
            )}
          </View>
        )}

        {/* Size Selector - Compact Design */}
        {products.length > 1 && (
          <View style={styles.sizeSection}>
            <CompactSizeSelector
              variants={products}
              initialIndex={selectedIndex}
              onSelect={handleSizeSelect}
              style={styles.sizeSelector}
            />
          </View>
        )}

        {/* Price and Rating Row */}
        <View style={styles.priceRatingRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price} allowFontScaling={true}>
              {`₹${Number(selectedProduct?.price || 0).toLocaleString(
                "en-IN"
              )}`}
            </Text>
            {selectedProduct?.discount > 0 && (
              <Text style={styles.discount} allowFontScaling={true}>
                {`₹${Number(selectedProduct.discount).toLocaleString(
                  "en-IN"
                )} off`}
              </Text>
            )}
          </View>

          {selectedProduct?.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={iconSizes.xs} color="#FFD700" />
              <Text style={styles.rating} allowFontScaling={true}>
                {String(selectedProduct.rating)}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Row: Size Info and Add to Cart */}
        <View style={styles.bottomRow}>
          <View style={styles.leftContent}>
            {/* Size Information for Single Products */}
            {products.length === 1 && selectedProduct?.sizes && (
              <Text style={styles.sizeInfo} allowFontScaling={true}>
                {`${t("common.size") || "Size"}: ${String(
                  selectedProduct.sizes
                )}`}
              </Text>
            )}
          </View>

          {/* Compact Add to Cart Button */}
          <Button
            onPress={handleAddToCart}
            mode="filled"
            style={styles.addToCartButton}
            textStyle={styles.addToCartButtonText}
          >
            {t("common.add") || "Add"}
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

// Memoize the component for better performance
export default memo(HorizontalProductCard);
