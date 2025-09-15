import { useState, useMemo, useCallback, memo } from "react";
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
import Button from "../UI/Button";
import CompactSizeSelector from "../UI/CompactSizeSelector";
import { useI18n } from "../../store/i18n-context";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../constants/responsive";

function SearchResultCard({
  productGroup, // Now expects a group of products with same name
  onPress,
  onAddToCart,
  searchQuery,
  isLast = false,
}) {
  const { t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();

  // Handle both single products and product groups
  const products = Array.isArray(productGroup) ? productGroup : [productGroup];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProduct = products[selectedIndex];

  // Memoize formatted product name to avoid recalculation
  const formattedProductName = useMemo(
    () => formatProductName(selectedProduct.productName),
    [selectedProduct.productName]
  );

  // Memoize image source with improved validation
  const imageSource = useMemo(() => {
    // Check if product has a valid image URL
    if (
      selectedProduct.imageUrl &&
      selectedProduct.imageUrl.trim() !== "" &&
      selectedProduct.imageUrl !== "placeholder" &&
      selectedProduct.imageUrl !== "null" &&
      selectedProduct.imageUrl !== "undefined"
    ) {
      return { uri: selectedProduct.imageUrl };
    }
    // Use placeholder for missing or invalid images
    return require("../../assets/placeholder.png");
  }, [selectedProduct.imageUrl]);

  // Memoized callback functions
  const handleSizeSelect = useCallback((index, product) => {
    setSelectedIndex(index);
  }, []);

  const handleCardPress = useCallback(() => {
    onPress(productGroup);
  }, [onPress, productGroup]);

  const handleAddToCart = useCallback(() => {
    onAddToCart && onAddToCart(selectedProduct);
  }, [onAddToCart, selectedProduct]);

  // Highlight search terms in product name
  const highlightSearchTerms = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => (
      <Text
        key={index}
        style={regex.test(part) ? styles.highlightedText : styles.normalText}
      >
        {part}
      </Text>
    ));
  };

  // Calculate responsive dimensions
  const cardWidth = screenWidth - spacing.lg * 0.85; // Use responsive spacing
  const imageSize = scaleSize(95); // Fixed square image size like cart items
  const contentWidth = cardWidth - imageSize - spacing.lg * 2; // Account for padding

  return (
    <Pressable
      style={[styles.card, { width: cardWidth }, isLast && styles.lastCard]}
      onPress={handleCardPress}
      android_ripple={{ color: Colors.primary200, borderless: false }}
    >
      {/* Product Image */}
      <View
        style={[
          styles.imageContainer,
          { width: imageSize, height: imageSize + 10 },
        ]}
      >
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
      <View style={[styles.detailsContainer, { width: contentWidth }]}>
        {/* Product Name with Search Highlighting */}
        <Text style={styles.productName} numberOfLines={2}>
          {highlightSearchTerms(formattedProductName, searchQuery)}
        </Text>

        {/* Category and HSN Row */}
        <View style={styles.metaRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{selectedProduct.category}</Text>
          </View>
          {selectedProduct.HSN && (
            <Text style={styles.hsn}>HSN: {selectedProduct.HSN}</Text>
          )}
        </View>

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
            <Text style={styles.price}>
              ₹{Number(selectedProduct.price).toLocaleString("en-IN")}
            </Text>
            {selectedProduct.discount > 0 && (
              <Text style={styles.discount}>
                ₹{Number(selectedProduct.discount).toLocaleString("en-IN")} off
              </Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={iconSizes.xs} color="#FFD700" />
            <Text style={styles.rating}>{selectedProduct.rating}</Text>
          </View>
        </View>

        {/* Bottom Row: Size Info and Add to Cart */}
        <View style={styles.bottomRow}>
          <View style={styles.leftContent}>
            {/* Size Information for Single Products */}
            {products.length === 1 && selectedProduct.sizes && (
              <Text style={styles.sizeInfo}>
                {t("common.size")}: {selectedProduct.sizes}
              </Text>
            )}
          </View>

          {/* Compact Add to Cart Button - Always on the right */}
          <Button
            onPress={handleAddToCart}
            mode="filled"
            style={styles.addToCartButton}
            textStyle={styles.addToCartButtonText}
          >
            {t("common.add")}
          </Button>
        </View>

        {/* Debug Info - Development only */}
        {selectedProduct.searchScore && __DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.scoreText}>
              Match: {Math.round((1 - selectedProduct.searchScore) * 100)}%
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Memoize the component for better performance - prevent unnecessary re-renders
export default memo(SearchResultCard);

const styles = StyleSheet.create({
  card: {
    ...layout.flexRow,
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    // marginVertical: spacing.xs,
    // marginHorizontal: spacing.xs,
    padding: spacing.md,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  lastCard: {
    marginBottom: spacing.lg,
  },
  imageContainer: {
    backgroundColor: "white",
    borderRadius: scaleSize(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    lineHeight: scaleSize(20),
    marginBottom: spacing.xs,
  },
  normalText: {
    color: Colors.gray900,
  },
  highlightedText: {
    backgroundColor: Colors.accent200,
    color: Colors.accent700,
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
    backgroundColor: Colors.accent100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(12),
  },
  category: {
    ...typography.captionSmall,
    color: Colors.accent700,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hsn: {
    ...typography.captionSmall,
    color: Colors.gray600,
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
    color: Colors.accent700,
    marginRight: spacing.sm,
  },
  discount: {
    ...typography.captionSmall,
    color: Colors.error700,
    backgroundColor: Colors.error100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(8),
    fontWeight: "600",
  },
  ratingContainer: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(12),
  },
  rating: {
    ...typography.captionSmall,
    color: Colors.gray700,
    marginLeft: spacing.xs / 2,
    fontWeight: "600",
  },
  sizeInfo: {
    ...typography.caption,
    color: Colors.gray900,
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
    paddingVertical: spacing.xs / 5, // Much thinner button
    paddingHorizontal: spacing.sm,
    borderRadius: scaleSize(8),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray600,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  addToCartButtonText: {
    ...typography.captionMedium,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  debugInfo: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  scoreText: {
    ...typography.captionSmall,
    color: Colors.gray400,
    fontStyle: "italic",
  },
});
